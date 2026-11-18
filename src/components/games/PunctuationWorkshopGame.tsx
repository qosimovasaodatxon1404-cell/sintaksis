import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PUNCTUATION_ITEMS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty, PunctuationSlotItem } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

export const PunctuationWorkshopGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [items, setItems] = useState<PunctuationSlotItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const startNewGame = useCallback(
    (diff: Difficulty) => {
      let candidates = PUNCTUATION_ITEMS.filter((i) => i.difficulty === diff);
      if (moduleFilter) {
        const modMatch = PUNCTUATION_ITEMS.filter(
          (i) => i.moduleId === moduleFilter
        );
        if (modMatch.length >= 3) candidates = modMatch;
      }
      const chosen = shuffleArray(candidates).slice(0, 6);
      setItems(chosen);
      setIdx(0);
      if (chosen[0]) {
        setSlots(chosen[0].correctMarks.map(() => ''));
      }
      setActiveSlot(0);
      setChecked(false);
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

  const handleSelectMark = (mark: string) => {
    if (checked || !current) return;
    soundPlay('click');
    const nextSlots = [...slots];
    nextSlots[activeSlot] = mark;
    setSlots(nextSlots);
    if (activeSlot + 1 < current.correctMarks.length) {
      setActiveSlot(activeSlot + 1);
    }
  };

  const handleCheck = () => {
    if (!current) return;
    const isCorrect = current.correctMarks.every((m, i) => slots[i] === m);
    setChecked(true);
    if (isCorrect) {
      soundPlay('correct');
      setScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      const renderSentence = (marks: string[]) =>
        current.segments
          .map((seg, i) => `${seg}${marks[i] ? ` ${marks[i]} ` : ' '}`)
          .join('')
          .replace(/\s+/g, ' ')
          .trim();

      setMistakes((prev) => [
        ...prev,
        {
          prompt: current.segments.join(' [ ] '),
          yourAnswer: renderSentence(slots),
          correctAnswer: renderSentence(current.correctMarks),
          explanation: current.explanation,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (idx + 1 < items.length) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setSlots(items[nextIdx].correctMarks.map(() => ''));
      setActiveSlot(0);
      setChecked(false);
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
        title="Tinish belgilari ustaxonasi"
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
            Tinish belgilari ustaxonasi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Bo‘sh katakchani tanlang va unga mos tinish belgisini bosing.
          </p>
        </div>
        {!moduleFilter && (
          <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
        )}
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">
        <span>
          Topshiriq {idx + 1} / {items.length}
        </span>
        <span>Ball: {score}</span>
      </div>

      {/* Gap katakchalari */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap items-center gap-2 text-base sm:text-lg font-bold leading-relaxed">
        {current.segments.map((seg, i) => (
          <React.Fragment key={i}>
            {seg && <span className="text-slate-900 dark:text-slate-100">{seg}</span>}
            {i < current.correctMarks.length && (
              <button
                type="button"
                disabled={checked}
                onClick={() => setActiveSlot(i)}
                className={`min-w-[44px] min-h-[42px] px-2.5 py-1 rounded-xl border-2 text-center font-mono transition-all ${
                  checked
                    ? slots[i] === current.correctMarks[i]
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : activeSlot === i
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                    : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {slots[i] === '' ? '∅' : slots[i]}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Belgilar paneli */}
      <div className="flex flex-wrap gap-2">
        {current.availableMarks.map((mark, i) => (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => handleSelectMark(mark)}
            className="min-w-[56px] min-h-[46px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 font-bold text-base text-slate-900 dark:text-white shadow-sm transition-colors"
          >
            {mark === '' ? 'Kerak emas' : mark}
          </button>
        ))}
      </div>

      {checked && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 text-sm space-y-1">
          <div className="font-bold text-slate-900 dark:text-white">
            To‘g‘ri belgilar: {current.correctMarks.map((m) => (m === '' ? '(yo‘q)' : m)).join('  |  ')}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {current.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <button
            type="button"
            onClick={handleCheck}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Tekshirish
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors min-h-[44px]"
          >
            Keyingi
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
