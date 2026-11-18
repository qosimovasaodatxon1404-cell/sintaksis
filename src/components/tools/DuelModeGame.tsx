import React, { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, Swords, Trophy, Users } from 'lucide-react';
import { ALL_BBA_QUESTIONS } from '../../data/bbaTests';
import { ALL_MODULES } from '../../data/modules';
import { useProgress } from '../../hooks/useProgress';
import { QuizQuestion } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { GapchiMascot } from '../GapchiMascot';

const ROUND_OPTIONS = [6, 10, 14] as const;

export const DuelModeGame: React.FC = () => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [player1Name, setPlayer1Name] = useState('1-o‘yinchi');
  const [player2Name, setPlayer2Name] = useState('2-o‘yinchi');
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'done'>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const pool = useMemo(
    () => [
      ...ALL_MODULES.flatMap((m) => m.miniTest),
      ...ALL_BBA_QUESTIONS.slice(0, 60),
    ],
    []
  );

  const startDuel = () => {
    const selected = shuffleArray(pool).slice(0, totalRounds);
    setQuestions(selected);
    setQIdx(0);
    setP1Score(0);
    setP2Score(0);
    setPicked(null);
    setPhase('playing');
    soundPlay('click');
  };

  const currentQ = questions[qIdx];
  const isP1Turn = qIdx % 2 === 0;
  const activePlayerName = isP1Turn
    ? player1Name.trim() || '1-o‘yinchi'
    : player2Name.trim() || '2-o‘yinchi';

  const handleAnswer = (optIdx: number) => {
    if (picked !== null || !currentQ) return;
    setPicked(optIdx);
    const isCorrect = optIdx === currentQ.correctIndex;
    if (isCorrect) {
      soundPlay('correct');
      if (isP1Turn) setP1Score((s) => s + 1);
      else setP2Score((s) => s + 1);
    } else {
      soundPlay('wrong');
    }
  };

  const handleNext = () => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setPicked(null);
    } else {
      setPhase('done');
      launchConfetti();
      soundPlay('levelUp');
      recordGameFinish({
        won: true,
        xp: 45,
        isDuel: true,
      });
    }
  };

  if (phase === 'setup') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 text-white flex items-center justify-center shrink-0">
            <Swords className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Bellashuv rejimi (2 o‘yinchi)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Sinfdoshingiz yoki do‘stingiz bilan bitta ekranda navbatma-navbat savollarga javob bering va kim sintaksis chempioni ekanini aniqlang!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="duel-p1"
              className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1.5"
            >
              1-o‘yinchi ismi
            </label>
            <input
              id="duel-p1"
              type="text"
              maxLength={24}
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="duel-p2"
              className="block text-xs font-bold text-rose-700 dark:text-rose-300 mb-1.5"
            >
              2-o‘yinchi ismi
            </label>
            <input
              id="duel-p2"
              type="text"
              maxLength={24}
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            Jami savollar soni (har bir o‘yinchiga teng bo‘linadi):
          </span>
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {ROUND_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setTotalRounds(count)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors min-h-[38px] tabular-nums ${
                  totalRounds === count
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {count} ta savol
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={startDuel}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors min-h-[44px]"
        >
          <Users className="w-4 h-4" aria-hidden="true" />
          Bellashuvni boshlash
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const p1 = player1Name.trim() || '1-o‘yinchi';
    const p2 = player2Name.trim() || '2-o‘yinchi';
    const winnerText =
      p1Score === p2Score
        ? 'Durang! Har ikkala bilimdon teng kuch ko‘rsatdi!'
        : p1Score > p2Score
        ? `${p1} g‘alaba qozondi!`
        : `${p2} g‘alaba qozondi!`;

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-900 p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 mx-auto">
            <Trophy className="w-7 h-7" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {winnerText}
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/15 p-4 border border-indigo-200 dark:border-indigo-500/30">
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate">
                {p1}
              </div>
              <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
                {p1Score}
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/15 p-4 border border-rose-200 dark:border-rose-500/30">
              <div className="text-xs font-bold text-rose-700 dark:text-rose-300 truncate">
                {p2}
              </div>
              <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
                {p2Score}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={startDuel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Yana bellashish
            </button>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold min-h-[44px]"
            >
              Ismlarni o‘zgartirish
            </button>
          </div>
        </div>
        <GapchiMascot
          mood="celebrating"
          message="Ajoyib bellashuv bo‘ldi! Birgalikda o‘rganish bilimni yanada mustahkamlaydi (+45 XP)."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
      {/* Hisob taxtasi */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-xl p-3 border transition-all ${
            isP1Turn
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-75'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate">
              {player1Name.trim() || '1-o‘yinchi'}
            </span>
            <span className="font-display text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
              {p1Score}
            </span>
          </div>
          {isP1Turn && (
            <div className="text-[11px] font-bold text-indigo-600 dark:text-teal-300 mt-1">
              Sizning navbatingiz
            </div>
          )}
        </div>

        <div
          className={`rounded-xl p-3 border transition-all ${
            !isP1Turn
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-75'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 truncate">
              {player2Name.trim() || '2-o‘yinchi'}
            </span>
            <span className="font-display text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
              {p2Score}
            </span>
          </div>
          {!isP1Turn && (
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-300 mt-1">
              Sizning navbatingiz
            </div>
          )}
        </div>
      </div>

      {currentQ && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {activePlayerName} javob beradi
            </span>
            <span className="tabular-nums">
              {qIdx + 1} / {questions.length}
            </span>
          </div>

          {currentQ.passage && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 text-sm italic text-slate-700 dark:text-slate-200">
              «{currentQ.passage}»
            </div>
          )}

          <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {currentQ.question}
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = picked === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let btnClass =
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-400 text-slate-800 dark:text-slate-100';
              if (picked !== null) {
                if (isCorrect) {
                  btnClass =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200';
                } else if (isSelected) {
                  btnClass =
                    'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200';
                } else {
                  btnClass =
                    'border-slate-200 dark:border-slate-800 opacity-60 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`text-left rounded-xl border p-3.5 text-sm font-semibold transition-all min-h-[44px] ${btnClass}`}
                >
                  <span className="inline-block w-6 font-bold text-slate-400">
                    {String.fromCharCode(65 + idx)})
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-4 space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <strong className="text-indigo-700 dark:text-teal-300">Izoh: </strong>
                {currentQ.explanation}
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
              >
                {qIdx + 1 < questions.length ? 'Keyingi navbat' : 'Natijani ko‘rish'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
