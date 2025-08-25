'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon
} from '@heroicons/react/24/outline'

// Custom components
import ImageUpload from '@/components/ImageUpload'
import ScenarioSelector from '@/components/ScenarioSelector'
import AspectRatioSelector from '@/components/AspectRatioSelector'
import GeneratedResults from '@/components/GeneratedResults'
import ProfileMenu from '@/components/ProfileMenu'

export default function MainApp() {
  const [prompt, setPrompt] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [selectedScenario, setSelectedScenario] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // When the selected scenario changes, set the prompt if the user hasn't typed anything
  useEffect(() => {
    const scenarioPrompts: Record<string, string> = {
      'professional-headshot': 'Professional business headshot, clean background, confident expression, professional attire',
      'casual-portrait': 'Casual portrait photo, natural lighting, relaxed expression, everyday clothing',
      'artistic-creative': 'Creative artistic portrait, dramatic lighting, artistic composition, expressive mood',
      'outdoor-lifestyle': 'Outdoor lifestyle photo, natural environment, candid expression, casual outdoor setting',
      'fashion-style': 'Fashion style photo, trendy outfit, stylish pose, modern aesthetic',
      'vintage-retro': 'Vintage retro style photo, classic aesthetic, nostalgic mood, retro fashion'
    }
    
    if (selectedScenario && !prompt) {
      setPrompt(scenarioPrompts[selectedScenario] || '')
    }
  }, [selectedScenario, prompt])

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedScenario) return
    
    setIsGenerating(true)
    setError(null) // Clear any previous errors
    
    try {
      // Call your backend API
      const formData = new FormData()
      if (uploadedImage) {
        formData.append('image', uploadedImage)
      }
      formData.append('prompt', prompt || selectedScenario)
      formData.append('aspectRatio', aspectRatio)
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'SERVICE_UNAVAILABLE') {
          setError(data.message || 'Image generation service is temporarily unavailable')
        } else {
          setError(data.error || 'Generation failed. Please try again.')
        }
        return
      }
      
      setResults(data.results || [])
      
    } catch (error) {
      console.error('Generation failed:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] text-[#E6EEF3]">
      <div className="relative min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6"
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#00D1FF] to-[#0099CC] rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/10">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white/90">Seem</span>
          </motion.div>

          {/* Profile Menu */}
          <ProfileMenu />
        </motion.header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 pb-12">
          {/* Wrapper for vertical centering */}
          <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center">
            {/* Central Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
            {/* Headline and description */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Imagine Yourself in Any Scenario</h1>
              <p className="text-base sm:text-lg text-white/60 max-w-1xl mx-auto mb-6">Create realistic images of yourself in any outfit, style, or setting with just one photo.</p>
            </div>

            {/* Glassmorphism Container */}
            <div className="relative max-w-3xl mx-auto">
              {/* Multiple glow layers for depth */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#00D1FF]/20 via-[#00D1FF]/30 to-[#00D1FF]/20 rounded-3xl blur-xl opacity-75" />
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00D1FF]/30 via-[#00D1FF]/40 to-[#00D1FF]/30 rounded-2xl blur-lg opacity-50" />

              {/* Main layout with style selector outside */}
              <div className="flex items-start space-x-4">
                {/* Main input field */}
                <div className="flex-1 relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl shadow-black/20">
                  {/* Input content with image reference inside */}
                  <div className="relative p-5">
                    {/* Main content area with image and text */}
                    <div className="flex items-start space-x-4">
                      {/* Image Reference - Larger, inside input, left side */}
                      <div className="flex-shrink-0">
                        <ImageUpload 
                          onImageUpload={setUploadedImage}
                          uploadedImage={uploadedImage}
                          isDemo={false}
                        />
                      </div>
                      
                      {/* Text area - flows to the right of image */}
                      <div className="flex-1">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={"Describe what you want to generate..."}
                          className="w-full h-24 bg-transparent text-white/90 placeholder-white/40 resize-none border-none outline-none text-lg leading-relaxed"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                    </div>

                    {/* Bottom controls inside the input */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                      {/* Left: Aspect Ratio */}
                      <div className="flex-shrink-0">
                        <AspectRatioSelector 
                          selected={aspectRatio}
                          onSelect={setAspectRatio}
                        />
                      </div>
                      
                      {/* Right: Generate Button */}
                      <motion.button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-5 py-2 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 backdrop-blur-sm border border-white/20 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all duration-300 text-sm"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <SparklesIcon className="w-4 h-4" />
                        <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Style Selector - Outside main input, right side */}
                <div className="flex-shrink-0">
                  <ScenarioSelector 
                    selected={selectedScenario}
                    onSelect={setSelectedScenario}
                    onPromptUpdate={setPrompt}
                  />
                </div>
              </div>
            </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 max-w-3xl mx-auto"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-medium">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 text-red-300 hover:text-red-100 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results Section */}
            <GeneratedResults results={results} isGenerating={isGenerating} />
          </div>
        </main>
      </div>
    </div>
  )
}
