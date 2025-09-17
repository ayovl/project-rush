'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface DemoScenarioSelectorProps {
  selected: string
  onSelect: (scenario: string) => void
  onPromptUpdate: (prompt: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const scenarios = [
  {
    id: 'none',
    name: 'Custom',
    prompt: '',
    thumbnail: '',
    available: false
  },
  {
    id: 'desert',
    name: 'Desert',
    prompt: `A candid, casually captured iPhone-style image of a subject dressed in muted desert tones, wearing a long, loosely wrapped shawl draped across his shoulders with subtle nomadic layering. He walks gracefully through expansive sand dunes at twilight, his silhouette elongated and subtly dramatic. The soft, low-contrast natural twilight light combined with the gentle glow of an iPhone flash creates a serene, introspective atmosphere with deep shadows and delicate highlights. The minimalist, slightly asymmetrical composition highlights the tactile textures of the flowing shawl fabric, the shifting sand, and the subtle skin nuances visible beneath the fabric. The scene evokes quiet elegance, mysterious allure, and the spontaneous authenticity typical of casual iPhone photography.`,
    thumbnail: '/demo/styles/desert.jpeg',
    available: true
  },
  {
    id: 'retro-introspection',
    name: 'Retro Introspection',
    prompt: `In the frame, a subject commands attention with a poised, self-contained demeanor. Thier deep maroon corduroy blazer, tactile and ribbed under the soft amber flicker of a nearby streetlamp, contrasts richly against the warm sepia of their wide-legged brown trousers—a classic nod to early 80s tailoring. Their hair is tousled yet deliberate, casting subtle shadows across their slightly sun-weathered face. With a cool yet distant gaze, thier eyes wander beyond the immediate, reflecting a reflective solitude under the faded glow of an old advertisement billboard overhead—its peeling paper textures telling stories of a time-worn streetscape. The setting evokes a late dusk hour bathed in sodium-vapour light, which bathes the scene in an amber haze that softens the bus stop's metal bench and the worn concrete underfoot. The Walkman the subject holds—a boxy, white Sony model iconic of the era—catches a gentle highlight, its crinkled leather strap adding an intrepid sense of tactile realism. Their pose is relaxed but deliberate, sitting sideways on the bench with one leg crossed over the other, fingers loosely wrapped around the device, poised between motion and rest. Filmed through a 50 mm lens at eye-level to capture intimate detail, the shot bears the grainy, tactile signature of 35 mm film stock, with visible gate weave that deepens the texture of their skin pores and the corduroy’s plush ridges. The composition balances the subject against the geometric austerity of the billboard frame behind them, the juxtaposition of human warmth against the cold, industrial urban environment. Rendered in a palette reminiscent of Kodak 5247, the scene radiates a nostalgic golden-hour glow that encapsulates quiet urban solitude infused with 1980s street realism. The evocative lighting, coupled with subtle vignetting, enhances the mood of introspective cool. This carefully composed portrait channels the spirit of early 80s cinematic photography with authentic film grain, ca...`,
    thumbnail: '/demo/styles/retro-introspection.jpeg',
    available: true
  },
  {
    id: 'phone-booth',
    name: 'Phone Booth',
    prompt: `An atmospheric, cinematic portrait of a subject inside a graffiti-covered phone booth at night. They hold the receiver to their ear, looking intently through the glass, which is wet with rain. The dim interior lighting highlights thier features, while outside, the city lights blur into a warm bokeh. The mood is gritty, moody, and contemplative, reminiscent of a film noir.`,
    thumbnail: '/demo/styles/phone-booth.jpeg',
    available: true
  },
  {
    id: 'space',
    name: 'Space',
    prompt: 'A futuristic portrait of a subject in a sleek, reflective spacesuit, standing on the surface of a distant planet with a glowing nebula sky. The lighting is ethereal, with cool blue and purple hues reflecting off the suit. The scene evokes wonder, exploration, and the vastness of the cosmos.',
    thumbnail: '/demo/styles/space.jpeg',
    available: true
  },
  {
    id: 'surf-work',
    name: 'Surf Work',
    prompt: 'A vibrant, sunlit image of a subject in a wetsuit, holding a surfboard under one arm and a laptop in the other, standing at the edge of the ocean. The background features crashing waves and a clear blue sky, blending the worlds of remote work and surf culture. The mood is energetic, adventurous, and modern.',
    thumbnail: '/demo/styles/surf-work.jpeg',
    available: true
  },
  {
    id: 'casual-portrait',
    name: 'Casual Portrait',
    prompt: 'Casual portrait photo, natural lighting, relaxed expression, everyday clothing',
    thumbnail: '/api/placeholder/240x241',
    available: false
  },
  {
    id: 'outdoor-lifestyle',
    name: 'Outdoor Lifestyle',
    prompt: 'Outdoor lifestyle photo, natural environment, candid expression, casual outdoor setting',
    thumbnail: '/api/placeholder/240x243',
    available: false
  },
  {
    id: 'fashion-style',
    name: 'Fashion Style',
    prompt: 'Fashion style photo, trendy outfit, stylish pose, modern aesthetic',
    thumbnail: '/api/placeholder/240x244',
    available: false
  },
  {
    id: 'vintage-retro',
    name: 'Vintage Retro',
    prompt: 'Vintage retro style photo, classic aesthetic, nostalgic mood, retro fashion',
    thumbnail: '/api/placeholder/240x245',
    available: false
  }
]

export default function DemoScenarioSelector({ selected, onSelect, onPromptUpdate, isOpen, setIsOpen }: DemoScenarioSelectorProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [anchorTop, setAnchorTop] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const handleScenarioClick = (scenario: typeof scenarios[0]) => {
    if (!scenario.available) {
      // For the "Custom" option, show the upgrade popup
      if (scenario.id === 'none') {
        setShowUpgradePopup(true)
      }
      // For other unavailable options, you could add other logic or just return
      return
    }
    
    onSelect(scenario.id)
    onPromptUpdate(scenario.prompt)
    setIsOpen(false)
  }


  const selectedObj = scenarios.find(s => s.id === selected)

  useEffect(() => {
    if (!isOpen) return

    const checkPosition = () => {
      const el = modalRef.current
      if (!el) return
      const modalHeight = el.offsetHeight
      const viewport = window.innerHeight
      if (modalHeight > viewport - 96) {
        setAnchorTop(true)
      } else {
        setAnchorTop(false)
      }
    }

    requestAnimationFrame(checkPosition)

    const onResize = () => requestAnimationFrame(checkPosition)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isOpen])

  return (
    <>
      {/* Selector Button */}
      <motion.button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className={`group h-32 sm:h-44 md:h-53 w-full sm:w-40 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden flex items-center border backdrop-blur-xl bg-white/5 shadow-2xl shadow-black/20 transition-all duration-200 relative z-10 active:scale-95 ${
          selected ? 'border-[#00D1FF]/70 ring-1 sm:ring-2 ring-[#00D1FF]/30' : 'border-white/20 hover:border-[#00D1FF]/50'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center w-full px-3 py-2 gap-3">
        {selectedObj && selectedObj.id !== 'none' ? (
          <>
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
              <Image
                src={selectedObj.thumbnail}
                alt={selectedObj.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center pl-3">
              <span className="text-lg sm:text-xl font-bold text-white truncate">
                {selectedObj.name}
              </span>
              <span className="text-sm sm:text-base text-white/80 truncate">
                Cinematic Adventure
              </span>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <PencilIcon className="w-5 h-5 text-white/70" />
              </button>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#00D1FF]/40 to-[#00B8E6]/40 rounded-lg sm:rounded-xl md:rounded-2xl mr-3" />
            <span className="text-sm sm:text-base text-white/60">Select Style</span>
          </div>
        )}
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed z-[9999] left-1/2 ${anchorTop ? 'top-[4vh] sm:top-[6vh] translate-y-0' : 'top-1/2 sm:top-1/2 -translate-y-1/2'} transform -translate-x-1/2 w-[95%] sm:w-[min(880px,92%)] max-w-[400px] sm:max-w-[880px] rounded-xl sm:rounded-2xl p-4 sm:p-4 shadow-2xl max-h-[calc(100vh-8vh)] sm:max-h-[calc(100vh-12vh)] overflow-y-auto`}
              style={{ boxSizing: 'border-box' }}
            >
              {/* Frosted glass & glow layers behind the modal content (no negative inset) */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/8 via-[#00D1FF]/12 to-[#00D1FF]/8 rounded-2xl blur-lg opacity-50 pointer-events-none" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white/90">Select a Style</h3>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -m-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-h-[65vh] sm:max-h-[60vh] overflow-y-auto overflow-x-hidden">
                  {scenarios.map((scenario) => (
                    <motion.button
                      key={scenario.id}
                      onClick={() => handleScenarioClick(scenario)}
                      className={`group relative rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-200 min-h-[120px] sm:min-h-[140px] active:scale-95 ${
                        selected === scenario.id ? 'border-[#00D1FF] ring-2 ring-[#00D1FF]/30' : 'border-white/10 hover:border-white/20'
                      } ${!scenario.available ? 'opacity-60' : ''}`}
                      whileHover={scenario.available ? { scale: 1.02 } : {}}
                      whileTap={scenario.available ? { scale: 0.98 } : {}}
                      disabled={!scenario.available}
                    >
                      {scenario.thumbnail ? (
                        scenario.available ? (
                          <div className="relative w-full h-24 sm:h-32 md:h-40">
                            <Image src={scenario.thumbnail} alt={scenario.name} fill className="object-cover" style={{ objectPosition: 'center 10%' }} />
                          </div>
                        ) : (
                          <div className="relative w-full h-24 sm:h-32 md:h-40 bg-white/5">
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 text-center">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowUpgradePopup(true)
                                }}
                              >
                                <p className="text-white font-medium text-sm sm:text-base">Get Full Access</p>
                                <p className="text-white/60 text-xs sm:text-sm">to unlock all features</p>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        // Special display for the "Custom" button
                        <div className="w-full h-24 sm:h-32 md:h-40 flex flex-col items-center justify-center bg-white/5 text-white/40">
                          <PencilIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mb-1 sm:mb-2 text-white/30" />
                          <span className="text-xs sm:text-sm md:text-base font-medium">Custom Style</span>
                        </div>
                      )}
                      <div className="p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="text-white font-medium text-sm sm:text-base truncate">{scenario.name}</div>
                        {!scenario.available && (
                           <div className="text-xs text-white/60 mt-1">
                           {scenario.id === 'none' ? 'Get full access' : 'Coming Soon'}
                         </div>
                        )}
                        {scenario.available && (
                          <div className="text-xs text-white/60 mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed">{scenario.prompt}</div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-[#00D1FF]/10 to-[#00B8E6]/10 border border-[#00D1FF]/20 rounded-lg sm:rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#00D1FF] to-[#00B8E6] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs sm:text-sm">✨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm sm:text-base">More Styles Coming Soon!</h4>
                      <p className="text-white/60 text-xs sm:text-sm leading-relaxed mt-1">Pre-order now to get access to all styles when we launch</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upgrade Popup */}
      <AnimatePresence>
        {showUpgradePopup && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-xs sm:max-w-sm w-full mx-4 text-center"
            >
              <SparklesIcon className="w-8 h-8 sm:w-12 sm:h-12 text-[#00D1FF] mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Get Full Access</h3>
              <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">Access all features, including custom prompts, all styles, and more.</p>
              <div className="flex flex-col space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-semibold rounded-lg whitespace-nowrap text-sm sm:text-base"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Unlock Founding Member Pricing
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-white/10 text-white/80 font-medium rounded-lg text-sm sm:text-base"
                  onClick={() => setShowUpgradePopup(false)}
                >
                  Maybe later
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}