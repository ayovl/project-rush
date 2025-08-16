'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface AspectRatioSelectorProps {
  selected: string
  onSelect: (ratio: string) => void
}

const aspectRatios = [
  { id: '1:1', name: 'Square', dimensions: '1024×1024' },
  { id: '16:9', name: 'Landscape', dimensions: '1920×1080' },
  { id: '9:16', name: 'Portrait', dimensions: '1080×1920' },
]

export default function AspectRatioSelector({ selected, onSelect, demoOnlyPortrait = false }: AspectRatioSelectorProps & { demoOnlyPortrait?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedRatio = aspectRatios.find(ratio => ratio.id === selected) || aspectRatios[0]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2.5 py-1.5 backdrop-blur-xl bg-white/10 border border-white/20 rounded-md text-white/90 hover:border-[#00D1FF]/70 transition-colors shadow-lg text-xs"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-1">
          <div className={`border border-current rounded-sm flex-shrink-0 flex items-center justify-center ${
            selected === '1:1' ? 'w-4 h-4' : 
            selected === '9:16' ? 'w-3 h-6' :
            selected === '16:9' ? 'w-6 h-3.5' :
            selected === '4:3' ? 'w-5 h-4' :
            'w-6 h-3.5'
          }`} />
        </div>
        <span className="font-medium ml-6 w-20 text-left">{selectedRatio.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-3 h-3" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            {/* Dropdown (now pops up above) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 w-52 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              {aspectRatios.map((ratio) => (
                <motion.button
                  key={ratio.id}
                  onClick={() => {
                    if (demoOnlyPortrait && ratio.id !== '9:16') return;
                    onSelect(ratio.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                    ratio.id === selected ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'text-white/80'
                  } ${demoOnlyPortrait && ratio.id !== '9:16' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  whileHover={demoOnlyPortrait && ratio.id !== '9:16' ? {} : { x: 4 }}
                  disabled={demoOnlyPortrait && ratio.id !== '9:16'}
                >
                  <div className="flex items-center min-h-[32px]">
                    <div className={`border border-current rounded-sm flex-shrink-0 flex items-center justify-center ${
                      ratio.id === '1:1' ? 'w-4 h-4' : 
                      ratio.id === '9:16' ? 'w-3 h-6' :
                      ratio.id === '16:9' ? 'w-6 h-3.5' :
                      ratio.id === '4:3' ? 'w-5 h-4' :
                      'w-6 h-3.5'
                    }`} />
                    <div className="flex flex-col justify-center ml-6 w-20 text-left">
                      <div className="text-sm font-medium leading-tight">{ratio.name}</div>
                      <div className="text-xs opacity-60 leading-tight">{ratio.dimensions}</div>
                    </div>
                  </div>
                  <span className="text-xs opacity-60 ml-auto">{ratio.id}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
