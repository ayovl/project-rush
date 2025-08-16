'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface DemoScenarioSelectorProps {
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
    available: true
  },
  {
    id: 'professional-headshot',
    name: 'Professional Headshot',
    prompt: 'Professional business headshot, clean background, confident expression, professional attire',
    thumbnail: '/api/placeholder/240x240',
    available: true
  },
  {
    id: 'artistic-creative',
    name: 'Artistic Creative',
    prompt: 'Creative artistic portrait, dramatic lighting, artistic composition, expressive mood',
    thumbnail: '/api/placeholder/240x242',
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
  const [anchorTop, setAnchorTop] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const handleScenarioClick = (scenario: typeof scenarios[0]) => {
    if (!scenario.available) return
    
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

  const modal = isOpen ? createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal content */}
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-4xl w-full max-h-[90vh] bg-[#0F1417]/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white mb-2">Choose a Style</h3>
          <p className="text-white/60 text-sm">Select a style template to get started</p>
        </div>

        {/* Scenario Grid */}
        <div className="w-40 h-53 p-6 overflow-y-auto max-h-[100vh]">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {scenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 ${scenario.available ? (selected === scenario.id ? 'border-[#00D1FF] bg-[#00D1FF]/10' : 'border-white/20 hover:border-white/40 bg-white/5') : 'border-white/10 bg-white/5 opacity-60 cursor-not-allowed'}`} 
                whileHover={scenario.available ? { scale: 1.02 } : {}}
                whileTap={scenario.available ? { scale: 0.98 } : {}}
                onClick={() => handleScenarioClick(scenario)}
              >
                {/* Thumbnail */}
                {scenario.id !== 'none' && (
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-[#00D1FF]/10 to-[#0099CC]/8">
                    <img 
                      src={scenario.thumbnail} 
                      alt={scenario.name}
                      className={`w-full h-full object-cover ${!scenario.available ? 'grayscale' : ''}`}
                      style={{ objectPosition: 'center', objectFit: 'cover' }}
                    />
                    {!scenario.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white/80 text-xs font-medium">Coming Soon</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="p-2">
                  <h4 className={`font-medium text-sm mb-1 ${scenario.available ? 'text-white/90' : 'text-white/50'}`}>
                    {scenario.name}
                  </h4>
                  {scenario.prompt && (
                    <p className={`text-xs leading-tight ${scenario.available ? 'text-white/60' : 'text-white/40'}`}>
                      {scenario.prompt}
                    </p>
                  )}
                </div>

                {/* Selection indicator */}
                {selected === scenario.id && scenario.available && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#00D1FF] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </motion.div>
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

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={handleClearSelection}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-medium rounded-lg text-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  ) : null

  return (
    <>
      {/* Selector Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`h-53 w-40 rounded-3xl overflow-hidden flex flex-col items-center justify-center border backdrop-blur-xl bg-white/5 shadow-2xl shadow-black/20 transition-all duration-200 ${
          selected ? 'border-[#00D1FF]/70 ring-2 ring-[#00D1FF]/30' : 'border-white/20 hover:border-[#00D1FF]/50'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {selectedObj && selectedObj.id !== 'none' ? (
          <>
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3">
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
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00D1FF]/40 to-[#00B8E6]/40 rounded-2xl mb-3" />
            <span className="text-sm text-white/60 text-center">Select Style</span>
          </div>
        )}
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4 text-white/40 group-hover:text-white/60" />
        </motion.div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {modal}
      </AnimatePresence>
    </>
  )
}
