import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Gamepad2,
  KeyRound,
  Lightbulb,
  Lock,
  Printer,
  RotateCcw,
  Star,
} from 'lucide-react';
import { InteractiveSentence } from '../components/InteractiveSentence';
import { BlitzGame } from '../components/games/BlitzGame';
import { ClauseDetectiveGame } from '../components/games/ClauseDetectiveGame';
import { DirectIndirectGame } from '../components/games/DirectIndirectGame';
import { ErrorFinderGame } from '../components/games/ErrorFinderGame';
import { PairMatchGame } from '../components/games/PairMatchGame';
import { PartHunterGame } from '../components/games/PartHunterGame';
import { PunctuationWorkshopGame } from '../components/games/PunctuationWorkshopGame';
import { SentenceBuilderGame } from '../components/games/SentenceBuilderGame';
import { SyntaxCastleGame } from '../components/games/SyntaxCastleGame';
import { ALL_MODULES, ROLE_META } from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import { GameId } from '../types/syntax';
import { launchConfetti } from '../utils/confetti';
import { isModuleUnlocked } from '../utils/storage';

type TabId =
  | 'qoida'
  | 'misollar'
  | 'xatolar'
  | 'oyin'
  | 'test'
  | 'vazifa'
  | 'xulosa';

const TABS: { id: TabId; label: string }[] = [
  { id: 'qoida', label: '1. Kirish va Qoida' },
  { id: 'misollar', label: '2. Misollar' },
  { id: 'xatolar', label: '3. Xatolar va Kalit' },
  { id: 'oyin', label: '4. O‘yin zonasi' },
  { id: 'test', label: '5. Mini-test (10)' },
  { id: 'vazifa', label: '6. Uy vazifasi' },
  { id: 'xulosa', label: '7. Xulosa' },
];

function renderModuleGame(gameType: GameId, moduleId: number) {
  switch (gameType) {
    case 'gap_quruvchi':
      return <SentenceBuilderGame moduleFilter={moduleId} />;
    case 'bolak_ovchisi':
      return <PartHunterGame moduleFilter={moduleId} />;
    case 'tinish_ustaxonasi':
      return <PunctuationWorkshopGame moduleFilter={moduleId} />;
    case 'juftini_top':
      return <PairMatchGame moduleFilter={moduleId} />;
    case 'xatoni_top':
      return <ErrorFinderGame moduleFilter={moduleId} />;
    case 'blits_bellashuv':
      return <BlitzGame />;
    case 'ergash_detektivi':
      return <ClauseDetectiveGame moduleFilter={moduleId} />;
    case 'kochirma_ozlashtirma':
      return <DirectIndirectGame moduleFilter={moduleId} />;
    case 'sintaksis_qalasi':
      return <SyntaxCastleGame />;
  }
}

export const ModulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id) || 1;
  const mod = ALL_MODULES.find((m) => m.id === moduleId) ?? ALL_MODULES[0];

  const {
    progress,
    setLastRoute,
    recordModuleSection,
    recordMiniTestResult,
    recordWrongQuestion,
    toggleFavoriteModule,
    soundPlay,
  } = useProgress();

  const unlocked = isModuleUnlocked(mod.id, progress.moduleBestScores);
  const [activeTab, setActiveTab] = useState<TabId>('qoida');
  const [showHookAnswer, setShowHookAnswer] = useState(false);
  const [activeGameIdx, setActiveGameIdx] = useState<0 | 1>(0);

  // Mini-test holati
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    setActiveTab('qoida');
    setShowHookAnswer(false);
    setActiveGameIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    if (unlocked) {
      setLastRoute(`/modul/${mod.id}`);
      recordModuleSection(mod.id, 'qoida');
    }
  }, [mod.id, unlocked, setLastRoute, recordModuleSection]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    recordModuleSection(mod.id, tab);
    soundPlay('click');
  };

  if (!unlocked) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {mod.id}-modul hozircha yopiq
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Ushbu bosqichni ochish uchun avval{' '}
          <strong>{mod.id - 1}-modul</strong> mini-testidan kamida 70% natija ko‘rsating.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to={`/modul/${mod.id - 1}`}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px] inline-flex items-center"
          >
            {mod.id - 1}-modulga o‘tish
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 min-h-[44px] inline-flex items-center"
          >
            Bosh sahifa
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(quizAnswers).length;
  const quizScore = mod.miniTest.reduce(
    (sum, q) => sum + (quizAnswers[q.id] === q.correctIndex ? 1 : 0),
    0
  );
  const quizPct = Math.round((quizScore / mod.miniTest.length) * 100);
  const bestScore = progress.moduleBestScores[mod.id] ?? 0;
  const isFav = progress.favoriteModules.includes(mod.id);
  const nextModule = ALL_MODULES.find((m) => m.id === mod.id + 1);
  const nextUnlocked = nextModule
    ? isModuleUnlocked(nextModule.id, progress.moduleBestScores)
    : false;

  const handleSubmitMiniTest = () => {
    setQuizSubmitted(true);
    mod.miniTest.forEach((q) => {
      if (quizAnswers[q.id] !== q.correctIndex) {
        recordWrongQuestion(q);
      }
    });
    recordMiniTestResult(mod.id, quizScore, mod.miniTest.length);
    if (quizPct >= 70) {
      soundPlay('levelUp');
      launchConfetti();
    } else {
      soundPlay('wrong');
    }
  };

  const handleRetakeMiniTest = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    soundPlay('click');
  };

  return (
    <div className="space-y-6">
      {/* Modul sarlavha kartasi */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center text-3xl shrink-0">
              <span aria-hidden="true">{mod.icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-600 dark:text-teal-300">
                {mod.id}-MODUL · ~{mod.estimatedMinutes} DAQIQA · ENG YAXSHI NATIJA:{' '}
                <span className="tabular-nums">{bestScore}%</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {mod.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {mod.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleFavoriteModule(mod.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors min-h-[40px] ${
                isFav
                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
              {isFav ? 'Sevimlida' : 'Saqlash'}
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[40px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Xarita
            </Link>
          </div>
        </div>

        {/* 7 bosqichli ichki navigatsiya */}
        <div
          className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Modul bo‘limlari"
        >
          {TABS.map((t) => {
            const visited = (
              progress.moduleCompletedSections[mod.id] ?? []
            ).includes(t.id);
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabChange(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors min-h-[40px] whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {visited && !active && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-500"
                    aria-hidden="true"
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 1. Kirish va Qoida */}
      {activeTab === 'qoida' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/40 dark:to-slate-900 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-teal-300 uppercase">
              <Lightbulb className="w-4 h-4" aria-hidden="true" />
              Qiziqarli kirish
            </div>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
              {mod.intro.story}
            </p>
            <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-2.5">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {mod.intro.question}
              </p>
              <button
                type="button"
                onClick={() => setShowHookAnswer((v) => !v)}
                className="text-xs font-bold text-indigo-600 dark:text-teal-300 hover:underline"
              >
                {showHookAnswer ? 'Javobni yashirish' : 'Javobni ochish →'}
              </button>
              {showHookAnswer && (
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                  {mod.intro.hookAnswer}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-teal-400" aria-hidden="true" />
              Asosiy qoidalar
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {mod.rules.map((rule) => {
                const accent = rule.accentRole ? ROLE_META[rule.accentRole] : null;
                return (
                  <div
                    key={rule.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {rule.title}
                      </h3>
                      {accent && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${accent.bgClass} ${accent.textClass}`}
                        >
                          {accent.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
                      {rule.summary}
                    </p>
                    {rule.formula && (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3.5 py-2 font-mono text-xs sm:text-sm text-indigo-700 dark:text-teal-300">
                        Formula: {rule.formula}
                      </div>
                    )}
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
                      {rule.details.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleTabChange('misollar')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
            >
              Misollar bo‘limiga o‘tish
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Misollar */}
      {activeTab === 'misollar' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Rangli interaktiv misollar ({mod.examples.length} ta)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                «Tahlilni ko‘rish» tugmasini yoki gapdagi istalgan so‘zni bosing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {mod.examples.map((ex, idx) => (
              <InteractiveSentence key={ex.id} example={ex} index={idx} />
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleTabChange('xatolar')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
            >
              Xatolar va Xotira kaliti
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Ko‘p uchraydigan xatolar va Xotira kaliti */}
      {activeTab === 'xatolar' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
              Ko‘p uchraydigan xatolar
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {mod.commonMistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-500/15 p-3 border border-rose-200 dark:border-rose-500/30">
                      <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                        Noto‘g‘ri
                      </div>
                      <div className="text-sm font-bold text-rose-900 dark:text-rose-100 mt-0.5">
                        {m.wrong}
                      </div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/15 p-3 border border-emerald-200 dark:border-emerald-500/30">
                      <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        To‘g‘ri
                      </div>
                      <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                        {m.correct}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {m.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">
              <KeyRound className="w-4 h-4" aria-hidden="true" />
              Xotira kaliti · {mod.memoryKey.title}
            </div>
            <p className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {mod.memoryKey.mnemonic}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {mod.memoryKey.tip}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleTabChange('oyin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
            >
              O‘yin zonasiga o‘tish
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* 4. O‘yin zonasi */}
      {activeTab === 'oyin' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mod.games.map((g, i) => {
              const selected = activeGameIdx === i;
              return (
                <button
                  key={`${g.gameType}-${i}`}
                  type="button"
                  onClick={() => setActiveGameIdx(i as 0 | 1)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 ring-2 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-teal-300">
                    <Gamepad2 className="w-4 h-4" aria-hidden="true" />
                    {i + 1}-o‘yin
                  </div>
                  <div className="font-display text-base font-bold text-slate-900 dark:text-white mt-1">
                    {g.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {g.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div>
            {renderModuleGame(mod.games[activeGameIdx].gameType, mod.id)}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleTabChange('test')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
            >
              Mini-testni topshirish
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Mini-test (10 savol) */}
      {activeTab === 'test' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {mod.id}-modul mini-testi ({mod.miniTest.length} ta savol)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Keyingi modulni ochish uchun kamida 70% (7 ta to‘g‘ri javob) to‘plang.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-600 dark:text-teal-300 tabular-nums">
              Belgilandi: {answeredCount} / {mod.miniTest.length}
            </div>
          </div>

          {quizSubmitted && (
            <div
              className={`rounded-2xl border p-5 space-y-3 ${
                quizPct >= 70
                  ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/15'
                  : 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/15'
              }`}
            >
              <div className="font-display text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                Natija: {quizScore} / {mod.miniTest.length} ({quizPct}%)
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {quizPct >= 70
                  ? nextModule
                    ? `Tabriklaymiz! Siz ${nextModule.id}-modulni muvaffaqiyatli ochdingiz!`
                    : 'Tabriklaymiz! Barcha 12 modulning barchasini muvaffaqiyatli yakunladingiz!'
                  : 'Hali 70% chegarasiga yetmadi. Quyidagi «Nima uchun?» tushuntirishlarini o‘qib, qayta urinib ko‘ring!'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleRetakeMiniTest}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white min-h-[40px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Qayta topshirish
                </button>
                {nextModule && nextUnlocked && (
                  <Link
                    to={`/modul/${nextModule.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold min-h-[40px]"
                  >
                    {nextModule.id}-modulga o‘tish
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {mod.miniTest.map((q, qIndex) => {
              const userPick = quizAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {qIndex + 1}. {q.question}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 uppercase">
                      {q.difficulty === 'oson'
                        ? 'Oson'
                        : q.difficulty === 'orta'
                        ? 'O‘rta'
                        : 'Qiyin'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const selected = userPick === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      let cls =
                        'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400 text-slate-800 dark:text-slate-100';
                      if (!quizSubmitted && selected) {
                        cls =
                          'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-900 dark:text-white ring-1 ring-indigo-500';
                      } else if (quizSubmitted) {
                        if (isCorrect) {
                          cls =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200';
                        } else if (selected) {
                          cls =
                            'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => {
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [q.id]: optIdx,
                            }));
                            soundPlay('click');
                          }}
                          className={`text-left rounded-xl border p-3 text-xs sm:text-sm font-semibold transition-all min-h-[42px] ${cls}`}
                        >
                          <span className="font-bold mr-1.5">
                            {String.fromCharCode(65 + optIdx)})
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                      <strong className="text-indigo-700 dark:text-teal-300">
                        Nima uchun?{' '}
                      </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={answeredCount < mod.miniTest.length}
                onClick={handleSubmitMiniTest}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold min-h-[44px]"
              >
                {answeredCount < mod.miniTest.length
                  ? `Barcha savollarga javob bering (${answeredCount}/${mod.miniTest.length})`
                  : 'Testni yakunlash va tekshirish'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Uy vazifasi */}
      {activeTab === 'vazifa' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {mod.id}-modul uy vazifasi (A · B · C qismlar)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                A qism — 5 ta avtomatik tekshiriladigan test; B qism — 3 ta yozma mashq; C qism — 1 ta ijodiy vazifa va chop etish imkoniyati.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="font-bold text-slate-900 dark:text-white">A qism</div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                {progress.homeworkCompleted[mod.id]?.partADone
                  ? `Bajarildi (${progress.homeworkCompleted[mod.id]?.partAScore}%)`
                  : '5 ta test savoli'}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="font-bold text-slate-900 dark:text-white">B qism</div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                {progress.homeworkCompleted[mod.id]?.partBDone
                  ? 'Bajarildi'
                  : '3 ta yozma mashq'}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="font-bold text-slate-900 dark:text-white">C qism</div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                {progress.homeworkCompleted[mod.id]?.partCDone
                  ? 'Bajarildi'
                  : '1 ta ijodiy topshiriq'}
              </div>
            </div>
          </div>

          <Link
            to={`/uy-vazifasi/${mod.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px]"
          >
            Uy vazifasini bajarish sahifasiga o‘tish
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* 7. Mavzu xulosasi (Chop etish uchun tayyor) */}
      {activeTab === 'xulosa' && (
        <div className="space-y-4">
          <div className="flex justify-end no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold min-h-[44px]"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Xulosani chop etish / PDF saqlash
            </button>
          </div>

          <div className="print-container rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <div className="text-xs font-bold text-indigo-600 dark:text-teal-300">
                SINTAKSISLAND · MAVZU XULOSASI
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {mod.id}-modul: {mod.title}
              </h2>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Eng muhim xulosalar
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
                {mod.summary.keyTakeaways.map((k, idx) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-4 font-bold">Atama</th>
                    <th className="py-2 pr-4 font-bold">So‘rog‘i / Belgisi</th>
                    <th className="py-2 font-bold">Misol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mod.summary.formulaTable.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">
                        {row.term}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">
                        {row.question}
                      </td>
                      <td className="py-2.5 text-indigo-700 dark:text-teal-300 font-semibold">
                        {row.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              <strong>BBA imtihoni maslahati: </strong>
              {mod.summary.examTip}
            </div>
          </div>
        </div>
      )}

      {/* Pastki modullararo o‘tish */}
      <div className="flex items-center justify-between gap-4 pt-2 no-print">
        {mod.id > 1 ? (
          <Link
            to={`/modul/${mod.id - 1}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {mod.id - 1}-modul
          </Link>
        ) : (
          <div />
        )}

        {nextModule && (
          <Link
            to={`/modul/${nextModule.id}`}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] ${
              nextUnlocked
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {nextUnlocked ? (
              <>
                Keyingi: {nextModule.id}-modul
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" aria-hidden="true" />
                {nextModule.id}-modul (70% kerak)
              </>
            )}
          </Link>
        )}
      </div>
    </div>
  );
};
