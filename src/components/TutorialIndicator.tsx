'use client'

import { motion } from 'framer-motion';

interface TutorialIndicatorProps {
  text: string;
  className?: string;
  arrowPath: string;
  viewBox: string;
  arrowClassName?: string;
  textClassName?: string;
}

const TutorialIndicator = ({ text, className, arrowPath, viewBox, arrowClassName, textClassName }: TutorialIndicatorProps) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0.0, 0.2, 1],
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <motion.svg
        viewBox={viewBox}
        className={`overflow-visible ${arrowClassName}`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
      >
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
          </marker>
        </defs>
        <motion.path
          d={arrowPath}
          stroke="white"
          strokeWidth="2"
          strokeDasharray="5 5"
          fill="none"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        />
      </motion.svg>
      <motion.p 
        className={`text-white/90 text-sm w-40 absolute ${textClassName}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
      >
        {text}
      </motion.p>
    </motion.div>
  );
};

export default TutorialIndicator;
