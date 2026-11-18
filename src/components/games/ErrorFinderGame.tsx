import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ERROR_FINDER_ITEMS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty, ErrorFinderItem } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

export const ErrorFinderGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [items, setItems] = useState<ErrorFinderItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [pickedSegment, setPickedSegment] = useState<number | null>(null);
  const [pickedReplacement, setPickedReplacement] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const startNewGame = useCallback(
    (diff: Difficulty) => {
      let candidates = ERROR_FINDER_ITEMS.filter((i) => i.difficulty === diff);
      if (moduleFilter) {
        const modMatch = ERROR_FINDER_ITEMS.filter(
          (i) => i.moduleId === moduleFilter
        );
        if (modMatch.length >= 2) candidates = modMatch;
      }
      const chosen = shuffleArray(candidates).slice(0, 6);
      setItems(chosen);
      setIdx(0);
      setPickedSegment(null);
      setPickedReplacement(null);
      if (chosen[0]) {
        setShuffledOptions(shuffleArray(chosen[0].options));
      }
      setScore(0);
      setMistakes([]);
      setFinished(false);
    },
    [moduleFilter]
  );

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty, startNewGame]);

  const current = items[idx];

  const handleSegmentClick = (segIdx: number) => {
    if (!current || pickedReplacement !== null) return;
    if (segIdx === current.errorIndex) {
      soundPlay('click');
      setPickedSegment(segIdx);
    } else {
      soundPlay('wrong');
      setPickedSegment(segIdx);
    }
  };

  const handlePickReplacement = (opt: string) => {
    if (!current || pickedReplacement !== null) return;
    setPickedReplacement(opt);
    const isRight =
      pickedSegment === current.errorIndex && opt === current.correctReplacement;
    if (isRight) {
      soundPlay('correct');
      setScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      setMistakes((prev) => [
        ...prev,
        {
          prompt: current.segments.join(' '),
          yourAnswer: `${current.segments[pickedSegment ?? 0]} → ${opt}`,
          correctAnswer: `${current.segments[current.errorIndex]} → ${current.correctReplacement}`,
          explanation: current.explanation,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (idx + 1 < items.length) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setPickedSegment(null);
      setPickedReplacement(null);
      setShuffledOptions(shuffleArray(items[nextIdx].options));
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
        title="Xatoni top"
        score={score}
        maxScore={items.length}
        xpEarned={xp}
        mistakes={mistakes}
        onReplay={() => startNewGame(difficulty)}
      />
    );
  }

  if (!current) return null;

  const foundErrorWord = pickedSegment === current.errorIndex;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Xatoni top
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            1-qadam: Xato yozilgan so‘z yoki belgini bosing. 2-qadam: To‘g‘ri variantni tanlang.
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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap gap-2">
        {current.segments.map((seg, i) => {
          const isSelected = pickedSegment === i;
          const isErrorPos = i === current.errorIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={pickedReplacement !== null}
              onClick={() => handleSegmentClick(i)}
              className={`px-3.5 py-2 rounded-xl font-bold text-base sm:text-lg border transition-all min-h-[44px] ${
                isSelected && isErrorPos
                  ? 'bg-amber-100 dark:bg-amber-500/25 border-amber-500 text-amber-900 dark:text-amber-200'
                  : isSelected && !isErrorPos
                  ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-400 text-rose-700 dark:text-rose-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-indigo-400'
              }`}
            >
              {seg}
            </button>
          );
        })}
      </div>

      {pickedSegment !== null && !foundErrorWord && pickedReplacement === null && (
        <div className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
          Bu so‘z to‘g‘ri yozilgan. Boshqa so‘z yoki belgini sinab ko‘ring!
        </div>
      )}

      {foundErrorWord && (
        <div className="space-y-3 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/10 p-4">
          <div className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
            Xato joyni topdingiz! Endi «{current.segments[current.errorIndex]}» o‘rniga to‘g‘risini tanlang:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {shuffledOptions.map((opt) => {
              const isChosen = pickedReplacement === opt;
              const isCorrect = opt === current.correctReplacement;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={pickedReplacement !== null}
                  onClick={() => handlePickReplacement(opt)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-all min-h-[44px] ${
                    pickedReplacement !== null
                      ? isCorrect
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isChosen
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
        </div>
      )}

      {pickedReplacement !== null && (
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
