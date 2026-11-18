import React from 'react';
import { ROLE_META } from '../data/modules';
import { SyntaxRole } from '../types/syntax';

const ORDERED_ROLES: SyntaxRole[] = [
  'ega',
  'kesim',
  'toldiruvchi',
  'aniqlovchi',
  'hol',
  'other',
];

interface ColorLegendProps {
  compact?: boolean;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({ compact = false }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/75 backdrop-blur-md ${
        compact ? 'px-3.5 py-2.5' : 'p-4 sm:p-5'
      }`}
      aria-label="Gap bo‘laklari rang kaliti"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          Rang kaliti:
        </span>
        {ORDERED_ROLES.map((role) => {
          const meta = ROLE_META[role];
          return (
            <div
              key={role}
              className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: meta.hex }}
                aria-hidden="true"
              />
              <span className={`font-bold ${meta.textClass} ${meta.underlineClass}`}>
                {meta.label}
              </span>
              {!compact && (
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                  ({meta.question})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
