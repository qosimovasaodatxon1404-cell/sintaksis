import React from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Difficulty } from '../../types/syntax';
import { GapchiMascot } from '../GapchiMascot';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  onChange,
  disabled,
}) => {
  const levels: { id: Difficulty; label: string }[] = [
    { id: 'oson', label: 'Oson' },
    { id: 'orta', label: 'O‘rta' },
    { id: 'qiyin', label: 'Qiyin' },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
      role="group"
      aria-label="Qiyinlik darajasi"
    >
      {levels.map((lvl) => (
        <button
          key={lvl.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(lvl.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap min-h-[36px] ${
            difficulty === lvl.id
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {lvl.label}
        </button>
      ))}
    </div>
  );
};

export interface MistakeRecord {
  prompt: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface GameResultViewProps {
  title: string;
  score: number;
  maxScore: number;
  xpEarned: number;
  mistakes: MistakeRecord[];
  onReplay: () => void;
}

export const GameResultView: React.FC<GameResultViewProps> = ({
  title,
  score,
  maxScore,
  xpEarned,
  mistakes,
  onReplay,
}) => {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
  const mascotMsg =
    pct >= 80
      ? 'Barakalla! Sen haqiqiy sintaksis ustasi ekaningni isbotlading!'
      : pct >= 50
      ? 'Yaxshi natija! Xatolarni ko‘rib chiqsang, yanada zo‘r bo‘ladi!'
      : 'Yana urinib ko‘r, sen albatta uddalaysan!';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-900 p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 mx-auto">
          <Trophy className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {title} — Natija
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            To‘plangan ball: <strong className="tabular-nums text-slate-900 dark:text-white">{score} / {maxScore}</strong> ({pct}%) · +{xpEarned} XP
          </p>
        </div>

        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Qayta o‘ynash
        </button>
      </div>

      <GapchiMascot
        mood={pct >= 80 ? 'celebrating' : 'encouraging'}
        message={mascotMsg}
      />

      {mistakes.length > 0 && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h4 className="font-display text-base font-bold text-rose-700 dark:text-rose-300">
            Xatolar tahlili ({mistakes.length} ta)
          </h4>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 text-sm space-y-1"
              >
                <div className="font-bold text-slate-900 dark:text-white">
                  {m.prompt}
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400">
                  Sizning javobingiz: {m.yourAnswer}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  To‘g‘ri javob: {m.correctAnswer}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                  {m.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
