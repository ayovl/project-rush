'use client'

import React, { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

interface GeneratedResultsProps {
  results: string[]
  isGenerating: boolean
}

export default function GeneratedResults({ results, isGenerating }: GeneratedResultsProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleExpand = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseExpand = () => {
    setExpandedImage(null);
  };

  // Show shimmering placeholders during generation
  if (isGenerating) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={`shimmer-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative aspect-square backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl overflow-hidden shadow-lg"
          >
            {/* Shimmer animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D1FF]/20 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </div>
            
            {/* Loading text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/60 text-sm font-medium">Generating...</div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map((imageUrl, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-square backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-[#00D1FF]/70 transition-colors shadow-lg"
            onClick={() => handleExpand(imageUrl)}
          >
            <Image
              src={imageUrl}
              alt={`Generated image ${index + 1}`}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all backdrop-blur-sm border border-white/20"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 backdrop-blur-sm bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20"
                >
                  <ShareIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded image modal */}
      <Transition.Root show={!!expandedImage} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseExpand}>
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
              <Dialog.Panel className="relative bg-white/10 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
                <button
                  onClick={handleCloseExpand}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
                  aria-label="Close expanded image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {expandedImage && (
                  <Image
                    src={expandedImage}
                    alt="Expanded result"
                    width={1920}
                    height={1080}
                    className="rounded-2xl max-h-[80vh] w-auto object-contain bg-white/5"
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

