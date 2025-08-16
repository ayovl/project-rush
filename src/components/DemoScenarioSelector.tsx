'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface DemoScenarioSelectorProps {
  selected: string
  onSelect: (scenario: string) => void
  onPromptUpdate: (prompt: string) => void
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
    id: 'phone-booth',
    name: 'Phone Booth',
    prompt: `An atmospheric, cinematic portrait of a subject inside a graffiti-covered phone booth at night. They hold the receiver to their ear, looking intently through the glass, which is wet with rain. The dim interior lighting highlights thier features, while outside, the city lights blur into a warm bokeh. The mood is gritty, moody, and contemplative, reminiscent of a film noir.`,
    thumbnail: '/demo/styles/phone-booth.jpeg',
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

export default function DemoScenarioSelector({ selected, onSelect, onPromptUpdate }: DemoScenarioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [anchorTop, setAnchorTop] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

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
        className={`group h-53 w-40 rounded-3xl overflow-hidden flex flex-col items-center justify-between border backdrop-blur-xl bg-white/5 shadow-2xl shadow-black/20 transition-all duration-200 relative z-10 ${
          selected ? 'border-[#00D1FF]/70 ring-2 ring-[#00D1FF]/30' : 'border-white/20 hover:border-[#00D1FF]/50'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex-grow flex flex-col items-center justify-center pt-4">
        {selectedObj && selectedObj.id !== 'none' ? (
          <>
            <div className="w-32 h-32 rounded-2xl overflow-hidden mb-2">
              <img 
                src={selectedObj.thumbnail} 
                alt={selectedObj.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-white/80 text-center px-2 leading-tight font-medium">
              {selectedObj.name}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#00D1FF]/40 to-[#00B8E6]/40 rounded-2xl mb-2" />
            <span className="text-sm text-white/60 text-center">Select Style</span>
          </div>
        )}
        </div>
        
        <div className="pb-4 h-8 flex items-center justify-center">
          {selected && selected !== 'none' && (
            <motion.div
              className="flex items-center justify-center text-white/60"
              animate={isHovered ? 'hover' : 'rest'}
            >
              <motion.div
                variants={{
                  rest: { x: 0 },
                  hover: { x: -10 },
                }}
                transition={{ duration: 0.2 }}
              >
                <PencilIcon className="w-4 h-4" />
              </motion.div>
              <motion.div
                className="overflow-hidden"
                variants={{
                  rest: { width: 0, opacity: 0, marginLeft: 0 },
                  hover: { width: 'auto', opacity: 1, marginLeft: 4 },
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-xs font-medium whitespace-nowrap">Edit Style</span>
              </motion.div>
            </motion.div>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`fixed z-[9999] left-1/2 ${anchorTop ? 'top-[6vh] sm:top-[6vh] sm:translate-y-0' : 'top-1/2 sm:top-1/2 sm:-translate-y-1/2'} transform -translate-x-1/2 w-[min(880px,92%)] max-w-[880px] rounded-2xl p-3 shadow-2xl max-h-[calc(100vh-12vh)] overflow-y-auto`}
              style={{ boxSizing: 'border-box' }}
            >
              {/* Frosted glass & glow layers behind the modal content (no negative inset) */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/8 via-[#00D1FF]/12 to-[#00D1FF]/8 rounded-2xl blur-lg opacity-50 pointer-events-none" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white/90">Select a Prompt</h3>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto px-1">
                  {scenarios.map((scenario) => (
                    <motion.button
                      key={scenario.id}
                      onClick={() => handleScenarioClick(scenario)}
                      className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 ${
                        selected === scenario.id ? 'border-[#00D1FF]' : 'border-white/10'
                      } ${!scenario.available ? 'opacity-60 cursor-not-allowed' : ''}`}
                      whileHover={scenario.available ? { scale: 1.02 } : {}}
                      disabled={!scenario.available}
                    >
                      {scenario.thumbnail ? (
                        scenario.available ? (
                          <div className="relative">
                            <img src={scenario.thumbnail} alt={scenario.name} className="w-full h-48 object-cover" />
                          </div>
                        ) : (
                          <div className="relative w-full h-48 bg-white/5">
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 text-center">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowUpgradePopup(true)
                                }}
                              >
                                <p className="text-white font-medium">Unlock Full Access</p>
                                <p className="text-white/60 text-sm">to unlock all features</p>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        // Special display for the "Custom" button
                        <div className="w-full h-48 flex flex-col items-center justify-center bg-white/5 text-white/40">
                          <PencilIcon className="w-12 h-12 mb-2 text-white/30" />
                          <span className="text-lg">Custom Style</span>
                        </div>
                      )}
                      <div className="p-2 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="text-white font-medium">{scenario.name}</div>
                        {!scenario.available && (
                           <div className="text-xs text-white/60 mt-1">
                           {scenario.id === 'none' ? 'Get full access' : 'Coming Soon'}
                         </div>
                        )}
                        {scenario.available && (
                          <div className="text-xs text-white/60 mt-1 line-clamp-2">{scenario.prompt}</div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-6 p-4 bg-gradient-to-r from-[#00D1FF]/10 to-[#00B8E6]/10 border border-[#00D1FF]/20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#00D1FF] to-[#00B8E6] rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">✨</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">More Styles Coming Soon!</h4>
                      <p className="text-white/60 text-xs">Pre-order now to get access to all styles when we launch</p>
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
              className="bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center"
            >
              <SparklesIcon className="w-12 h-12 text-[#00D1FF] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Unlock Full Access</h3>
              <p className="text-white/70 mb-6">Get access to all features, including custom prompts, all styles, and more.</p>
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