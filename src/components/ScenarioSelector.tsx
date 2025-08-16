'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image';

interface ScenarioSelectorProps {
  selected: string
  onSelect: (scenario: string) => void
  onPromptUpdate: (prompt: string) => void
}

const scenarios = [
  {
    id: 'none',
    name: 'None',
    prompt: '',
    thumbnail: '',
  },
  {
    id: 'professional-headshot',
    name: 'Professional Headshot',
    prompt: 'Professional business headshot, clean background, confident expression, professional attire',
    thumbnail: '/api/placeholder/240x240'
  },
  {
    id: 'casual-portrait',
    name: 'Casual Portrait',
    prompt: 'Casual portrait photo, natural lighting, relaxed expression, everyday clothing',
    thumbnail: '/api/placeholder/240x241'
  },
  {
    id: 'artistic-creative',
    name: 'Artistic Creative',
    prompt: 'Creative artistic portrait, dramatic lighting, artistic composition, expressive mood',
    thumbnail: '/api/placeholder/240x242'
  },
  {
    id: 'outdoor-lifestyle',
    name: 'Outdoor Lifestyle',
    prompt: 'Outdoor lifestyle photo, natural environment, candid expression, casual outdoor setting',
    thumbnail: '/api/placeholder/240x243'
  },
  {
    id: 'fashion-style',
    name: 'Fashion Style',
    prompt: 'Fashion style photo, trendy outfit, stylish pose, modern aesthetic',
    thumbnail: '/api/placeholder/240x244'
  },
  {
    id: 'vintage-retro',
    name: 'Vintage Retro',
    prompt: 'Vintage retro style photo, classic aesthetic, nostalgic mood, retro fashion',
    thumbnail: '/api/placeholder/240x245'
  }
]

export default function ScenarioSelector({ selected, onSelect, onPromptUpdate }: ScenarioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [anchorTop, setAnchorTop] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const handleScenarioClick = (scenario: typeof scenarios[0]) => {
    onSelect(scenario.id)
    onPromptUpdate(scenario.prompt)
    setIsOpen(false)
  }

  const handleClearSelection = () => {
    onSelect('')
    onPromptUpdate('')
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
      // If modal height is greater than available viewport minus a small gap, anchor to top
      if (modalHeight > viewport - 96) {
        setAnchorTop(true)
      } else {
        setAnchorTop(false)
      }
    }

    // Run on next frame to allow layout
    requestAnimationFrame(checkPosition)

    const onResize = () => requestAnimationFrame(checkPosition)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isOpen])

  return (
    <div className="relative">
      {/* Style selector matching exact input field height */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`w-40 h-53 rounded-3xl overflow-hidden flex flex-col items-center justify-center border backdrop-blur-xl bg-white/5 shadow-2xl shadow-black/20 transition-all duration-200 ${
          selected ? 'border-[#00D1FF]/70 ring-2 ring-[#00D1FF]/30' : 'border-white/20 hover:border-[#00D1FF]/50'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {selectedObj ? (
          <>
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3">
                            <Image src={selectedObj.thumbnail} alt={selectedObj.name} width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-white/80 text-center px-2 leading-tight font-medium">{selectedObj.name}</span>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00D1FF]/40 to-[#00B8E6]/40 rounded-2xl mb-3" />
            <span className="text-sm text-white/60 text-center">Select Style</span>
          </div>
        )}
      </motion.button>

      {/* Modal with larger thumbnails (portalled to document.body so it overlays everything) */}
      {typeof document !== 'undefined' && createPortal(
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
                className={`fixed z-[9999] left-1/2 ${anchorTop ? 'top-[6vh] sm:top-[6vh] sm:translate-y-0' : 'top-1/2 sm:top-1/2 sm:-translate-y-1/2'} transform -translate-x-1/2 w-[min(880px,92%)] max-w-[880px] rounded-2xl p-6 shadow-2xl max-h-[calc(100vh-12vh)] overflow-y-auto`}
                style={{ boxSizing: 'border-box' }}
              >
                {/* Frosted glass & glow layers behind the modal content (no negative inset) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/8 via-[#00D1FF]/12 to-[#00D1FF]/8 rounded-2xl blur-lg opacity-50 pointer-events-none" />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white/90">Select a Prompt</h3>
                    <div className="flex items-center space-x-3">
                      {selected && selected !== 'none' && (
                        <motion.button
                          onClick={handleClearSelection}
                          className="text-sm text-white/60 hover:text-[#00D1FF] transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          Clear
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => setIsOpen(false)}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                    {scenarios.map((scenario) => (
                      <motion.button
                        key={scenario.id}
                        onClick={() => handleScenarioClick(scenario)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 ${
                          selected === scenario.id ? 'border-[#00D1FF]' : 'border-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        {scenario.thumbnail ? (
                                                    <Image src={scenario.thumbnail} alt={scenario.name} width={240} height={192} className="w-full h-48 object-cover" />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center bg-white/5 text-white/40 text-lg">None</div>
                        )}
                        <div className="p-3 bg-gradient-to-t from-black/50 to-transparent">
                          <div className="text-white font-medium">{scenario.name}</div>
                          <div className="text-xs text-white/60 mt-1 line-clamp-2">{scenario.prompt}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
