import React, { useCallback, useEffect, useState } from 'react';
import { PAIR_MATCH_ITEMS } from '../../data/gamesData';
import { useProgress } from '../../hooks/useProgress';
import { Difficulty } from '../../types/syntax';
import { launchConfetti } from '../../utils/confetti';
import { shuffleArray } from '../../utils/storage';
import { DifficultySelector, GameResultView, MistakeRecord } from './GameShared';

interface Props {
  moduleFilter?: number;
}

interface CardNode {
  uid: string;
  pairId: number;
  text: string;
  side: 'left' | 'right';
  relation: string;
}

export const PairMatchGame: React.FC<Props> = ({ moduleFilter }) => {
  const { soundPlay, recordGameFinish } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>('oson');
  const [cards, setCards] = useState<CardNode[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<CardNode | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [wrongPairs, setWrongPairs] = useState<MistakeRecord[]>([]);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const startNewGame = useCallback(
    (diff: Difficulty) => {
      let candidates = PAIR_MATCH_ITEMS.filter((i) => i.difficulty === diff);
      if (moduleFilter) {
        const modMatch = PAIR_MATCH_ITEMS.filter(
          (i) => i.moduleId === moduleFilter
        );
        if (modMatch.length >= 1) candidates = modMatch;
      }
      const chosenSet = shuffleArray(candidates)[0] ?? PAIR_MATCH_ITEMS[0];
      const lefts: CardNode[] = chosenSet.pairs.map((p, idx) => ({
        uid: `l-${idx}`,
        pairId: idx,
        text: p.left,
        side: 'left',
        relation: p.relation,
      }));
      const rights: CardNode[] = chosenSet.pairs.map((p, idx) => ({
        uid: `r-${idx}`,
        pairId: idx,
        text: p.right,
        side: 'right',
        relation: p.relation,
      }));
      setCards([...shuffleArray(lefts), ...shuffleArray(rights)]);
      setSelectedLeft(null);
      setMatchedIds([]);
      setAttempts(0);
      setWrongPairs([]);
      setErrorFlash(null);
      setFinished(false);
    },
    [moduleFilter]
  );

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty, startNewGame]);

  const leftCards = cards.filter((c) => c.side === 'left');
  const rightCards = cards.filter((c) => c.side === 'right');

  const handleLeftClick = (card: CardNode) => {
    if (matchedIds.includes(card.pairId)) return;
    soundPlay('click');
    setSelectedLeft(card);
  };

  const handleRightClick = (rightCard: CardNode) => {
    if (!selectedLeft || matchedIds.includes(rightCard.pairId)) return;
    setAttempts((a) => a + 1);
    if (selectedLeft.pairId === rightCard.pairId) {
      soundPlay('correct');
      const nextMatched = [...matchedIds, rightCard.pairId];
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      if (nextMatched.length === leftCards.length) {
        setFinished(true);
        const xp = Math.max(20, 45 - wrongPairs.length * 5);
        launchConfetti();
        recordGameFinish({ won: true, xp });
      }
    } else {
      soundPlay('wrong');
      setErrorFlash(rightCard.uid);
      window.setTimeout(() => setErrorFlash(null), 500);
      const expectedRight = rightCards.find(
        (r) => r.pairId === selectedLeft.pairId
      );
      setWrongPairs((prev) => [
        ...prev,
        {
          prompt: selectedLeft.text,
          yourAnswer: rightCard.text,
          correctAnswer: expectedRight?.text ?? '',
          explanation: `Bog‘lanish turi: ${selectedLeft.relation}`,
        },
      ]);
      setSelectedLeft(null);
    }
  };

  if (finished) {
    const score = Math.max(1, leftCards.length - Math.min(leftCards.length - 1, wrongPairs.length));
    const xp = Math.max(20, 45 - wrongPairs.length * 5);
    return (
      <GameResultView
        title="Juftini top"
        score={score}
        maxScore={leftCards.length}
        xpEarned={xp}
        mistakes={wrongPairs}
        onReplay={() => startNewGame(difficulty)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Juftini top
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Chap ustundan birikma yoki tushunchani, o‘ng ustundan uning mos juftini tanlang.
          </p>
        </div>
        {!moduleFilter && (
          <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
        )}
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">
        <span>
          Topilgan: {matchedIds.length} / {leftCards.length}
        </span>
        <span>Urinishlar: {attempts}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2.5">
          {leftCards.map((card) => {
            const isMatched = matchedIds.includes(card.pairId);
            const isSelected = selectedLeft?.uid === card.uid;
            return (
              <button
                key={card.uid}
                type="button"
                disabled={isMatched}
                onClick={() => handleLeftClick(card)}
                className={`w-full text-left px-4 py-3 rounded-xl border font-bold text-sm transition-all min-h-[48px] ${
                  isMatched
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-75'
                    : isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
                }`}
              >
                {card.text}
              </button>
            );
          })}
        </div>

        <div className="space-y-2.5">
          {rightCards.map((card) => {
            const isMatched = matchedIds.includes(card.pairId);
            const isError = errorFlash === card.uid;
            return (
              <button
                key={card.uid}
                type="button"
                disabled={isMatched || !selectedLeft}
                onClick={() => handleRightClick(card)}
                className={`w-full text-left px-4 py-3 rounded-xl border font-bold text-sm transition-all min-h-[48px] ${
                  isMatched
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-75'
                    : isError
                    ? 'bg-rose-100 dark:bg-rose-500/25 border-rose-500 text-rose-700 dark:text-rose-200'
                    : selectedLeft
                    ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-500/50 text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {card.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
