import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gamepad2, Hammer, Sparkles, Swords } from 'lucide-react';
import { BlitzGame } from '../components/games/BlitzGame';
import { ClauseDetectiveGame } from '../components/games/ClauseDetectiveGame';
import { DirectIndirectGame } from '../components/games/DirectIndirectGame';
import { ErrorFinderGame } from '../components/games/ErrorFinderGame';
import { PairMatchGame } from '../components/games/PairMatchGame';
import { PartHunterGame } from '../components/games/PartHunterGame';
import { PunctuationWorkshopGame } from '../components/games/PunctuationWorkshopGame';
import { SentenceBuilderGame } from '../components/games/SentenceBuilderGame';
import { SyntaxCastleGame } from '../components/games/SyntaxCastleGame';
import { DuelModeGame } from '../components/tools/DuelModeGame';
import { GuidedAnalyzerTool } from '../components/tools/GuidedAnalyzerTool';
import { SentenceArchitectTool } from '../components/tools/SentenceArchitectTool';
import { GAMES_CATALOG } from '../data/gamesData';
import { useProgress } from '../hooks/useProgress';
import { GameId } from '../types/syntax';

type ArenaId = GameId | 'duel' | 'architect' | 'analyzer';

export const GamesCenterPage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const { progress, soundPlay } = useProgress();
  const [activeArena, setActiveArena] = useState<ArenaId>('gap_quruvchi');

  useEffect(() => {
    if (gameId) {
      setActiveArena(gameId as ArenaId);
    }
  }, [gameId]);

  const selectArena = (id: ArenaId) => {
    setActiveArena(id);
    soundPlay('click');
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha va qisqa statistika */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              O‘yinlar va amaliy ustaxona
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              9 ta sintaktik o‘yin, 2 kishilik bellashuv rejimi va mustaqil gap tahlilchisi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-bold">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 tabular-nums">
            O‘yinlar: {progress.gamesPlayed}
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 px-3.5 py-2 tabular-nums">
            Blits rekord: {progress.blitzBestScore}
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-3.5 py-2">
            Qal’a: {progress.castleCleared ? 'Zabt etildi' : 'Kutilmoqda'}
          </div>
        </div>
      </section>

      {/* 9 ta asosiy o‘yin */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {GAMES_CATALOG.map((g) => {
          const active = activeArena === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => selectArena(g.id)}
              className={`rounded-2xl border p-4 text-left transition-all flex items-start gap-3.5 ${
                active
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/15 ring-2 ring-indigo-500 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${g.accent} text-white flex items-center justify-center text-xl shrink-0`}
                aria-hidden="true"
              >
                {g.icon}
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {g.title}
                </div>
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-teal-300">
                  {g.subtitle} · +{g.xpReward} XP
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {g.description}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Qo‘shimcha 3 ta maxsus rejim */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => selectArena('duel')}
          className={`rounded-2xl border p-4 text-left transition-all flex items-start gap-3 ${
            activeArena === 'duel'
              ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-500/15 ring-2 ring-rose-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
            <Swords className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Bellashuv rejimi (2 o‘yinchi)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Do‘stingiz bilan bitta ekranda navbatma-navbat musobaqalashing.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => selectArena('architect')}
          className={`rounded-2xl border p-4 text-left transition-all flex items-start gap-3 ${
            activeArena === 'architect'
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/15 ring-2 ring-indigo-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Hammer className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Gap me’mori konstruktori
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Rangli bo‘laklardan o‘zingiz mustaqil gap va sxema tuzing.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => selectArena('analyzer')}
          className={`rounded-2xl border p-4 text-left transition-all flex items-start gap-3 ${
            activeArena === 'analyzer'
              ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-500/15 ring-2 ring-teal-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Interaktiv gap tahlilchisi
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              O‘z gapingizni yozib, qadam-baqadam bo‘laklarga ajrating.
            </p>
          </div>
        </button>
      </section>

      {/* Faol o‘yin maydoni */}
      <section aria-label="Faol o‘yin maydoni">
        {activeArena === 'gap_quruvchi' && <SentenceBuilderGame />}
        {activeArena === 'bolak_ovchisi' && <PartHunterGame />}
        {activeArena === 'tinish_ustaxonasi' && <PunctuationWorkshopGame />}
        {activeArena === 'juftini_top' && <PairMatchGame />}
        {activeArena === 'xatoni_top' && <ErrorFinderGame />}
        {activeArena === 'blits_bellashuv' && <BlitzGame />}
        {activeArena === 'ergash_detektivi' && <ClauseDetectiveGame />}
        {activeArena === 'kochirma_ozlashtirma' && <DirectIndirectGame />}
        {activeArena === 'sintaksis_qalasi' && <SyntaxCastleGame />}
        {activeArena === 'duel' && <DuelModeGame />}
        {activeArena === 'architect' && <SentenceArchitectTool />}
        {activeArena === 'analyzer' && <GuidedAnalyzerTool />}
      </section>
    </div>
  );
};
