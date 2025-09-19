'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/services/userService'
import {
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// Custom components
import ImageUpload from '@/components/ImageUpload'
import DemoScenarioSelector from '@/components/DemoScenarioSelector'
import AspectRatioSelector from '@/components/AspectRatioSelector'
import GeneratedResults from '@/components/GeneratedResults'
import ProfileMenu from '@/components/ProfileMenu'
import CountdownTimer from '@/components/CountdownTimer'
import TutorialIndicator from '@/components/TutorialIndicator'
import AuthModal from '@/components/AuthModal'


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
  'space': [
    '/demo/output/space/a-subject-stands-casually-in-a-glass-ele_7iQiaIr1TGSXMRYlpjChWA_x5-2aRMVRviJSaseqixzhA.jpeg',
    '/demo/output/space/2.jpeg',
    '/demo/output/space/3.jpeg',
    '/demo/output/space/4.jpeg',
  ],
  'surf-work': [
    '/demo/output/surf-work/1.jpeg',
    '/demo/output/surf-work/2.jpeg',
    '/demo/output/surf-work/3.jpeg',
    '/demo/output/surf-work/4.jpeg',
  ],
}

export default function DemoPage() {
  const { plan, user, hasSeenOnboarding } = useAuth()
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
  const [onboardingWasJustSeen, setOnboardingWasJustSeen] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true); // Default to true
  const [showReplayButton, setShowReplayButton] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(-1)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showGenerateHint, setShowGenerateHint] = useState(false)
  const [hasClickedGenerate, setHasClickedGenerate] = useState(false)
  const [typingText, setTypingText] = useState('Scenario')
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false)
  const isScenarioModalOpenRef = useRef(isScenarioModalOpen)
  // Track generate button clicks and upgrade banner display
  const [generateClickCount, setGenerateClickCount] = useState(0)
  const [hasShownUpgradeBanner, setHasShownUpgradeBanner] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  isScenarioModalOpenRef.current = isScenarioModalOpen
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')


  // Get the prompt for the selected scenario (match DemoScenarioSelector)
  const scenarioPrompts = useMemo(() => ({
    'desert': `A candid, casually captured iPhone-style image of a subject dressed in muted desert tones, wearing a long, loosely wrapped shawl draped across his shoulders with subtle nomadic layering. He walks gracefully through expansive sand dunes at twilight, his silhouette elongated and subtly dramatic. The soft, low-contrast natural twilight light combined with the gentle glow of an iPhone flash creates a serene, introspective atmosphere with deep shadows and delicate highlights. The minimalist, slightly asymmetrical composition highlights the tactile textures of the flowing shawl fabric, the shifting sand, and the subtle skin nuances visible beneath the fabric. The scene evokes quiet elegance, mysterious allure, and the spontaneous authenticity typical of casual iPhone photography.`,
    'phone-booth': `An atmospheric, cinematic portrait of a subject inside a graffiti-covered phone booth at night. They hold the receiver to their ear, looking intently through the glass, which is wet with rain. The dim interior lighting highlights thier features, while outside, the city lights blur into a warm bokeh. The mood is gritty, moody, and contemplative, reminiscent of a film noir.`,
    'retro-introspection': `In the frame, a subject commands attention with a poised, self-contained demeanor. Thier deep maroon corduroy blazer, tactile and ribbed under the soft amber flicker of a nearby streetlamp, contrasts richly against the warm sepia of their wide-legged brown trousers—a classic nod to early 80s tailoring. Their hair is tousled yet deliberate, casting subtle shadows across their slightly sun-weathered face. With a cool yet distant gaze, thier eyes wander beyond the immediate, reflecting a reflective solitude under the faded glow of an old advertisement billboard overhead—its peeling paper textures telling stories of a time-worn streetscape. The setting evokes a late dusk hour bathed in sodium-vapour light, which bathes the scene in an amber haze that softens the bus stop's metal bench and the worn concrete underfoot. The Walkman the subject holds—a boxy, white Sony model iconic of the era—catches a gentle highlight, its crinkled leather strap adding an intrepid sense of tactile realism. Their pose is relaxed but deliberate, sitting sideways on the bench with one leg crossed over the other, fingers loosely wrapped around the device, poised between motion and rest. Filmed through a 50 mm lens at eye-level to capture intimate detail, the shot bears the grainy, tactile signature of 35 mm film stock, with visible gate weave that deepens the texture of their skin pores and the corduroy’s plush ridges. The composition balances the subject against the geometric austerity of the billboard frame behind them, the juxtaposition of human warmth against the cold, industrial urban environment. Rendered in a palette reminiscent of Kodak 5247, the scene radiates a nostalgic golden-hour glow that encapsulates quiet urban solitude infused with 1980s street realism. The evocative lighting, coupled with subtle vignetting, enhances the mood of introspective cool. This carefully composed portrait channels the spirit of early 80s cinematic photography with authentic...`,
    'space': 'A futuristic portrait of a subject in a sleek, reflective spacesuit, standing on the surface of a distant planet with a glowing nebula sky. The lighting is ethereal, with cool blue and purple hues reflecting off the suit. The scene evokes wonder, exploration, and the vastness of the cosmos.',
    'surf-work': 'A vibrant, sunlit image of a subject in a wetsuit, holding a surfboard under one arm and a laptop in the other, standing at the edge of the ocean. The background features crashing waves and a clear blue sky, blending the worlds of remote work and surf culture. The mood is energetic, adventurous, and modern.',
  }), [])

  // When the selected scenario changes, set the prompt if the user hasn't typed anything
  useEffect(() => {
    if (selectedScenario && !prompt) {
  setPrompt(scenarioPrompts[selectedScenario as keyof typeof scenarioPrompts] || '')
    }
  }, [selectedScenario, prompt, scenarioPrompts])

  // Typing animation for title
  useEffect(() => {
    const words = ['Scenario', 'Outfit', 'Setting', 'Adventure', 'Story', 'Style', 'Look', 'Moment']
    let currentWordIndex = 0
    // Start by deleting the first word since it's pre-set
    let isDeleting = true
    let charIndex = words[0].length // Start at the end of the first word

    const typeEffect = () => {
      const currentWord = words[currentWordIndex]

      if (isDeleting) {
        setTypingText(currentWord.substring(0, charIndex))
        charIndex--

        if (charIndex < 0) {
          isDeleting = false
          currentWordIndex = (currentWordIndex + 1) % words.length
          charIndex = 0
          setTimeout(typeEffect, 500) // Pause before typing new word
          return
        }
      } else {
        setTypingText(currentWord.substring(0, charIndex + 1))
        charIndex++

        if (charIndex > currentWord.length) {
          isDeleting = true
          setTimeout(typeEffect, 2000) // Pause at end of word
          return
        }
      }

      setTimeout(typeEffect, isDeleting ? 75 : 150)
    }

    // Start typing effect after 3 seconds
    const startTimer = setTimeout(() => {
      typeEffect()
    }, 3000)

    return () => clearTimeout(startTimer)
  }, [])

  // Determine initial tutorial status on mount
  useEffect(() => {
    // Wait for auth state to be loaded
    if (hasSeenOnboarding === null) return;

    const seenInDb = hasSeenOnboarding;
    const seenInLocalStorage = localStorage.getItem('hasSeenOnboarding') === 'true';

    if (seenInDb || seenInLocalStorage) {
      setHasCompletedTutorial(true);
      setShowReplayButton(true);
    } else {
      setHasCompletedTutorial(false);
      setShowReplayButton(false);
    }
  }, [hasSeenOnboarding]);


  // Auto-load demo image on component mount (use real demo image)
  useEffect(() => {
    // Use the real demo reference image from demo/input/ref-image.jpg
    // We can't create a File object from a URL in the browser, so for demo, just store the URL as a string in uploadedImage
    setUploadedImage('/demo/input/ref-image.jpg')
  }, [])

  // Onboarding sequence
  useEffect(() => {
    // Disable tutorial on mobile
    if (isMobile) return;
    // Don't run if tutorial has been completed, or we just finished it.
    if (hasCompletedTutorial || onboardingWasJustSeen) return;

    // Don't run if tutorial is already in progress in this session (prevents reload re-trigger).
    if (sessionStorage.getItem('onboardingInProgress') === 'true') return;

    const startOnboarding = setTimeout(() => {
      const checkAndStart = () => {
        if (isScenarioModalOpenRef.current) {
          setTimeout(checkAndStart, 500);
        } else {
          // Mark as started for this session to prevent re-trigger on reload.
          sessionStorage.setItem('onboardingInProgress', 'true');
          setShowOnboarding(true);
          setCurrentOnboardingStep(0);
        }
      };
      checkAndStart();
    }, 2000); // Reduced delay to 2 seconds

    return () => clearTimeout(startOnboarding);
  }, [hasCompletedTutorial, onboardingWasJustSeen]);

  const markOnboardingAsSeen = useCallback(() => {
    if (user) {
      UserService.markOnboardingAsSeen();
    } else {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    setOnboardingWasJustSeen(true); // Prevents tutorial from re-triggering in the same session
    setHasCompletedTutorial(true); // Update master state
    setShowReplayButton(true); // Show the replay button immediately
    sessionStorage.removeItem('onboardingInProgress'); // Clean up session state
  }, [user]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    // Redirect to pricing page after successful signup
    window.location.href = '/pricing';
  }, []);

  // Progress through onboarding steps
  useEffect(() => {
    if (!showOnboarding || currentOnboardingStep === -1) return

    const stepDuration = currentOnboardingStep === 0 ? 1600 : 1600

    const nextStep = setTimeout(() => {
      if (currentOnboardingStep < 2) {
        setCurrentOnboardingStep(prev => prev + 1)
      } else {
        setTimeout(() => {
          setShowOnboarding(false)
          markOnboardingAsSeen()

          if (!hasClickedGenerate) {
            setTimeout(() => {
              if (!hasClickedGenerate) {
                setShowGenerateHint(true)
              }
            }, 1000)
          }
        }, 1600)
      }
    }, stepDuration)

    return () => clearTimeout(nextStep)
  }, [currentOnboardingStep, showOnboarding, hasClickedGenerate, markOnboardingAsSeen])

  // Add keyboard shortcut to reset onboarding (for testing)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press Ctrl+Shift+R to reset onboarding
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        localStorage.removeItem('hasSeenOnboarding')
        // The global state will be out of sync, but this is a testing-only feature.
        // A full page reload would be needed to resync the useAuth hook.
        setShowOnboarding(true)
        setCurrentOnboardingStep(0)
        console.log('Onboarding reset!')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedScenario) return

    // Mark that user has clicked generate and hide any hint
    setHasClickedGenerate(true)
    setShowGenerateHint(false)

    // Increment generate click count
    setGenerateClickCount((prev) => prev + 1)

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
      // Only show upgrade banner if user has clicked generate 3 times and not shown before
      if (generateClickCount + 1 >= 3 && !hasShownUpgradeBanner) {
        setTimeout(() => {
          setShowUpgradeBanner(true)
          setHasShownUpgradeBanner(true)
        }, 4500)
      }
    } catch (error) {
      console.error('Demo generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] text-[#E6EEF3] font-inter antialiased overflow-hidden flex flex-col">
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
        {!plan && showUpgradeBanner && (
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

      {/* Header */}
      <motion.header
        initial={!isMobile && { opacity: 0, y: -20 }}
        animate={!isMobile && { opacity: 1, y: 0 }}
        className="relative flex items-center justify-between p-5 sm:p-6 z-10"
      >
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = '/'}
          >
            <span className="text-lg md:text-xl font-bold text-white/90">Seem</span>
          </motion.div>
        </div>

        {/* Centered Timer for desktop */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <CountdownTimer showDemoMode={true} showOnly="both" />
        </div>

        {/* Demo badge in header center for mobile */}
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <CountdownTimer showDemoMode={true} showOnly="demo" />
        </div>

        {/* Profile Menu */}
        <ProfileMenu />
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-5 sm:px-6 py-8 sm:py-12 md:py-0 justify-start md:justify-center">
        {/* Timer for mobile, below header */}
        <div className="md:hidden mb-4 flex justify-center">
          <CountdownTimer showDemoMode={false} showOnly="launch" />
        </div>
        <div className="w-full max-w-4xl">
          {/* Central Input Area */}
          <motion.div
            initial={!isMobile && { opacity: 0, y: 40 }}
            animate={!isMobile && { opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            {/* Headline and description */}
            <div className="mb-6 sm:mb-8 text-center flex flex-col items-center relative">
              {/* Ribbon left of headline and Demo badge - MOVED TO HEADER */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                <span className="block sm:inline">See Yourself in</span>{' '}
                <span className="block sm:inline">Any{' '}
                  <span className="relative">
                    {typingText}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -right-1 sm:-right-2 text-[#00D1FF]"
                    >
                      |
                    </motion.span>
                  </span>
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">Create realistic images of yourself in any outfit, style, or setting with just one photo.</p>

              {/* Main CTA Button - For guests or logged-in users who haven't pre-ordered yet */}
              {(!user || (user && (!plan || plan === 'none'))) && (
                <div className="flex flex-col items-center mb-4">
                  <motion.button
                    onClick={() => {
                      if (user) {
                        // User is logged in but hasn't paid, redirect to pricing
                        window.location.href = '/pricing';
                      } else {
                        // User is not logged in, show signup modal
                        setShowAuthModal(true);
                      }
                    }}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#00B8E6] to-[#0099CC] text-white font-bold px-6 sm:px-8 py-4 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(0,209,255,0.4)] transition-all duration-300 text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-base sm:text-lg">Pre-order for lifetime discounted pricing</span>
                    <ArrowRightIcon className="w-5 h-5 sm:w-5 sm:h-5" />
                  </motion.button>
                  <p className="text-sm text-white/50 mt-3">Only 500 spots available</p>
                </div>
              )}
            </div>

            {/* Glassmorphism Container */}
            <div className="relative max-w-3xl mx-auto px-2 sm:px-0">

              {/* TUTORIAL INDICATORS - Onboarding Only */}
              {!isMobile && (
                <AnimatePresence>
                  {showOnboarding && currentOnboardingStep >= 0 && (
                    <TutorialIndicator
                      key="tutorial-1"
                      text="Upload your reference image here."
                      arrowPath="M 20,20 Q 80,40 130,10"
                      viewBox="0 0 150 50"
                      className="top-1/3 -left-52 hidden md:block z-50"
                      arrowClassName="w-70 h-13 transform translate x-0 translate-y-0"
                      textClassName="w-48 -top-7 -left-1"
                    />
                  )}
                  {showOnboarding && currentOnboardingStep >= 1 && (
                    <TutorialIndicator
                      key="tutorial-2"
                      text="Select a style to transform your image."
                      arrowPath="M 130,20 Q 70,40 20,10"
                      viewBox="0 0 150 50"
                      className="top-1/2 -right-52 hidden md:block z-50"
                      arrowClassName="w-40 h-12 transform -translate-x-16 translate-y-2"
                      textClassName="w-48 text-right -top-4 -right-2 "
                    />
                  )}
                  {showOnboarding && currentOnboardingStep >= 2 && (
                    <TutorialIndicator
                      key="tutorial-3"
                      text="Or type a custom prompt to guide the AI."
                      arrowPath="M 10,20 Q 40,60 110,80"
                      viewBox="0 0 150 100"
                      className="top-[-9rem] -left-30 z-50"
                      arrowClassName="w-40 h-24 transform translate-x-36 translate-y-14"
                      textClassName="w-48 top-8 left-3 transform -translate-x-4 translate-y-2"
                    />
                  )}
                </AnimatePresence>
              )}

              {/* Onboarding Overlay with Skip Option */}
              <AnimatePresence>
                {!isMobile && showOnboarding && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 cursor-pointer"
                    onClick={() => {
                      setShowOnboarding(false)
                      markOnboardingAsSeen()
                      // Show generate hint after cancel, if user hasn't clicked generate
                      if (!hasClickedGenerate) {
                        setTimeout(() => {
                          if (!hasClickedGenerate) {
                            setShowGenerateHint(true)
                          }
                        }, 1000)
                      }
                    }}
                  >
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={e => {
                          e.stopPropagation();
                          setShowOnboarding(false)
                          markOnboardingAsSeen()
                          // Show generate hint after skip, if user hasn't clicked generate
                          if (!hasClickedGenerate) {
                            setTimeout(() => {
                              if (!hasClickedGenerate) {
                                setShowGenerateHint(true)
                              }
                            }, 1000)
                          }
                        }}
                        className="px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-[#00D1FF]/50 text-white/90 hover:text-white text-sm rounded-lg hover:bg-slate-800/90 transition-all duration-200 shadow-lg"
                      >
                        Skip Tutorial
                      </motion.button>
                    </div>
                    {/* Progress Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-xl border border-[#00D1FF]/50 px-4 py-2 rounded-full shadow-lg"
                      >
                        {[0, 1, 2].map((step) => (
                          <div
                            key={`onboarding-dot-${step}`}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              step <= currentOnboardingStep
                                ? 'bg-[#00D1FF]'
                                : 'bg-white/30'
                            }`}
                          />
                        ))}
                        <span className="ml-3 text-white/90 text-sm">
                          {currentOnboardingStep + 1} of 3
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Multiple glow layers for depth */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#00D1FF]/20 via-[#00D1FF]/30 to-[#00D1FF]/20 rounded-3xl blur-xl opacity-75 scale-100 md:scale-90 lg:scale-85 origin-center" />
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00D1FF]/30 via-[#00D1FF]/40 to-[#00D1FF]/30 rounded-2xl blur-lg opacity-50 scale-100 md:scale-90 lg:scale-85 origin-center" />

              {/* Main layout with style selector outside - STACK ON MOBILE */}
              <div className="flex flex-col-reverse sm:flex-row items-start sm:space-x-3 md:space-x-4 space-y-4 sm:space-y-0 max-w-none md:max-w-3xl lg:max-w-4xl xl:max-w-5xl scale-100 md:scale-90 lg:scale-85 origin-center">
                {/* Main input field */}
                <div className="flex-1 w-full relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl shadow-black/20 hover:border-[#00D1FF] transition-colors duration-300">
                  {/* Input content with image reference inside */}
                  <div className="relative p-4 sm:p-5">
                    {/* Main content area with image and text */}
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Image Reference - Larger, inside input, left side */}
                      <div className="flex-shrink-0">
                        <ImageUpload
                          onImageUpload={setUploadedImage}
                          uploadedImage={uploadedImage}
                          isDemo={true}
                          demoImageUrl="/demo/input/ref-image.jpg"
                          onDemoRemoveClick={() => setShowUpgradePopupForText(true)}
                        />
                      </div>

                      {/* Text area - flows to the right of image */}
                      <div className="flex-1">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={"Describe what you want to generate..."}
                          className="w-full h-20 sm:h-24 bg-transparent text-white/90 placeholder-white/40 resize-none border-none outline-none text-base sm:text-lg leading-relaxed cursor-text hover:text-white hover:bg-white/5 transition-all duration-200"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                          readOnly
                          onClick={() => setShowUpgradePopupForText(true)}
                          onFocus={(e) => e.target.blur()}
                        />
                      </div>
                    </div>

                    {/* Bottom controls inside the input */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10">
                      {/* Left: Aspect Ratio */}
                      <div className="flex-shrink-0">
                        <AspectRatioSelector
                          selected={aspect}
                          onSelect={setAspect}
                          demoOnlyPortrait={true}
                        />
                      </div>

                      {/* Right: Generate Button */}
                      <div className="relative">
                        <motion.button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="px-3 sm:px-5 py-2 bg-gradient-to-r from-[#00B8E6] to-[#0099CC] text-white font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2 backdrop-blur-sm border border-white/20 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all duration-300 text-xs sm:text-sm"
                          style={{ minHeight: '32px', minWidth: '80px' }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {isGenerating ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              <span>Generate</span>
                              <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </>
                          )}
                        </motion.button>

                        {/* Animated Hand Hint */}
                        <AnimatePresence>
                          {showGenerateHint && !isGenerating && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2 pointer-events-none z-50"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 0.8, 1],
                                  y: [0, 3, 0]
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  repeatDelay: 0.5
                                }}
                                className="text-xl sm:text-2xl filter drop-shadow-lg"
                              >
                                👆
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style Selector - Outside on the right, matching input height - MOVED TO TOP ON MOBILE */}
                <div className="flex-shrink-0 w-full sm:w-auto mb-4 sm:mb-0">
                  <DemoScenarioSelector
                    selected={selectedScenario}
                    onSelect={setSelectedScenario}
                    onPromptUpdate={setPrompt}
                    isOpen={isScenarioModalOpen}
                    setIsOpen={setIsScenarioModalOpen}
                  />
                </div>
              </div>
            </div>

          </motion.div>

          {/* Latest Results - Only show when there are results or generating */}
          {(results.length > 0 || isGenerating) && (
            <motion.div
              ref={resultsRef}
              initial={!isMobile && { opacity: 0, y: 40 }}
              animate={!isMobile && { opacity: 1, y: 0 }}
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

      <AnimatePresence>
        {!plan && showUpgradePopupForText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] max-w-xs sm:max-w-sm mx-4"
          >
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-[#00D1FF]/60 rounded-lg p-3 sm:p-4 shadow-2xl">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#00D1FF] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium text-xs sm:text-sm">Custom prompts require full access</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-medium rounded text-xs hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Upgrade
                </motion.button>
                <button
                  onClick={() => setShowUpgradePopupForText(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-0.5 sm:p-1"
                >
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replay Tutorial Button - Bottom Left */}
      <AnimatePresence>
        {!isMobile && showReplayButton && !showOnboarding && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowOnboarding(true)
              setCurrentOnboardingStep(0)
            }}
            className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center bg-white/8 hover:bg-white/12 border border-white/20 hover:border-white/30 rounded-lg text-white/60 hover:text-white/80 transition-all duration-200 backdrop-blur-xl z-50 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs"
            title="Replay Tutorial"
          >
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span className="font-medium">Tutorial</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Auth Modal for Pre-order CTA */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultMode="signup"
      />

      {/* Footer with Legal Links */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-5 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            {/* Left: Copyright */}
            <div className="text-xs text-white/40">
              © {new Date().getFullYear()} Seem. All rights reserved.
            </div>
            
            {/* Right: Legal Links */}
            <div className="flex items-center space-x-4 text-xs">
              <a 
                href="/terms" 
                className="text-white/40 hover:text-[#00D1FF] transition-colors duration-200"
              >
                Terms of Service
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/privacy" 
                className="text-white/40 hover:text-[#00D1FF] transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/refund-policy" 
                className="text-white/40 hover:text-[#00D1FF] transition-colors duration-200"
              >
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
