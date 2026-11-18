import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Flame,
  Gamepad2,
  GraduationCap,
  Lock,
  Sparkles,
  Star,
} from 'lucide-react';
import { GapchiMascot } from '../components/GapchiMascot';
import {
  ALL_MODULES,
  getDailyChallengeQuestions,
  getDailySentence,
} from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import { launchConfetti } from '../utils/confetti';
import {
  AVATAR_OPTIONS,
  getTodayString,
  isModuleUnlocked,
} from '../utils/storage';

export const HomePage: React.FC = () => {
  const {
    progress,
    rank,
    dueReviews,
    setProfile,
    completeDailyChallenge,
    toggleFavoriteModule,
    recordWrongQuestion,
    soundPlay,
  } = useProgress();

  // Birinchi tashrif profil sozlamasi
  const [nameInput, setNameInput] = useState(progress.name || '');
  const [avatarInput, setAvatarInput] = useState(progress.avatar || '🦉');

  // Kun gapi va kunlik chaqiriq
  const dailySentence = useMemo(() => getDailySentence(), []);
  const [showSentenceBreakdown, setShowSentenceBreakdown] = useState(false);

  const dailyQuestions = useMemo(() => getDailyChallengeQuestions(), []);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [dcIdx, setDcIdx] = useState(0);
  const [dcPicked, setDcPicked] = useState<number | null>(null);
  const [dcScore, setDcScore] = useState(0);
  const [dcFinished, setDcFinished] = useState(false);

  const today = getTodayString();
  const isDailyDone = progress.dailyChallengeCompletedDate === today;

  const completedModulesCount = Object.values(progress.moduleBestScores).filter(
    (s) => s >= 70
  ).length;

  const xpSpan = Math.max(1, rank.nextXp - rank.minXp);
  const xpIntoRank = Math.max(0, progress.xp - rank.minXp);
  const rankPct = Math.min(100, Math.round((xpIntoRank / xpSpan) * 100));

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(nameInput.trim() || 'Bilimdon', avatarInput);
    soundPlay('levelUp');
    launchConfetti();
  };

  const handleDailyPick = (optIdx: number) => {
    if (dcPicked !== null) return;
    const current = dailyQuestions[dcIdx];
    setDcPicked(optIdx);
    if (optIdx === current.correctIndex) {
      soundPlay('correct');
      setDcScore((s) => s + 1);
    } else {
      soundPlay('wrong');
      recordWrongQuestion(current);
    }
  };

  const handleDailyNext = () => {
    if (dcIdx + 1 < dailyQuestions.length) {
      setDcIdx((i) => i + 1);
      setDcPicked(null);
    } else {
      setDcFinished(true);
      completeDailyChallenge(dcScore);
      launchConfetti();
      soundPlay('levelUp');
    }
  };

  return (
    <div className="space-y-8">
      {/* Birinchi tashrif profil sozlamasi */}
      {!progress.onboarded && (
        <section className="rounded-2xl border border-indigo-200 dark:border-indigo-500/40 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-teal-950/40 p-5 sm:p-6 shadow-sm">
          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">
                {avatarInput}
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  SintaksisLand olamiga xush kelibsiz!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  Sarguzashtni boshlash uchun ismingizni yozing va o‘zingizga yoqqan belgini tanlang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label
                  htmlFor="onboard-name"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Ismingiz
                </label>
                <input
                  id="onboard-name"
                  type="text"
                  maxLength={24}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Masalan: Azizbek"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Qahramon belgisi
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarInput(av.emoji)}
                      aria-label={av.label}
                      title={av.label}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        avatarInput === av.emoji
                          ? 'border-indigo-600 bg-indigo-100 dark:bg-indigo-500/30 scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Profilni saqlash (+25 XP)
            </button>
          </form>
        </section>
      )}

      {/* Bosh qism (Hero) */}
      <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-teal-300 tracking-wide">
              8–11-SINF ONA TILI · BBA IMTIHONIGA TAYYORLOV
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              So‘zlardan qudratli gaplar quring va sintaksis ustasiga aylaning!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Har bir mavzuni qisqa hikoya, rangli sxemalar, interaktiv o‘yinlar, 10 savolli mini-test va 3 bosqichli uy vazifasi orqali mustahkam o‘rganing.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/modul/1"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors min-h-[44px]"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                Sarguzashtni boshlash
              </Link>
              <Link
                to={progress.lastRoute || '/modul/1'}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold transition-colors min-h-[44px]"
              >
                Davom etish
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <GapchiMascot
              mood="happy"
              message={
                progress.name
                  ? `Salom, ${progress.name}! Bugun qaysi modulni zabt etamiz?`
                  : 'Salom! Men Gapchiman — SintaksisLand bo‘ylab yo‘lboshchingman!'
              }
            />

            {/* Qisqa statistika paneli */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Daraja
                </div>
                <div className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {rank.title}
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-teal-400 rounded-full transition-all"
                    style={{ width: `${rankPct}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                  Seriya
                </div>
                <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {progress.streak} kun
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Modullar
                </div>
                <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {completedModulesCount} / 12
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kun gapi + Kunlik chaqiriq */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kun gapi */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-teal-600 dark:text-teal-300 uppercase tracking-wide">
              Kun gapi · {dailySentence.author}
            </div>
            <blockquote className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              «{dailySentence.sentence}»
            </blockquote>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Turi: {dailySentence.type}
            </div>
            {showSentenceBreakdown && (
              <p className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {dailySentence.breakdown}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSentenceBreakdown((v) => !v)}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-500/25 transition-colors min-h-[40px]"
          >
            {showSentenceBreakdown ? 'Tahlilni yashirish' : 'Sintaktik tahlilni ko‘rish'}
          </button>
        </div>

        {/* Kunlik chaqiriq */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Kunlik chaqiriq · 5 ta savol
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Bugungi bilimingizni sinab ko‘ring
              </h2>
            </div>
            {isDailyDone && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Bajarildi
              </span>
            )}
          </div>

          {!challengeOpen ? (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Har kuni yangilanadigan 5 ta tezkor sintaksis savolini yeching va qo‘shimcha XP hamda «Kunlik chaqiriqchi» yutug‘ini qo‘lga kiriting.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setChallengeOpen(true);
                    setDcIdx(0);
                    setDcPicked(null);
                    setDcScore(0);
                    setDcFinished(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-colors min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  {isDailyDone ? 'Qayta mashq qilish' : 'Chaqiriqni boshlash'}
                </button>
                {dueReviews.length > 0 && (
                  <Link
                    to="/bba-testlar"
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Takrorlash navbatida {dueReviews.length} ta xato savol bor →
                  </Link>
                )}
              </div>
            </div>
          ) : dcFinished ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/15 p-4 space-y-2">
              <div className="font-display text-base font-bold text-emerald-800 dark:text-emerald-200">
                Kunlik chaqiriq yakunlandi: {dcScore} / {dailyQuestions.length}
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Ajoyib! Har kunlik mashq xotirani mustahkamlaydi va seriyangizni saqlab turadi.
              </p>
              <button
                type="button"
                onClick={() => setChallengeOpen(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  Savol {dcIdx + 1} / {dailyQuestions.length}
                </span>
                <span>To‘g‘ri: {dcScore}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {dailyQuestions[dcIdx].question}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {dailyQuestions[dcIdx].options.map((opt, idx) => {
                  const isCorrect = idx === dailyQuestions[dcIdx].correctIndex;
                  const isPicked = dcPicked === idx;
                  let cls =
                    'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-indigo-400';
                  if (dcPicked !== null) {
                    if (isCorrect) {
                      cls =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200';
                    } else if (isPicked) {
                      cls =
                        'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={dcPicked !== null}
                      onClick={() => handleDailyPick(idx)}
                      className={`text-left rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors min-h-[40px] ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {dcPicked !== null && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {dailyQuestions[dcIdx].explanation}
                  </p>
                  <button
                    type="button"
                    onClick={handleDailyNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    {dcIdx + 1 < dailyQuestions.length ? 'Keyingi' : 'Yakunlash'}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 12 Modulli sarguzasht xaritasi */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Sarguzasht xaritasi — 12 ta modul
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Har bir modul mini-testidan kamida 70% ball oling va navbatdagi bosqichni oching.
            </p>
          </div>
          <div className="text-xs font-bold text-indigo-600 dark:text-teal-300 tabular-nums">
            O‘zlashtirildi: {completedModulesCount} / 12
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_MODULES.map((mod, index) => {
            const unlocked = isModuleUnlocked(mod.id, progress.moduleBestScores);
            const bestScore = progress.moduleBestScores[mod.id] ?? 0;
            const passed = bestScore >= 70;
            const isFav = progress.favoriteModules.includes(mod.id);

            return (
              <motion.div
                key={mod.id}
                whileHover={unlocked ? { y: -3 } : undefined}
                transition={{ duration: 0.18 }}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-shadow ${
                  unlocked
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg'
                    : 'border-slate-200/70 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-900/40 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center text-2xl shrink-0">
                        {unlocked ? (
                          <span aria-hidden="true">{mod.icon}</span>
                        ) : (
                          <Lock
                            className="w-5 h-5 text-slate-400"
                            aria-label="Qulflangan"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tabular-nums">
                          {index + 1}-modul · ~{mod.estimatedMinutes} daqiqa
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {mod.shortTitle}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavoriteModule(mod.id)}
                      aria-label={
                        isFav
                          ? `${mod.shortTitle} modulini sevimlilardan olib tashlash`
                          : `${mod.shortTitle} modulini sevimlilarga qo‘shish`
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {passed
                        ? 'Muvaffaqiyatli o‘tildi'
                        : unlocked
                        ? 'O‘rganish uchun ochiq'
                        : `${mod.id - 1}-modulda kamida 70% kerak`}
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        passed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {bestScore}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        passed ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${bestScore}%` }}
                    />
                  </div>

                  {unlocked ? (
                    <Link
                      to={`/modul/${mod.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors min-h-[42px]"
                    >
                      {bestScore > 0 ? 'Davom ettirish' : 'Modulni ochish'}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold min-h-[42px]">
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      Qulflangan
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Tezkor bo‘limlar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/oyinlar"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              O‘yinlar markazi
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              9 ta interaktiv o‘yin, 2 kishilik bellashuv va Gap me’mori konstruktori.
            </p>
          </div>
        </Link>

        <Link
          to="/bba-testlar"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              BBA imtihon markazi
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              6 ta to‘liq variant (180 ta savol), taymerli imtihon va xatolarni aqlli takrorlash.
            </p>
          </div>
        </Link>

        <Link
          to="/lugat"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Lug‘at va qoidalar jadvali
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              65+ atama izohi, chop etiladigan tezkor jadval va maqollar tahlili.
            </p>
          </div>
        </Link>
      </section>

      <div className="flex items-center justify-center pt-2">
        <Link
          to="/profil"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-teal-300"
        >
          <Award className="w-4 h-4" aria-hidden="true" />
          Jami {progress.unlockedAchievements.length} ta yutuq ochilgan · Profilni ko‘rish
        </Link>
      </div>
    </div>
  );
};
