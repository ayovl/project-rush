import { NextRequest, NextResponse } from 'next/server'
import Joi from 'joi'
import { createClient } from '@/lib/supabase/server'
import { ideogramService } from '@/services/ideogramService'
import { GenerationService } from '@/services/generationService'

// Validation schema for generation request
const generateSchema = Joi.object({
  prompt: Joi.string().min(10).max(1000).required(),
  aspectRatio: Joi.string().valid(
    '1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21', '2:3', '3:2'
  ).default('1:1'),
  styleType: Joi.string().valid(
    'REALISTIC', 'DESIGN', 'GENERAL', 'FICTION', 'AUTO'
  ).default('REALISTIC'),
  numImages: Joi.number().integer().min(1).max(4).default(4),
  renderingSpeed: Joi.string().valid(
    'TURBO', 'DEFAULT', 'QUALITY'
  ).default('TURBO'),
  magicPrompt: Joi.boolean().default(false)
})

// Helper function to authenticate user
async function authenticateUser() {
  const supabase = await createClient()
  
  // Get user from Supabase Auth session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Get user profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, credits, is_active')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.is_active) {
    throw new Error('User profile not found or inactive')
  }

  return profile
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser()

    // Parse multipart form data
    const formData = await request.formData()
    
    // Extract text fields
    const prompt = formData.get('prompt') as string
    const aspectRatio = formData.get('aspectRatio') as string || '1:1'
    const styleType = formData.get('styleType') as string || 'REALISTIC'
    const numImages = parseInt(formData.get('numImages') as string || '4')
    const renderingSpeed = formData.get('renderingSpeed') as string || 'TURBO'
    const magicPrompt = formData.get('magicPrompt') === 'true'

    // Extract file fields
    const characterReferenceImage = formData.get('characterReferenceImage') as File | null
    const characterReferenceMask = formData.get('characterReferenceMask') as File | null

    // Validate text data
    const { error, value } = generateSchema.validate({
      prompt,
      aspectRatio,
      styleType,
      numImages,
      renderingSpeed,
      magicPrompt
    })

    if (error) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.details },
        { status: 400 }
      )
    }

    // Validate character reference image if provided
    if (characterReferenceImage) {
      const validation = ideogramService.validateCharacterImage(characterReferenceImage)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }
    }

    // Calculate required credits
    const requiredCredits = ideogramService.calculateCredits(
      numImages,
      renderingSpeed,
      !!characterReferenceImage
    )

    // Check if user has enough credits
    if (user.credits < requiredCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: requiredCredits,
          available: user.credits
        },
        { status: 402 }
      )
    }

    // Create generation record
    const generation = await GenerationService.createGeneration({
      user_id: user.id,
      prompt: value.prompt,
      aspect_ratio: value.aspectRatio,
      style_type: value.styleType,
      num_images: value.numImages,
      rendering_speed: value.renderingSpeed,
      magic_prompt: value.magicPrompt,
      character_reference_url: characterReferenceImage ? 'pending_upload' : null,
      credits_used: requiredCredits,
      status: 'pending'
    })

    if (!generation) {
      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Update generation status to generating
    await GenerationService.updateGenerationStatus(generation.id, 'generating')

    try {
      // Call Ideogram API
      const ideogramResponse = await ideogramService.generateImages({
        prompt: value.prompt,
        characterReferenceImage,
        characterReferenceMask,
        aspectRatio: value.aspectRatio,
        styleType: value.styleType,
        numImages: value.numImages,
        renderingSpeed: value.renderingSpeed,
        magicPrompt: value.magicPrompt
      })

      // Extract image URLs
      const generatedImages = ideogramResponse.data.map(img => img.url)

      // Update generation with results
      const completedGeneration = await GenerationService.completeGeneration(
        generation.id,
        generatedImages,
        ideogramResponse
      )

      // Deduct credits from user
      const supabase = await createClient()
      await supabase
        .from('profiles')
        .update({ 
          credits: user.credits - requiredCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return NextResponse.json({
        message: 'Images generated successfully',
        generation: {
          id: completedGeneration?.id,
          prompt: value.prompt,
          images: generatedImages,
          creditsUsed: requiredCredits,
          remainingCredits: user.credits - requiredCredits
        }
      }, { status: 200 })

    } catch (ideogramError) {
      // Mark generation as failed
      await GenerationService.failGeneration(generation.id, ideogramError)

      console.error('Ideogram generation failed:', ideogramError)
      return NextResponse.json(
        { 
          error: 'Image generation failed',
          details: ideogramError instanceof Error ? ideogramError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Generation API error:', error)
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
