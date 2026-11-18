import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react';
import { SENTENCE_BUILDER_ITEMS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty, SentenceBuilderItem } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

interface WordChip {
  uid: string;
  word: string;
}

export const SentenceBuilderGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [items, setItems] = useState<SentenceBuilderItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState<WordChip[]>([]);
  const [selected, setSelected] = useState<WordChip[]>([]);
  const [checked, setChecked] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const loadRound = useCallback((item: SentenceBuilderItem) => {
    const chips: WordChip[] = item.words.map((w, i) => ({
      uid: `${item.id}-${i}`,
      word: w,
    }));
    setPool(shuffleArray(chips));
    setSelected([]);
    setChecked('idle');
    setShowHint(false);
  }, []);

  const startNewGame = useCallback(
    (diff: Difficulty) => {
      let candidates = SENTENCE_BUILDER_ITEMS.filter((i) => i.difficulty === diff);
      if (moduleFilter) {
        const modMatch = SENTENCE_BUILDER_ITEMS.filter(
          (i) => i.moduleId === moduleFilter
        );
        if (modMatch.length >= 3) candidates = modMatch;
      }
      const chosen = shuffleArray(candidates).slice(0, 6);
      setItems(chosen);
      setIdx(0);
      setScore(0);
      setMistakes([]);
      setFinished(false);
      if (chosen.length > 0) loadRound(chosen[0]);
    },
    [loadRound, moduleFilter]
  );

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty, startNewGame]);

  const current = items[idx];

  const handlePickFromPool = (chip: WordChip) => {
    if (checked !== 'idle') return;
    soundPlay('click');
    setPool((prev) => prev.filter((c) => c.uid !== chip.uid));
    setSelected((prev) => [...prev, chip]);
  };

  const handleReturnToPool = (chip: WordChip) => {
    if (checked !== 'idle') return;
    soundPlay('click');
    setSelected((prev) => prev.filter((c) => c.uid !== chip.uid));
    setPool((prev) => [...prev, chip]);
  };

  const handleDropToSelected = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const uid = e.dataTransfer.getData('text/plain');
    const found = pool.find((c) => c.uid === uid);
    if (found) handlePickFromPool(found);
  };

  const formatBuilt = (chips: WordChip[]) => {
    const raw = chips.map((c) => c.word).join(' ').trim();
    if (!raw) return '';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const handleCheck = () => {
    if (!current || selected.length === 0) return;
    const built = formatBuilt(selected);
    const normalize = (s: string) =>
      s.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalize(built) === normalize(current.correctSentence)) {
      soundPlay('correct');
      setChecked('correct');
      setScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      setChecked('wrong');
      setMistakes((prev) => [
        ...prev,
        {
          prompt: `${idx + 1}-gap`,
          yourAnswer: built,
          correctAnswer: current.correctSentence,
          explanation: current.explanation,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (idx + 1 < items.length) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      loadRound(items[nextIdx]);
    } else {
      setFinished(true);
      const xp = score * 7 + (score === items.length ? 15 : 0);
      if (score >= Math.ceil(items.length * 0.7)) launchConfetti();
      recordGameFinish({ won: score >= 4, xp });
    }
  };

  if (finished) {
    const xp = score * 7 + (score === items.length ? 15 : 0);
    return (
      <GameResultView
        title="Gap quruvchi"
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
            Gap quruvchi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            So‘zlarni sudrab tashlang yoki barmoq bilan bosib to‘g‘ri tartibda joylashtiring.
          </p>
        </div>
        {!moduleFilter && (
          <DifficultySelector
            difficulty={difficulty}
            onChange={(d) => setDifficulty(d)}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">
        <span>
          Gap {idx + 1} / {items.length}
        </span>
        <span>Ball: {score}</span>
      </div>

      {/* Natija maydoni (Drop zona) */}
      <motion.div
        animate={checked === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropToSelected}
        className={`min-h-[88px] rounded-2xl border-2 border-dashed p-4 flex flex-wrap items-center gap-2 transition-colors ${
          checked === 'correct'
            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
            : checked === 'wrong'
            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-500/10'
            : 'border-indigo-300 dark:border-indigo-500/40 bg-white dark:bg-slate-900'
        }`}
      >
        {selected.length === 0 ? (
          <span className="text-sm text-slate-400 dark:text-slate-500">
            So‘zlarni shu yerga joylashtiring...
          </span>
        ) : (
          selected.map((chip, i) => (
            <button
              key={chip.uid}
              type="button"
              disabled={checked !== 'idle'}
              onClick={() => handleReturnToPool(chip)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm sm:text-base shadow-sm hover:bg-indigo-700 transition-colors min-h-[42px]"
            >
              {i === 0
                ? chip.word.charAt(0).toUpperCase() + chip.word.slice(1)
                : chip.word}
            </button>
          ))
        )}
      </motion.div>

      {/* So‘zlar zaxirasi */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 flex flex-wrap gap-2 min-h-[72px]">
        {pool.map((chip) => (
          <button
            key={chip.uid}
            type="button"
            draggable={checked === 'idle'}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', chip.uid)}
            onClick={() => handlePickFromPool(chip)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base shadow-sm hover:border-indigo-400 dark:hover:border-indigo-400 active:scale-95 transition-all cursor-grab min-h-[42px]"
          >
            {chip.word}
          </button>
        ))}
      </div>

      {showHint && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
          Maslahat: {current.hint}
        </div>
      )}

      {checked !== 'idle' && (
        <div
          className={`rounded-xl p-3.5 text-sm ${
            checked === 'correct'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="font-bold">
            {checked === 'correct'
              ? 'Barakalla! Gap to‘g‘ri tuzildi.'
              : `To‘g‘ri javob: ${current.correctSentence}`}
          </div>
          <p className="text-xs mt-1 opacity-90">{current.explanation}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadRound(current)}
            disabled={checked !== 'idle'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Tozalash
          </button>
          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[42px]"
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Maslahat
          </button>
        </div>

        {checked === 'idle' ? (
          <button
            type="button"
            disabled={pool.length > 0}
            onClick={handleCheck}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold transition-colors min-h-[44px]"
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
