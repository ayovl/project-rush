
"use client";

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AspectRatioSelectorProps {
  selected: string;
  onSelect: (ratio: string) => void;
  demoOnlyPortrait?: boolean;
  demoOnlySquare?: boolean;
}

const aspectRatios = [
  { id: '1:1', name: 'Square', dimensions: '1024×1024' },
  { id: '16:9', name: 'Landscape', dimensions: '1920×1080' },
  { id: '9:16', name: 'Portrait', dimensions: '1080×1920' },
];

export default function AspectRatioSelector({ selected, onSelect, demoOnlyPortrait = false, demoOnlySquare = false }: AspectRatioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const selectedRatio = aspectRatios.find(ratio => ratio.id === selected) || aspectRatios[0];

  // Update dropdown position (directly above the button, centered horizontally)
  const updatePosition = () => {
    const btn = buttonRef.current;
    const dd = dropdownRef.current;
    if (!btn || !dd) return;
    const br = btn.getBoundingClientRect();
    const ddw = dd.offsetWidth;
    const ddh = dd.offsetHeight;
    // Position above the button, centered horizontally, with an 8px gap
    const top = br.top + window.scrollY - ddh - 8;
    const left = br.left + window.scrollX + (br.width / 2) - (ddw / 2);
    // Constrain to viewport so it doesn't go off-screen
    const safeTop = Math.max(8 + window.scrollY, Math.min(top, window.scrollY + window.innerHeight - ddh - 8));
    const safeLeft = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - ddw - 8));
    setCoords({ top: safeTop, left: safeLeft });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const dropdown = (
    <>
      {/* overlay sits below dropdown but above page content */}
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40"
      />
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ WebkitBackdropFilter: 'blur(30px)', backdropFilter: 'blur(30px)', position: 'absolute', top: coords.top, left: coords.left }}
        className="z-50 w-40 sm:w-44 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg sm:rounded-xl shadow-2xl overflow-hidden"
      >
        {aspectRatios.map((ratio) => {
          const isPortraitLocked = demoOnlyPortrait && ratio.id !== '9:16';
          const isSquareLocked = demoOnlySquare && ratio.id !== '1:1';
          const isLocked = isPortraitLocked || isSquareLocked;
          return (
            <motion.button
              key={ratio.id}
              onClick={() => {
                if (isLocked) return;
                onSelect(ratio.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-2 sm:px-3 py-2 sm:py-2.5 text-left hover:bg-white/10 transition-colors ${
                ratio.id === selected ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'text-white/80'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              whileHover={isLocked ? {} : { x: 4 }}
              disabled={isLocked}
            >
              <div className={`flex-shrink-0 border border-current rounded-sm mr-2 sm:mr-3 ${
                ratio.id === '1:1' ? 'w-3.5 h-3.5' :
                ratio.id === '9:16' ? 'w-2.5 h-5' :
                ratio.id === '16:9' ? 'w-5 h-3' :
                'w-4 h-3'
              }`} />
              <div className="flex-1 text-xs sm:text-sm font-medium leading-tight">{ratio.name}</div>
            </motion.button>
          );
        })}
      </motion.div>
    </>
  );

  return (
    <div className="relative inline-block">
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center h-8 sm:h-auto px-1.5 sm:px-2 py-1 sm:py-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-md text-white/90 hover:border-[#00D1FF]/70 transition-colors shadow-lg text-xs"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`border border-current rounded-sm flex-shrink-0 mr-1 sm:mr-2 ${
          selected === '1:1' ? 'w-3.5 h-3.5' : 
          selected === '9:16' ? 'w-2.5 h-5' :
          selected === '16:9' ? 'w-5 h-3' :
          selected === '4:3' ? 'w-4 h-3' :
          'w-5 h-3'
        }`} />
        <span className="font-medium mr-0.5 sm:mr-1 text-xs sm:text-sm">{selectedRatio.name}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="inline-block"
        >
          <ChevronDownIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </motion.span>
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>{dropdown}</AnimatePresence>,
        document.body
      )}
    </div>
  );
}
