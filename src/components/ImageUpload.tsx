'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image';
import { motion } from 'framer-motion'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void
  uploadedImage: File | null | string
  isDemo?: boolean
  demoImageUrl?: string
  onDemoRemoveClick?: () => void
}


export default function ImageUpload({ onImageUpload, uploadedImage, isDemo = false, demoImageUrl, onDemoRemoveClick }: ImageUploadProps) {
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
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 group shadow-lg cursor-pointer z-10 pointer-events-auto"
            onClick={() => setExpanded(true)}
            title="Click to expand"
            style={{ touchAction: 'manipulation' }}
          >
            <Image
              src={imageUrl}
              alt="Character reference"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
            <motion.button
              className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={e => { 
                e.stopPropagation(); 
                if (isDemo) {
                  onDemoRemoveClick?.();
                } else {
                  handleRemove();
                }
              }}
            >
              <XMarkIcon className="w-2 h-2 sm:w-3 sm:h-3" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            onClick={handleClick}
            className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-white/30 rounded-lg sm:rounded-xl flex flex-col items-center justify-center hover:border-[#00D1FF]/70 transition-colors group backdrop-blur-xl bg-white/5 hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PhotoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-[#00D1FF] transition-colors" />
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full h-full flex items-center justify-center">
                <button
                  onClick={() => setExpanded(false)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label="Close expanded image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {imageUrl && (
                  <div className="relative w-full h-full p-2 sm:p-0">
                    <Image
                      src={imageUrl}
                      alt="Expanded reference"
                      layout="fill"
                      objectFit="contain"
                      className="z-10"
                    />
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </Fragment>
  )
}
