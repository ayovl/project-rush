'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void
  uploadedImage: File | null | string
  isDemo?: boolean
  demoImageUrl?: string
}


export default function ImageUpload({ onImageUpload, uploadedImage, isDemo = false, demoImageUrl }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const [expanded, setExpanded] = useState(false)
  const imageUrl = isDemo ? (typeof uploadedImage === 'string' ? uploadedImage : (demoImageUrl || '')) : (previewUrl || '')

  return (
    <Fragment>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {(imageUrl) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-20 h-20 rounded-xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 group shadow-lg cursor-pointer"
            onClick={() => setExpanded(true)}
            title="Click to expand"
          >
            <img
              src={imageUrl}
              alt="Character reference"
              className="w-full h-full object-cover"
            />
            {!isDemo && (
              <motion.button
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => { e.stopPropagation(); handleRemove(); }}
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
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
      {/* Expanded modal */}
      <Transition.Root show={expanded} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setExpanded(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative bg-white/10 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col items-center backdrop-blur-2xl border border-white/20">
                <button
                  onClick={() => setExpanded(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
                  aria-label="Close expanded image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Expanded reference"
                    className="rounded-2xl max-h-[80vh] w-auto object-contain bg-white/5"
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </Fragment>
  )
}
