import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CLAUSE_DETECTIVE_ITEMS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { ClauseDetectiveItem, Difficulty } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

export const ClauseDetectiveGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [items, setItems] = useState<ClauseDetectiveItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const startNewGame = useCallback((diff: Difficulty) => {
    const candidates = CLAUSE_DETECTIVE_ITEMS.filter(
      (i) => i.difficulty === diff
    );
    const chosen = shuffleArray(candidates).slice(0, 6);
    setItems(chosen);
    setIdx(0);
    setPicked(null);
    if (chosen[0]) {
      setOptions(shuffleArray(chosen[0].options));
    }
    setScore(0);
    setMistakes([]);
    setFinished(false);
  }, []);

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty, startNewGame]);

  const current = items[idx];

  const handlePick = (opt: string) => {
    if (!current || picked !== null) return;
    setPicked(opt);
    if (opt === current.correctType) {
      soundPlay('correct');
      setScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      setMistakes((prev) => [
        ...prev,
        {
          prompt: current.sentence,
          yourAnswer: opt,
          correctAnswer: current.correctType,
          explanation: current.explanation,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (idx + 1 < items.length) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setPicked(null);
      setOptions(shuffleArray(items[nextIdx].options));
    } else {
      setFinished(true);
      const xp = score * 8 + (score === items.length ? 15 : 0);
      if (score >= Math.ceil(items.length * 0.7)) launchConfetti();
      recordGameFinish({ won: score >= 4, xp });
    }
  };

  if (finished) {
    const xp = score * 8 + (score === items.length ? 15 : 0);
    return (
      <GameResultView
        title="Ergash gap detektivi"
        score={score}
        maxScore={items.length}
        xpEarned={xp}
        mistakes={mistakes}
        onReplay={() => startNewGame(difficulty)}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Ergash gap detektivi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Ajratib ko‘rsatilgan ergash gapning ma’no turini aniqlang.
          </p>
        </div>
        {!moduleFilter && (
          <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
        )}
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">
        <span>
          Gap {idx + 1} / {items.length}
        </span>
        <span>Ball: {score}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {current.sentence}
        </div>
        <div className="rounded-xl bg-violet-50 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30 px-3.5 py-2 text-xs sm:text-sm font-semibold text-violet-800 dark:text-violet-200">
          Ergash gap: «{current.subordinateClause}»
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === current.correctType;
          return (
            <button
              key={opt}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(opt)}
              className={`text-left px-4 py-3 rounded-xl border font-bold text-sm transition-all min-h-[48px] ${
                picked !== null
                  ? isCorrect
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isPicked
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-900 dark:text-white'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-2">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {current.explanation}
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors min-h-[44px]"
            >
              Keyingi
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
