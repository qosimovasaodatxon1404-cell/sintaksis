import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PART_HUNTER_ITEMS } from '../../data/gamesData';
import { ROLE_META } from '../../data/modules';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty, PartHunterItem, SyntaxRole } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

const BRUSH_ROLES: SyntaxRole[] = [
  'ega',
  'kesim',
  'toldiruvchi',
  'aniqlovchi',
  'hol',
  'other',
];

export const PartHunterGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [items, setItems] = useState<PartHunterItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [activeBrush, setActiveBrush] = useState<SyntaxRole>('ega');
  const [painted, setPainted] = useState<Record<number, SyntaxRole>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const startNewGame = useCallback(
    (diff: Difficulty) => {
      let candidates = PART_HUNTER_ITEMS.filter((i) => i.difficulty === diff);
      if (moduleFilter) {
        const modMatch = PART_HUNTER_ITEMS.filter(
          (i) => i.moduleId === moduleFilter
        );
        if (modMatch.length >= 3) candidates = modMatch;
      }
      const chosen = shuffleArray(candidates).slice(0, 6);
      setItems(chosen);
      setIdx(0);
      setPainted({});
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

  const handlePaintToken = (tokenIdx: number) => {
    if (checked) return;
    soundPlay('click');
    setPainted((prev) => ({
      ...prev,
      [tokenIdx]: activeBrush,
    }));
  };

  const handleCheck = () => {
    if (!current) return;
    let allCorrect = true;
    current.tokens.forEach((t, i) => {
      if (painted[i] !== t.role) {
        allCorrect = false;
      }
    });
    setChecked(true);
    if (allCorrect) {
      soundPlay('correct');
      setScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      setMistakes((prev) => [
        ...prev,
        {
          prompt: current.tokens.map((t) => t.text).join(' '),
          yourAnswer: current.tokens
            .map((t, i) =>
              `${t.text} (${painted[i] ? ROLE_META[painted[i]].label : 'tanlanmadi'})`
            )
            .join(', '),
          correctAnswer: current.tokens
            .map((t) => `${t.text} (${ROLE_META[t.role].label})`)
            .join(', '),
          explanation: current.explanation,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (idx + 1 < items.length) {
      setIdx((i) => i + 1);
      setPainted({});
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
        title="Bo‘lak ovchisi"
        score={score}
        maxScore={items.length}
        xpEarned={xp}
        mistakes={mistakes}
        onReplay={() => startNewGame(difficulty)}
      />
    );
  }

  if (!current) return null;

  const allPainted = current.tokens.every((_, i) => Boolean(painted[i]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Bo‘lak ovchisi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Avval quyidan bo‘lak rangini tanlang, so‘ngra gapdagi mos so‘zni bosing.
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

      {/* Bo‘yoq cho‘tkalari */}
      <div className="flex flex-wrap gap-2">
        {BRUSH_ROLES.map((role) => {
          const meta = ROLE_META[role];
          const isActive = activeBrush === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveBrush(role)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all min-h-[40px] ${
                isActive
                  ? `${meta.bgClass} ${meta.textClass} border-2 border-indigo-600 dark:border-white shadow-sm`
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: meta.hex }}
                aria-hidden="true"
              />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Gap maydoni */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap gap-2.5">
        {current.tokens.map((t, i) => {
          const chosen = painted[i];
          const chosenMeta = chosen ? ROLE_META[chosen] : null;
          const isWrongAfterCheck = checked && chosen !== t.role;
          const isRightAfterCheck = checked && chosen === t.role;

          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => handlePaintToken(i)}
              className={`rounded-xl px-3.5 py-2.5 text-base sm:text-lg font-bold border transition-all min-h-[46px] flex flex-col items-center ${
                chosenMeta
                  ? `${chosenMeta.bgClass} ${chosenMeta.textClass} ${chosenMeta.underlineClass} ${
                      isWrongAfterCheck
                        ? 'ring-2 ring-rose-500'
                        : isRightAfterCheck
                        ? 'ring-2 ring-emerald-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-indigo-400'
              }`}
            >
              <span>{t.text}</span>
              <span className="text-[11px] font-semibold mt-0.5 opacity-85">
                {chosenMeta ? chosenMeta.label : 'Tanlang'}
              </span>
            </button>
          );
        })}
      </div>

      {checked && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 text-sm space-y-1.5">
          <div className="font-bold text-slate-900 dark:text-white">
            Izoh:
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
            {current.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <button
            type="button"
            disabled={!allPainted}
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
