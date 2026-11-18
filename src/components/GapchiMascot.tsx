import React from 'react';
import { motion } from 'motion/react';

export type GapchiMood = 'happy' | 'encouraging' | 'thinking' | 'celebrating';

interface GapchiMascotProps {
  mood?: GapchiMood;
  message: string;
  compact?: boolean;
}

export const GapchiMascot: React.FC<GapchiMascotProps> = ({
  mood = 'happy',
  message,
  compact = false,
}) => {
  const eyeY = mood === 'celebrating' ? 40 : 41;
  const mouthPath =
    mood === 'celebrating'
      ? 'M 40 54 Q 50 64 60 54'
      : mood === 'encouraging'
      ? 'M 42 56 Q 50 61 58 56'
      : mood === 'thinking'
      ? 'M 44 57 Q 50 55 56 57'
      : 'M 41 54 Q 50 62 59 54';

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-500/25 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md shadow-sm ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      }`}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="shrink-0"
        aria-hidden="true"
      >
        <svg
          width={compact ? 52 : 68}
          height={compact ? 52 : 68}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glow ring */}
          <circle cx="50" cy="52" r="42" className="fill-indigo-500/10 dark:fill-indigo-400/15" />
          {/* Body */}
          <rect
            x="22"
            y="24"
            width="56"
            height="58"
            rx="26"
            className="fill-indigo-600 dark:fill-indigo-500"
          />
          {/* Belly */}
          <rect
            x="32"
            y="50"
            width="36"
            height="28"
            rx="16"
            className="fill-indigo-100 dark:fill-slate-800"
          />
          {/* Graduation / Pencil Crest */}
          <path d="M50 8 L63 22 L37 22 Z" className="fill-amber-400" />
          <circle cx="50" cy="8" r="3.5" className="fill-rose-500" />
          {/* Face visor */}
          <rect
            x="28"
            y="31"
            width="44"
            height="32"
            rx="16"
            className="fill-white dark:fill-slate-900"
          />
          {/* Eyes */}
          {mood === 'celebrating' ? (
            <>
              <path d="M 35 42 Q 40 36 45 42" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 55 42 Q 60 36 65 42" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="40" cy={eyeY} r="4.2" className="fill-slate-900 dark:fill-white" />
              <circle cx="60" cy={eyeY} r="4.2" className="fill-slate-900 dark:fill-white" />
              <circle cx="41.5" cy={eyeY - 1.4} r="1.4" className="fill-white dark:fill-indigo-400" />
              <circle cx="61.5" cy={eyeY - 1.4} r="1.4" className="fill-white dark:fill-indigo-400" />
            </>
          )}
          {/* Cheeks */}
          <circle cx="33" cy="49" r="3" className="fill-rose-400/50" />
          <circle cx="67" cy="49" r="3" className="fill-rose-400/50" />
          {/* Mouth */}
          <path
            d={mouthPath}
            stroke="#0F172A"
            className="dark:stroke-white"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tiny punctuation mark on belly */}
          <text
            x="50"
            y="71"
            textAnchor="middle"
            className="fill-indigo-600 dark:fill-teal-300 font-bold"
            fontSize="14"
            fontFamily="serif"
          >
            ?!
          </text>
        </svg>
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold tracking-wide text-indigo-600 dark:text-teal-300">
          Gapchi — sintaksis yo‘lboshchisi
        </div>
        <p className="mt-0.5 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
          {message}
        </p>
      </div>
    </div>
  );
};
