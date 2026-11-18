import React, { useState } from 'react';
import { ArrowRight, Heart, RotateCcw, ShieldCheck } from 'lucide-react';
import { CASTLE_FLOORS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { launchConfetti } from '../../utils/confetti';
import { GapchiMascot } from '../GapchiMascot';

export const SyntaxCastleGame: React.FC = () => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [floorIdx, setFloorIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const [floorFailed, setFloorFailed] = useState(false);
  const [victory, setVictory] = useState(false);
  const [correctTotal, setCorrectTotal] = useState(0);

  const floor = CASTLE_FLOORS[floorIdx];
  const currentQ = floor?.questions[qIdx];

  const restartFloor = () => {
    setQIdx(0);
    setHearts(3);
    setPicked(null);
    setFloorFailed(false);
  };

  const restartCastle = () => {
    setFloorIdx(0);
    setQIdx(0);
    setHearts(3);
    setPicked(null);
    setFloorFailed(false);
    setVictory(false);
    setCorrectTotal(0);
  };

  const handleAnswer = (optIdx: number) => {
    if (picked !== null || !currentQ) return;
    setPicked(optIdx);
    if (optIdx === currentQ.correctIndex) {
      soundPlay('correct');
      setCorrectTotal((c) => c + 1);
    } else {
      soundPlay('wrong');
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      if (nextHearts <= 0) {
        setFloorFailed(true);
      }
    }
  };

  const handleNext = () => {
    if (!floor) return;
    if (qIdx + 1 < floor.questions.length) {
      setQIdx((i) => i + 1);
      setPicked(null);
    } else if (floorIdx + 1 < CASTLE_FLOORS.length) {
      soundPlay('levelUp');
      setFloorIdx((f) => f + 1);
      setQIdx(0);
      setHearts(3);
      setPicked(null);
    } else {
      setVictory(true);
      launchConfetti();
      recordGameFinish({
        won: true,
        xp: 120,
        castleCleared: true,
      });
    }
  };

  if (victory) {
    return (
      <div className="rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-6 text-center space-y-5">
        <div className="text-5xl" aria-hidden="true">🏰</div>
        <div>
          <h3 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            Tabriklaymiz! Qal’a zabt etildi!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Siz barcha 5 qavatdan va Bosh Boss sinovidan muvaffaqiyatli o‘tdingiz! (+120 XP)
          </p>
        </div>
        <GapchiMascot
          mood="celebrating"
          message="Ofarin! Endi «Sintaksis qal’asi»ning chinakam fotihisan!"
        />
        <button
          type="button"
          onClick={restartCastle}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Qaytadan zabt etish
        </button>
      </div>
    );
  }

  if (floorFailed) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-slate-900 p-6 text-center space-y-4">
        <div className="text-4xl" aria-hidden="true">🛡️</div>
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Yurakchalar tugadi!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {floor.title} boshidan qayta boshlanadi. Diqqatni jamlang va posbonni yenging!
        </p>
        <button
          type="button"
          onClick={restartFloor}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Qavatni qaytadan boshlash
        </button>
      </div>
    );
  }

  if (!floor || !currentQ) return null;

  return (
    <div className="space-y-4">
      {/* Qavatlar progress chizig‘i */}
      <div className="grid grid-cols-5 gap-2">
        {CASTLE_FLOORS.map((f, i) => (
          <div
            key={f.floor}
            className={`rounded-xl px-2 py-2 text-center text-xs font-bold border ${
              i < floorIdx
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : i === floorIdx
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            {f.floor}-qavat
          </div>
        ))}
      </div>

      {/* Qavat sarlavhasi va yuraklar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div>
          <div className="text-xs font-bold text-indigo-600 dark:text-teal-300">
            Posbon: {floor.guardian}
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {floor.title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" aria-label={`Qolgan jon: ${hearts}`}>
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-5 h-5 ${
                  h <= hearts
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
            Savol {qIdx + 1}/{floor.questions.length} · Jami to‘g‘ri: {correctTotal}
          </span>
        </div>
      </div>

      {/* Savol */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          <span>{floor.description}</span>
        </div>
        <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {currentQ.question}
        </h4>
        <div className="space-y-2.5">
          {currentQ.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === currentQ.correctIndex;
            return (
              <button
                key={i}
                type="button"
                disabled={picked !== null}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border font-bold text-sm transition-all min-h-[48px] ${
                  picked !== null
                    ? isCorrect
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isPicked
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-900 dark:text-white'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {currentQ.explanation}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
              >
                {qIdx + 1 < floor.questions.length
                  ? 'Keyingi savol'
                  : floorIdx + 1 < CASTLE_FLOORS.length
                  ? 'Keyingi qavatga ko‘tarilish'
                  : 'G‘alabani yakunlash'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
