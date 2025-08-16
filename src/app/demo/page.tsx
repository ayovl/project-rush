'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

// Custom components
import ImageUpload from '@/components/ImageUpload'
import DemoScenarioSelector from '@/components/DemoScenarioSelector'
import AspectRatioSelector from '@/components/AspectRatioSelector'
import GeneratedResults from '@/components/GeneratedResults'
import ProfileMenu from '@/components/ProfileMenu'
import CountdownTimer from '@/components/CountdownTimer'
import TutorialIndicator from '@/components/TutorialIndicator'


// Map scenario IDs to output images in demo folder
const demoResults: Record<string, string[]> = {
  'desert': [
    '/demo/output/desert/1.jpeg',
    '/demo/output/desert/2.jpeg',
    '/demo/output/desert/3.jpeg',
    '/demo/output/desert/4.jpeg',
  ],
  'phone-booth': [
    '/demo/output/phone-booth/1.jpeg',
    '/demo/output/phone-booth/2.jpeg',
    '/demo/output/phone-booth/3.jpeg',
    '/demo/output/phone-booth/4.jpeg',
  ],
  'retro-introspection': [
    '/demo/output/retro-introspection/1.jpeg',
    '/demo/output/retro-introspection/2.jpeg',
    '/demo/output/retro-introspection/3.jpeg',
    '/demo/output/retro-introspection/4.jpeg',
  ],
}

export default function DemoPage() {
  const [prompt, setPrompt] = useState('')
  // Pre-load with demo image (will be set automatically)
  const [uploadedImage, setUploadedImage] = useState<File | string | null>(null)
  // Set first available demo scenario as default
  const [selectedScenario, setSelectedScenario] = useState('desert')
  const [aspect, setAspect] = useState('9:16') // Portrait by default
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  const [showUpgradePopupForText, setShowUpgradePopupForText] = useState(false)
  const resultsRef = useRef<HTMLDivElement | null>(null)


  // Get the prompt for the selected scenario (match DemoScenarioSelector)
  const scenarioPrompts: Record<string, string> = {
    'desert': `A candid, casually captured iPhone-style image of a subject dressed in muted desert tones, wearing a long, loosely wrapped shawl draped across his shoulders with subtle nomadic layering. He walks gracefully through expansive sand dunes at twilight, his silhouette elongated and subtly dramatic. The soft, low-contrast natural twilight light combined with the gentle glow of an iPhone flash creates a serene, introspective atmosphere with deep shadows and delicate highlights. The minimalist, slightly asymmetrical composition highlights the tactile textures of the flowing shawl fabric, the shifting sand, and the subtle skin nuances visible beneath the fabric. The scene evokes quiet elegance, mysterious allure, and the spontaneous authenticity typical of casual iPhone photography.`,
    'phone-booth': `An atmospheric, cinematic portrait of a subject inside a graffiti-covered phone booth at night. They hold the receiver to their ear, looking intently through the glass, which is wet with rain. The dim interior lighting highlights thier features, while outside, the city lights blur into a warm bokeh. The mood is gritty, moody, and contemplative, reminiscent of a film noir.`,
    'retro-introspection': `In the frame, a subject commands attention with a poised, self-contained demeanor. Thier deep maroon corduroy blazer, tactile and ribbed under the soft amber flicker of a nearby streetlamp, contrasts richly against the warm sepia of their wide-legged brown trousers—a classic nod to early 80s tailoring. Their hair is tousled yet deliberate, casting subtle shadows across their slightly sun-weathered face. With a cool yet distant gaze, thier eyes wander beyond the immediate, reflecting a reflective solitude under the faded glow of an old advertisement billboard overhead—its peeling paper textures telling stories of a time-worn streetscape. The setting evokes a late dusk hour bathed in sodium-vapour light, which bathes the scene in an amber haze that softens the bus stop's metal bench and the worn concrete underfoot. The Walkman the subject holds—a boxy, white Sony model iconic of the era—catches a gentle highlight, its crinkled leather strap adding an intrepid sense of tactile realism. Their pose is relaxed but deliberate, sitting sideways on the bench with one leg crossed over the other, fingers loosely wrapped around the device, poised between motion and rest. Filmed through a 50 mm lens at eye-level to capture intimate detail, the shot bears the grainy, tactile signature of 35 mm film stock, with visible gate weave that deepens the texture of their skin pores and the corduroy’s plush ridges. The composition balances the subject against the geometric austerity of the billboard frame behind them, the juxtaposition of human warmth against the cold, industrial urban environment. Rendered in a palette reminiscent of Kodak 5247, the scene radiates a nostalgic golden-hour glow that encapsulates quiet urban solitude infused with 1980s street realism. The evocative lighting, coupled with subtle vignetting, enhances the mood of introspective cool. This carefully composed portrait channels the spirit of early 80s cinematic photography with authentic...`
  }

  // When the selected scenario changes, set the prompt if the user hasn't typed anything
  useEffect(() => {
    if (selectedScenario && !prompt) {
      setPrompt(scenarioPrompts[selectedScenario] || '')
    }
  }, [selectedScenario, prompt, scenarioPrompts])


  // Auto-load demo image on component mount (use real demo image)
  useEffect(() => {
    // Use the real demo reference image from demo/input/ref-image.jpg
    // We can't create a File object from a URL in the browser, so for demo, just store the URL as a string in uploadedImage
    setUploadedImage('/demo/input/ref-image.jpg')
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedScenario) return
    setIsGenerating(true)
    // Scroll to results section when generation starts
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
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
            <div className="relative bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-2xl px-6 py-4 shadow-2xl">
              <div className="flex items-center space-x-4">
                <SparklesIcon className="w-6 h-6 text-[#00D1FF]" />
                <div className="flex-1">
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
              <button
                onClick={() => setShowUpgradeBanner(false)}
                className="absolute top-2 right-2 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
                <CountdownTimer />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Imagine Yourself in Any Scenario</h1>
              <p className="text-base sm:text-lg text-white/60 max-w-1xl mx-auto mb-6">Create realistic images of yourself in any outfit, style, or setting with just one photo.</p>

              {/* Main CTA Button */}
              <div className="flex flex-col items-center mb-4">
                <motion.button
                  onClick={() => window.location.href = '/pricing'}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(0,209,255,0.4)] transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SparklesIcon className="w-6 h-6" />
                  <span className="text-lg">Pre-order for lifetime discounted pricing</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                <p className="text-xs text-white/50 mt-2">Only 500 spots available</p>
              </div>
            </div>

            {/* Glassmorphism Container */}
            <div className="relative max-w-3xl mx-auto">
              <TutorialIndicator
                text="Upload your reference image here."
                arrowPath="M 20,20 Q 80,40 130,10"
                viewBox="0 0 150 50"
                className="top-1/2 -left-52 hidden md:block"
                arrowClassName="w-40 h-12"
                textClassName="w-48"
              />
              <TutorialIndicator
                text="Or type a custom prompt to guide the AI."
                arrowPath="M 10,80 Q 50,50 140,50"
                viewBox="0 0 150 100"
                className="top-[-6rem] left-48"
                arrowClassName="w-40 h-24"
                textClassName="w-48"
              />
              <TutorialIndicator
                text="Select a style to transform your image."
                arrowPath="M 130,20 Q 70,40 20,10"
                viewBox="0 0 150 50"
                className="top-1/2 -right-52 hidden md:block"
                arrowClassName="w-40 h-12"
                textClassName="w-48 text-right"
              />

              {/* Multiple glow layers for depth */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#00D1FF]/20 via-[#00D1FF]/30 to-[#00D1FF]/20 rounded-3xl blur-xl opacity-75" />
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00D1FF]/30 via-[#00D1FF]/40 to-[#00D1FF]/30 rounded-2xl blur-lg opacity-50" />

              {/* Main layout with style selector outside */}
              <div className="flex items-start space-x-4">
                {/* Main input field */}
                <div className="flex-1 relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl shadow-black/20 hover:border-[#00D1FF]/70 transition-colors duration-300">
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
                          demoImageUrl="/demo/input/ref-image.jpg"
                        />
                      </div>
                      
                      {/* Text area - flows to the right of image */}
                      <div className="flex-1">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={"Describe what you want to generate..."}
                          className="w-full h-24 bg-transparent text-white/90 placeholder-white/40 resize-none border-none outline-none text-lg leading-relaxed cursor-pointer"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                          readOnly
                          onClick={() => setShowUpgradePopupForText(true)}
                          onFocus={(e) => e.target.blur()}
                        />
                      </div>
                    </div>

                    {/* Bottom controls inside the input */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                      {/* Left: Aspect Ratio */}
                      <div className="flex-shrink-0">
                        <AspectRatioSelector 
                          selected={aspect}
                          onSelect={setAspect}
                          demoOnlyPortrait={true}
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
              ref={resultsRef}
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
                Latest Results
              </motion.h2>
              <GeneratedResults results={results} isGenerating={isGenerating} />
            </motion.div>
          )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showUpgradePopupForText && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center"
            >
              <SparklesIcon className="w-12 h-12 text-[#00D1FF] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Unlock Full Access</h3>
              <p className="text-white/70 mb-6">Editing the prompt is a premium feature. Get access to all features, including custom prompts, all styles, and more.</p>
              <div className="flex flex-col space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-semibold rounded-lg whitespace-nowrap"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Unlock Founding Member Pricing
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/10 text-white/80 font-medium rounded-lg"
                  onClick={() => setShowUpgradePopupForText(false)}
                >
                  Maybe later
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}