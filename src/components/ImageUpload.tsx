'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void
  uploadedImage: File | null
  isDemo?: boolean
}

export default function ImageUpload({ onImageUpload, uploadedImage, isDemo = false }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // For demo mode, use a static demo image
  const demoImageUrl = '/api/placeholder/150x150?text=Demo+Person'

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) return // Disable file selection in demo mode
    
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemove = () => {
    if (isDemo) return // Disable removal in demo mode
    
    onImageUpload(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (isDemo) return // Disable clicking in demo mode
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {(previewUrl || (isDemo && uploadedImage)) ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-20 h-20 rounded-xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 group shadow-lg"
        >
          <img
            src={isDemo ? demoImageUrl : (previewUrl || '')}
            alt="Character reference"
            className="w-full h-full object-cover"
          />
          {!isDemo && (
            <motion.button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="w-4 h-4" />
            </motion.button>
          )}
          {isDemo && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
              <span className="text-white text-xs font-medium">Demo</span>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.button
          onClick={handleClick}
          className="w-20 h-20 border border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center hover:border-[#00D1FF]/70 transition-colors group backdrop-blur-xl bg-white/5 hover:bg-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PhotoIcon className="w-6 h-6 text-white/60 group-hover:text-[#00D1FF] transition-colors" />
          <span className="text-xs text-white/60 mt-1 group-hover:text-[#00D1FF] transition-colors">Add Ref</span>
        </motion.button>
      )}
    </div>
  )
}
