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

export default function AspectRatioSelector({ selected, onSelect }: AspectRatioSelectorProps) {
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
          <div className={`w-2.5 h-2 border border-current rounded-sm ${
            selected === '1:1' ? 'w-2 h-2' : 
            selected === '9:16' ? 'w-1.5 h-2.5' :
            selected === '16:9' ? 'w-3.5 h-2' :
            selected === '4:3' ? 'w-2.5 h-2' :
            'w-2.5 h-2'
          }`} />
          <span className="font-medium">{selectedRatio.name}</span>
        </div>
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
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-52 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              {aspectRatios.map((ratio) => (
                <motion.button
                  key={ratio.id}
                  onClick={() => {
                    onSelect(ratio.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                    ratio.id === selected ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'text-white/80'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`border border-current rounded-sm ${
                      ratio.id === '1:1' ? 'w-3 h-3' : 
                      ratio.id === '9:16' ? 'w-2 h-4' :
                      ratio.id === '16:9' ? 'w-5 h-3' :
                      ratio.id === '4:3' ? 'w-4 h-3' :
                      'w-4 h-3'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{ratio.name}</div>
                      <div className="text-xs opacity-60">{ratio.dimensions}</div>
                    </div>
                  </div>
                  <span className="text-xs opacity-60">{ratio.id}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
