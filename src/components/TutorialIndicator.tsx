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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
    >
      <svg
        viewBox={viewBox}
        className={`overflow-visible ${arrowClassName}`}
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
        <path
          d={arrowPath}
          stroke="white"
          strokeWidth="2"
          strokeDasharray="5 5"
          fill="none"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
        />
      </svg>
      <p className={`text-white/80 text-sm w-40 ${textClassName}`}>{text}</p>
    </motion.div>
  );
};

export default TutorialIndicator;
