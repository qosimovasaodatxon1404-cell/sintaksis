import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ROLE_META } from '../data/modules';
import { ModuleExample, SentenceToken } from '../types/syntax';

interface InteractiveSentenceProps {
  example: ModuleExample;
  index: number;
}

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({
  example,
  index,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SentenceToken | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {index + 1}-misol · {example.source}
        </div>
        <button
          type="button"
          onClick={() => {
            setRevealed((v) => !v);
            setSelectedToken(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
        >
          {revealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              Yopish
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              Tahlilni ko‘rish
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-2 leading-relaxed">
        {example.tokens.map((token, idx) => {
          const meta = ROLE_META[token.role];
          const isSelected = selectedToken === token;
          return (
            <button
              key={`${example.id}-${idx}`}
              type="button"
              onClick={() => {
                setRevealed(true);
                setSelectedToken(token);
              }}
              className={`rounded-lg px-2 py-1 text-base sm:text-lg font-bold transition-all focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                revealed
                  ? `${meta.bgClass} ${meta.textClass} ${meta.underlineClass} ${
                      isSelected ? 'ring-2 ring-indigo-500 scale-[1.03]' : ''
                    }`
                  : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={revealed ? `${meta.label}${token.question ? `: ${token.question}` : ''}` : 'Tahlil uchun bosing'}
            >
              {token.text}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {selectedToken && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-xs sm:text-sm">
              <span className="font-bold text-slate-900 dark:text-white">
                «{selectedToken.text}»
              </span>{' '}
              —{' '}
              <span className={`font-bold ${ROLE_META[selectedToken.role].textClass}`}>
                {ROLE_META[selectedToken.role].label}
              </span>
              {selectedToken.question && (
                <span className="text-slate-600 dark:text-slate-300">
                  {' '}
                  (So‘rog‘i: {selectedToken.question})
                </span>
              )}
              {selectedToken.note && (
                <span className="text-slate-500 dark:text-slate-400">
                  {' '}
                  · {selectedToken.note}
                </span>
              )}
            </div>
          )}
          <div className="text-xs font-mono text-indigo-700 dark:text-teal-300">
            Sxema: {example.schema}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {example.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
