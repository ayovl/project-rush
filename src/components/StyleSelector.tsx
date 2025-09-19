'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface StyleSelectorProps {
  selected: string
  onSelect: (style: string) => void
}

const styles = [
  { id: 'realistic', name: 'Realistic', preview: '📸' },
  { id: 'artistic', name: 'Artistic', preview: '🎨' },
  { id: 'anime', name: 'Anime', preview: '🌸' },
  { id: 'digital-art', name: 'Digital Art', preview: '💻' },
  { id: 'fantasy', name: 'Fantasy', preview: '🧙‍♂️' },
  { id: 'portrait', name: 'Portrait', preview: '👤' },
]

export default function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedStyle = styles.find(style => style.id === selected) || styles[0]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg text-white/90 hover:border-[#00D1FF]/70 transition-colors shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm">{selectedStyle.preview}</span>
        <span className="text-sm font-medium">{selectedStyle.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-48 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl z-[60] overflow-hidden"
            >
              {styles.map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => {
                    onSelect(style.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                    style.id === selected ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'text-white/80'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <span className="text-lg">{style.preview}</span>
                  <span className="text-sm font-medium">{style.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
