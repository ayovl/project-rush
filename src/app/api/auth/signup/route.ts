import { NextRequest, NextResponse } from 'next/server'
import Joi from 'joi'
import { createClient } from '@/lib/supabase/server'

// Validation schema for signup
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(50).required()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { error, value } = signupSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.details },
        { status: 400 }
      )
    }

    const { email, password, name } = value

    // Create Supabase client
    const supabase = await createClient()

    // Create user with Supabase Auth (this handles everything automatically)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // The profile is created automatically by the database trigger
    // We just need to return success response
    return NextResponse.json({
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: name
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
