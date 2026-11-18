import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  GraduationCap,
  History,
  RotateCcw,
  Target,
} from 'lucide-react';
import { BBA_VARIANTS } from '../data/bbaTests';
import { ALL_MODULES } from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import { BbaVariant, QuizQuestion } from '../types/syntax';
import { launchConfetti } from '../utils/confetti';

type MainTab = 'variants' | 'mistakes' | 'spaced' | 'history';
type TestMode = 'mashq' | 'imtihon';

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const BbaTestsPage: React.FC = () => {
  const {
    progress,
    dueReviews,
    recordBbaAttempt,
    recordWrongQuestion,
    markSpacedReviewResult,
    soundPlay,
  } = useProgress();

  const [tab, setTab] = useState<MainTab>('variants');

  // Variant test holati
  const [selectedVariant, setSelectedVariant] = useState<BbaVariant | null>(
    null
  );
  const [mode, setMode] = useState<TestMode>('mashq');
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);

  // Xatolar va Aqlli takrorlash holati
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewPick, setReviewPick] = useState<number | null>(null);

  const wrongRecords = Object.values(progress.wrongQuestions);

  const finishVariantTest = useCallback(
    (variant: BbaVariant, currentAnswers: Record<string, number>, currentMode: TestMode) => {
      setSubmitted(true);
      let score = 0;
      const weakSet = new Set<number>();

      variant.questions.forEach((q) => {
        if (currentAnswers[q.id] === q.correctIndex) {
          score += 1;
        } else {
          weakSet.add(q.moduleId);
          recordWrongQuestion(q);
        }
      });

      const pct = Math.round((score / variant.questions.length) * 100);
      recordBbaAttempt({
        variantId: variant.id,
        variantTitle: variant.title,
        mode: currentMode,
        score,
        total: variant.questions.length,
        percentage: pct,
        weakModules: Array.from(weakSet),
      });

      if (pct >= 70) {
        soundPlay('levelUp');
        launchConfetti();
      } else {
        soundPlay('click');
      }
    },
    [recordBbaAttempt, recordWrongQuestion, soundPlay]
  );

  // Imtihon rejimi taymeri
  useEffect(() => {
    if (!selectedVariant || mode !== 'imtihon' || submitted) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          finishVariantTest(selectedVariant, answers, mode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [selectedVariant, mode, submitted, answers, finishVariantTest]);

  const startVariant = (variant: BbaVariant, chosenMode: TestMode) => {
    setSelectedVariant(variant);
    setMode(chosenMode);
    setQIdx(0);
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(variant.durationMinutes * 60);
    soundPlay('click');
  };

  const renderActiveVariant = () => {
    if (!selectedVariant) return null;
    const qs = selectedVariant.questions;
    const currentQ = qs[qIdx];

    if (submitted) {
      const score = qs.reduce(
        (s, q) => s + (answers[q.id] === q.correctIndex ? 1 : 0),
        0
      );
      const pct = Math.round((score / qs.length) * 100);
      const weakMap: Record<number, number> = {};
      qs.forEach((q) => {
        if (answers[q.id] !== q.correctIndex) {
          weakMap[q.moduleId] = (weakMap[q.moduleId] ?? 0) + 1;
        }
      });
      const weakModuleIds = Object.keys(weakMap).map(Number);

      return (
        <div className="space-y-5">
          <div className="rounded-3xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-teal-300">
                  {selectedVariant.title} · {mode === 'imtihon' ? 'Imtihon' : 'Mashq'}
                </div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                  Natija: {score} / {qs.length} ({pct}%)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {pct >= 85
                    ? 'A’lo daraja! Siz BBA imtihoniga tayyorsiz.'
                    : pct >= 70
                    ? 'Yaxshi natija! Kichik xatolarni mustahkamlang.'
                    : 'Biroz ko‘proq mashq kerak. Quyidagi zaif mavzularni qayta ko‘rib chiqing.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startVariant(selectedVariant, mode)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold min-h-[42px]"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Qayta ishlash
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[42px]"
                >
                  Variantlar ro‘yxati
                </button>
              </div>
            </div>

            {weakModuleIds.length > 0 && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 space-y-2">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Takrorlash tavsiya etiladigan mavzular:
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakModuleIds.map((mId) => {
                    const mod = ALL_MODULES.find((m) => m.id === mId);
                    return (
                      <Link
                        key={mId}
                        to={`/modul/${mId}`}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-indigo-500"
                      >
                        {mId}-modul: {mod?.shortTitle} ({weakMap[mId]} xato) →
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Savollar va izohlar
            </h3>
            {qs.map((q, i) => {
              const userAns = answers[q.id];
              const ok = userAns === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-4 space-y-2 ${
                    ok
                      ? 'border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900'
                      : 'border-rose-200 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-500/10'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {i + 1}. {q.question}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className={ok ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-rose-700 dark:text-rose-300 font-bold'}>
                      Sizning javobingiz:{' '}
                      {userAns !== undefined ? q.options[userAns] : 'Belgilanmagan'}
                    </div>
                    {!ok && (
                      <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                        To‘g‘ri javob: {q.options[q.correctIndex]}
                      </div>
                    )}
                    <p className="text-slate-600 dark:text-slate-300 pt-1">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const userPick = answers[currentQ.id];
    const showInstantFeedback = mode === 'mashq' && userPick !== undefined;

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedVariant(null)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Variantlarga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {selectedVariant.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Savol {qIdx + 1} / {qs.length} · Belgilandi:{' '}
                {Object.keys(answers).length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mode === 'imtihon' && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums ${
                  secondsLeft < 300
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {formatSeconds(secondsLeft)}
              </div>
            )}
            <button
              type="button"
              onClick={() => finishVariantTest(selectedVariant, answers, mode)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold min-h-[38px]"
            >
              Yakunlash
            </button>
          </div>
        </div>

        {/* Savollar xaritasi (1-30) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
            {qs.map((q, i) => {
              const isCurrent = i === qIdx;
              const answered = answers[q.id] !== undefined;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQIdx(i)}
                  className={`h-8 rounded-lg text-xs font-bold tabular-nums transition-colors ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : answered
                      ? 'bg-emerald-100 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Faol savol */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{currentQ.moduleId}-modul mavzusi</span>
            <span className="uppercase font-bold">
              {currentQ.difficulty === 'oson'
                ? 'Oson'
                : currentQ.difficulty === 'orta'
                ? 'O‘rta'
                : 'Qiyin'}
            </span>
          </div>

          {currentQ.passage && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 text-sm italic text-slate-700 dark:text-slate-200">
              «{currentQ.passage}»
            </div>
          )}

          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {qIdx + 1}. {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = userPick === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let cls =
                'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400';

              if (showInstantFeedback) {
                if (isCorrect) {
                  cls =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200';
                } else if (isSelected) {
                  cls =
                    'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200';
                }
              } else if (isSelected) {
                cls =
                  'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-900 dark:text-white ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={showInstantFeedback}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
                    if (mode === 'mashq') {
                      soundPlay(idx === currentQ.correctIndex ? 'correct' : 'wrong');
                    } else {
                      soundPlay('click');
                    }
                  }}
                  className={`text-left rounded-xl border p-3.5 text-sm font-semibold transition-all min-h-[44px] ${cls}`}
                >
                  <span className="font-bold mr-2">
                    {String.fromCharCode(65 + idx)})
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {showInstantFeedback && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <strong className="text-indigo-700 dark:text-teal-300">Izoh: </strong>
              {currentQ.explanation}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={qIdx === 0}
              onClick={() => setQIdx((i) => i - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 min-h-[40px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Oldingi
            </button>

            {qIdx + 1 < qs.length ? (
              <button
                type="button"
                onClick={() => setQIdx((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold min-h-[40px]"
              >
                Keyingi
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finishVariantTest(selectedVariant, answers, mode)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold min-h-[40px]"
              >
                Testni topshirish
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReviewSession = (
    list: { question: QuizQuestion; streakCorrect?: number }[],
    isSpacedMode: boolean
  ) => {
    if (list.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
          <CheckCircle2
            className="w-10 h-10 text-emerald-500 mx-auto"
            aria-hidden="true"
          />
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isSpacedMode
              ? 'Bugun uchun takrorlanadigan savollar qolmadi!'
              : 'Xato qilingan savollar hozircha yo‘q!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Mini-testlar yoki BBA variantlarini yechganingizda xato qilingan savollar avtomatik ravishda bu yerga tushadi.
          </p>
        </div>
      );
    }

    const safeIdx = reviewIdx % list.length;
    const item = list[safeIdx];
    const q = item.question;

    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-indigo-600 dark:text-teal-300">
            {isSpacedMode ? 'Aqlli takrorlash (1 → 3 kun)' : 'Xatolar ustida ishlash'}
          </span>
          <span className="tabular-nums">
            Savol {safeIdx + 1} / {list.length}
          </span>
        </div>

        <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {q.question}
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correctIndex;
            const picked = reviewPick === idx;
            let cls =
              'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400';
            if (reviewPick !== null) {
              if (isCorrect) {
                cls =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200';
              } else if (picked) {
                cls =
                  'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={reviewPick !== null}
                onClick={() => {
                  setReviewPick(idx);
                  const ok = idx === q.correctIndex;
                  soundPlay(ok ? 'correct' : 'wrong');
                  if (isSpacedMode) {
                    markSpacedReviewResult(q.id, ok);
                  }
                }}
                className={`text-left rounded-xl border p-3.5 text-sm font-semibold min-h-[44px] ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {reviewPick !== null && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 space-y-3">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <strong>Izoh: </strong>
              {q.explanation}
            </p>
            <button
              type="button"
              onClick={() => {
                setReviewPick(null);
                setReviewIdx((i) => i + 1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold min-h-[40px]"
            >
              Keyingi savol
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              BBA imtihon markazi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Davlat imtihoni standartidagi 6 ta to‘liq variant (180 ta savol), taymerli sinov va xatolarni aqlli takrorlash tizimi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setTab('variants');
              setSelectedVariant(null);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'variants'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" aria-hidden="true" />
            Variantlar (6)
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('mistakes');
              setReviewIdx(0);
              setReviewPick(null);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'mistakes'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Xatolar ustida ishlash ({wrongRecords.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('spaced');
              setReviewIdx(0);
              setReviewPick(null);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'spaced'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Brain className="w-3.5 h-3.5" aria-hidden="true" />
            Aqlli takrorlash ({dueReviews.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('history')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'history'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" aria-hidden="true" />
            Natijalar tarixi ({progress.bbaHistory.length})
          </button>
        </div>
      </section>

      {tab === 'variants' &&
        (selectedVariant ? (
          renderActiveVariant()
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BBA_VARIANTS.map((v) => {
              const bestAttempt = progress.bbaHistory
                .filter((a) => a.variantId === v.id)
                .sort((a, b) => b.percentage - a.percentage)[0];
              return (
                <div
                  key={v.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{v.questions.length} ta savol · {v.durationMinutes} daqiqa</span>
                      {bestAttempt && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          Rekord: {bestAttempt.percentage}%
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {v.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {v.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => startVariant(v, 'mashq')}
                      className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-bold min-h-[42px]"
                    >
                      Mashq rejimi
                    </button>
                    <button
                      type="button"
                      onClick={() => startVariant(v, 'imtihon')}
                      className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold min-h-[42px]"
                    >
                      Imtihon (45 min)
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ))}

      {tab === 'mistakes' && renderReviewSession(wrongRecords, false)}
      {tab === 'spaced' && renderReviewSession(dueReviews, true)}

      {tab === 'history' && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Natijalar dinamikasi
          </h2>

          {progress.bbaHistory.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Hali birorta BBA varianti topshirilmagan. Birinchi variantdan boshlang!
            </p>
          ) : (
            <>
              {/* SVG ustunli grafik */}
              <div className="overflow-x-auto pb-2">
                <svg
                  viewBox="0 0 600 180"
                  className="w-full max-w-2xl h-44"
                  role="img"
                  aria-label="BBA test natijalari grafigi"
                >
                  <line x1="30" y1="20" x2="580" y2="20" stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1="30" y1="85" x2="580" y2="85" stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1="30" y1="150" x2="580" y2="150" stroke="#94a3b8" />
                  <text x="4" y="24" fontSize="10" fill="#64748b">100%</text>
                  <text x="8" y="89" fontSize="10" fill="#64748b">50%</text>
                  <text x="14" y="154" fontSize="10" fill="#64748b">0%</text>
                  {progress.bbaHistory
                    .slice(0, 10)
                    .reverse()
                    .map((att, idx) => {
                      const barH = Math.max(6, (att.percentage / 100) * 130);
                      const x = 45 + idx * 52;
                      const y = 150 - barH;
                      return (
                        <g key={att.id}>
                          <rect
                            x={x}
                            y={y}
                            width="32"
                            height={barH}
                            rx="6"
                            fill={att.percentage >= 70 ? '#10b981' : '#6366f1'}
                          />
                          <text
                            x={x + 16}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#475569"
                          >
                            {att.percentage}%
                          </text>
                          <text
                            x={x + 16}
                            y="168"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#64748b"
                          >
                            V{att.variantId}
                          </text>
                        </g>
                      );
                    })}
                </svg>
              </div>

              <div className="space-y-2.5">
                {progress.bbaHistory.map((att) => (
                  <div
                    key={att.id}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {att.variantTitle}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">
                        · {att.mode === 'imtihon' ? 'Imtihon' : 'Mashq'} · {att.date}
                      </span>
                    </div>
                    <div className="font-bold tabular-nums text-indigo-700 dark:text-teal-300">
                      {att.score} / {att.total} ({att.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};
