'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon, 
  PhotoIcon, 
  UserCircleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

// Custom components
import ImageUpload from '@/components/ImageUpload'
import DemoScenarioSelector from '@/components/DemoScenarioSelector'
import AspectRatioSelector from '@/components/AspectRatioSelector'
import GeneratedResults from '@/components/GeneratedResults'
import ProfileMenu from '@/components/ProfileMenu'

// Demo results - these will be shown after "generation"
const demoResults = {
  'professional-headshot': [
    '/api/placeholder/400x400?text=Professional+Demo+1',
    '/api/placeholder/400x400?text=Professional+Demo+2'
  ],
  'artistic-creative': [
    '/api/placeholder/400x400?text=Artistic+Demo+1', 
    '/api/placeholder/400x400?text=Artistic+Demo+2'
  ]
}

export default function DemoPage() {
  const [prompt, setPrompt] = useState('')
  // Pre-load with demo image (will be set automatically)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  // Set first available demo scenario as default
  const [selectedScenario, setSelectedScenario] = useState('professional-headshot')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)

  // Get the prompt for the selected scenario
  const scenarioPrompts: Record<string, string> = {
    'professional-headshot': 'Professional business headshot, clean background, confident expression, professional attire',
    'artistic-creative': 'Creative artistic portrait, dramatic lighting, artistic composition, expressive mood',
  }
  const selectedScenarioPrompt = selectedScenario ? scenarioPrompts[selectedScenario] : ''

  // When the selected scenario changes, set the prompt if the user hasn't typed anything
  useEffect(() => {
    if (selectedScenario && !prompt) {
      setPrompt(scenarioPrompts[selectedScenario] || '')
    }
  }, [selectedScenario])

  // Auto-load demo image on component mount
  useEffect(() => {
    // Create a demo image file object
    const createDemoFile = async () => {
      try {
        // For now, use placeholder - you'll replace this with actual demo image
        const mockFile = new File([''], 'demo-person.jpg', { type: 'image/jpeg' })
        setUploadedImage(mockFile)
      } catch (error) {
        console.log('Demo setup error:', error)
      }
    }
    createDemoFile()
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedScenario) return
    
    setIsGenerating(true)
    
    try {
      // Simulate generation with shimmer animation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show demo results based on selected scenario
      const scenarioResults = demoResults[selectedScenario as keyof typeof demoResults] || []
      setResults(scenarioResults)
      
      // Show upgrade banner after results appear
      setTimeout(() => {
        setShowUpgradeBanner(true)
      }, 2000)
      
    } catch (error) {
      console.error('Demo generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] text-[#E6EEF3] font-inter antialiased overflow-hidden">
      {/* Static background gradient spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#00D1FF]/20 to-[#0099CC]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#00B8E6]/15 to-[#00D1FF]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#00D1FF]/10 to-transparent rounded-full blur-2xl" />
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,209,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,209,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30" />
      
      {/* Upgrade Banner */}
      <AnimatePresence>
        {showUpgradeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-2xl px-6 py-4 shadow-2xl">
              <div className="flex items-center space-x-4">
                <SparklesIcon className="w-6 h-6 text-[#00D1FF]" />
                <div>
                      <p className="text-white font-medium">Love what you see? Unlock full access!</p>
                      <p className="text-white/60 text-sm">More generations, all styles, priority processing</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-medium rounded-lg whitespace-nowrap"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Unlock Founding Member Pricing
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-between p-6"
        >

          {/* Logo */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#00D1FF] to-[#0099CC] rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/10">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white/90">DePIX</span>
            </motion.div>
          </div>


          {/* Profile Menu */}
          <ProfileMenu />
        </motion.header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 pb-12">
          {/* Wrapper for vertical centering when no results */}
          <div className={`${results.length === 0 && !isGenerating ? 'min-h-[calc(100vh-200px)] flex flex-col justify-center' : ''}`}>
            {/* Central Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
            {/* Headline and description */}
            <div className="mb-8 text-center flex flex-col items-center relative">
              {/* Ribbon left of headline */}
              <div className="absolute -left-4 top-2 sm:static sm:mb-2 flex items-center">
                <span className="bg-[#E6F4FF] text-[#005577] text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide uppercase whitespace-nowrap border border-[#B3E0FF]">
                  DEMO PREVIEW — Launching Sept 16
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Imagine Yourself in Any Scenario</h1>
              <p className="text-base sm:text-lg text-white/60 max-w-1xl mx-auto mb-6">Create realistic images of yourself in any outfit, style, or setting with just one photo.</p>

              {/* Main CTA Button */}
              <motion.button
                onClick={() => window.location.href = '/pricing'}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(0,209,255,0.4)] transition-all duration-300 mb-4"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <SparklesIcon className="w-6 h-6" />
                <span className="text-lg">Pre-order for lifetime discounted pricing</span>
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
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
                          isDemo={true}
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
                        style={{ minHeight: '36px', minWidth: '90px' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isGenerating ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <span>Generate</span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Style Selector - Outside on the right, matching input height */}
                <div className="flex-shrink-0">
                  <DemoScenarioSelector 
                    selected={selectedScenario}
                    onSelect={setSelectedScenario}
                    onPromptUpdate={setPrompt}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Latest Results - Only show when there are results or generating */}
          {(results.length > 0 || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-semibold mb-8 text-white/90"
              >
                Demo Results
              </motion.h2>
              <GeneratedResults results={results} isGenerating={isGenerating} />
            </motion.div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}
