import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Flame, Play, Timer } from 'lucide-react';
import { BLITZ_EXTRA_QUESTIONS } from '../../data/gamesData';
import { ALL_MODULES } from '../../data/modules';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty, QuizQuestion } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

export const BlitzGame: React.FC = () => {
  const { progress, soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  const fullPool = useMemo(
    () => [
      ...BLITZ_EXTRA_QUESTIONS,
      ...ALL_MODULES.flatMap((m) => m.miniTest),
    ],
    []
  );

  const startBlitz = useCallback(() => {
    const filtered = fullPool.filter((q) => q.difficulty === difficulty);
    const pool = filtered.length >= 15 ? filtered : fullPool;
    setQuestions(shuffleArray(pool));
    setQIdx(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setMistakes([]);
    setPhase('playing');
  }, [difficulty, fullPool]);

  const finishBlitz = useCallback(
    (finalScore: number) => {
      setPhase('done');
      const xp = Math.min(80, Math.round(finalScore / 3) + 15);
      if (finalScore >= 80) launchConfetti();
      recordGameFinish({
        won: finalScore >= 60,
        xp,
        blitzScore: finalScore,
      });
    },
    [recordGameFinish]
  );

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    if (timeLeft <= 0) {
      finishBlitz(score);
      return undefined;
    }
    const timer = window.setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, timeLeft, score, finishBlitz]);

  const current = questions[qIdx % Math.max(1, questions.length)];

  const handleAnswer = (optIdx: number) => {
    if (phase !== 'playing' || !current) return;
    if (optIdx === current.correctIndex) {
      soundPlay('correct');
      const nextCombo = combo + 1;
      const gained = 10 + Math.min(20, (nextCombo - 1) * 5);
      setCombo(nextCombo);
      setScore((s) => s + gained);
    } else {
      soundPlay('wrong');
      setCombo(0);
      setMistakes((prev) => [
        ...prev,
        {
          prompt: current.question,
          yourAnswer: current.options[optIdx],
          correctAnswer: current.options[current.correctIndex],
          explanation: current.explanation,
        },
      ]);
    }
    setQIdx((i) => i + 1);
  };

  if (phase === 'ready') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center space-y-5">
        <div className="text-4xl" aria-hidden="true">⚡</div>
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Blits-bellashuv
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
            60 soniya ichida iloji boricha ko‘proq savolga to‘g‘ri javob bering. Ketma-ket to‘g‘ri javoblar kombo ball (+5, +10, +15...) beradi!
          </p>
          {progress.blitzBestScore > 0 && (
            <p className="text-xs font-bold text-indigo-600 dark:text-teal-300 mt-2 tabular-nums">
              Rekordingiz: {progress.blitzBestScore} ball
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
        </div>
        <button
          type="button"
          onClick={startBlitz}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors min-h-[44px]"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          Boshlash
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const xp = Math.min(80, Math.round(score / 3) + 15);
    return (
      <GameResultView
        title="Blits-bellashuv"
        score={score}
        maxScore={Math.max(100, score)}
        xpEarned={xp}
        mistakes={mistakes}
        onReplay={startBlitz}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 font-bold text-sm tabular-nums text-rose-600 dark:text-rose-400">
          <Timer className="w-4 h-4" aria-hidden="true" />
          <span>{timeLeft} soniya</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold tabular-nums">
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-300">
            <Flame className="w-4 h-4" aria-hidden="true" />
            Kombo: x{Math.max(1, combo)}
          </span>
          <span className="text-indigo-700 dark:text-teal-300">
            Ball: {score}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {current.question}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAnswer(idx)}
              className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 font-bold text-sm text-slate-900 dark:text-white transition-colors min-h-[48px]"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
