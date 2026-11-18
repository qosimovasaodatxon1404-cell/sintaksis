import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DIRECT_INDIRECT_ITEMS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty, DirectIndirectItem } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

export const DirectIndirectGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [items, setItems] = useState<DirectIndirectItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [displayOptions, setDisplayOptions] = useState<
    { text: string; isCorrect: boolean }[]
  >([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const prepareOptions = (item: DirectIndirectItem) =>
    shuffleArray(
      item.options.map((text, i) => ({
        text,
        isCorrect: i === item.correctIndex,
      }))
    );

  const startNewGame = useCallback((diff: Difficulty) => {
    const candidates = DIRECT_INDIRECT_ITEMS.filter(
      (i) => i.difficulty === diff
    );
    const chosen = shuffleArray(candidates).slice(0, 6);
    setItems(chosen);
    setIdx(0);
    setPicked(null);
    if (chosen[0]) setDisplayOptions(prepareOptions(chosen[0]));
    setScore(0);
    setMistakes([]);
    setFinished(false);
  }, []);

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty, startNewGame]);

  const current = items[idx];

  const handlePick = (optIdx: number) => {
    if (!current || picked !== null) return;
    setPicked(optIdx);
    const chosen = displayOptions[optIdx];
    if (chosen.isCorrect) {
      soundPlay('correct');
      setScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      setMistakes((prev) => [
        ...prev,
        {
          prompt: current.directSentence,
          yourAnswer: chosen.text,
          correctAnswer: current.options[current.correctIndex],
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
      setDisplayOptions(prepareOptions(items[nextIdx]));
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
        title="Ko‘chirma → O‘zlashtirma"
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
            Ko‘chirma → O‘zlashtirma
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Berilgan ko‘chirma gapning to‘g‘ri o‘zlashtirma shaklini tanlang.
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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="text-xs font-bold text-indigo-600 dark:text-teal-300 mb-1">
          Ko‘chirma gap:
        </div>
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {current.directSentence}
        </div>
      </div>

      <div className="space-y-2.5">
        {displayOptions.map((opt, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border font-bold text-sm transition-all min-h-[48px] ${
                picked !== null
                  ? opt.isCorrect
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isPicked
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-900 dark:text-white'
              }`}
            >
              {opt.text}
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
