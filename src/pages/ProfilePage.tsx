import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  Download,
  Flame,
  Lock,
  RotateCcw,
  Star,
  Upload,
  UserCheck,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { ALL_MODULES } from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import { AVATAR_OPTIONS, RANKS } from '../utils/storage';

export const ProfilePage: React.FC = () => {
  const {
    progress,
    rank,
    setProfile,
    exportProgressJson,
    importProgressJson,
    resetAllProgress,
    soundPlay,
  } = useProgress();

  const [nameInput, setNameInput] = useState(progress.name || '');
  const [avatarInput, setAvatarInput] = useState(progress.avatar || '🦉');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(nameInput.trim() || 'Bilimdon', avatarInput);
    soundPlay('correct');
    setStatusMessage({
      type: 'ok',
      text: 'Profil ma’lumotlari muvaffaqiyatli yangilandi.',
    });
    window.setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sintaksisland-natijalar.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundPlay('click');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importProgressJson(String(reader.result ?? ''));
      if (res.ok) {
        soundPlay('levelUp');
        setStatusMessage({
          type: 'ok',
          text: 'Natijalar fayldan muvaffaqiyatli tiklandi!',
        });
      } else {
        soundPlay('wrong');
        setStatusMessage({
          type: 'err',
          text: res.error ?? 'Faylni yuklashda xatolik yuz berdi.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetAllProgress();
    setConfirmResetOpen(false);
    setNameInput('');
    setAvatarInput('🦉');
    soundPlay('click');
    setStatusMessage({
      type: 'ok',
      text: 'Barcha natijalar noldan boshlash uchun tozalandi.',
    });
  };

  const completedModules = Object.values(progress.moduleBestScores).filter(
    (s) => s >= 70
  ).length;

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-bold ${
            statusMessage.type === 'ok'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Profil va Statistika */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">
              {avatarInput}
            </span>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {progress.name || 'Bilimdon'}
              </h1>
              <div className="text-xs font-bold text-indigo-600 dark:text-teal-300">
                {rank.level}-daraja · {rank.title}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Ismingiz
            </label>
            <input
              id="profile-name"
              type="text"
              maxLength={24}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ismingizni kiriting..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Belgingizni tanlang
            </span>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarInput(av.emoji)}
                  title={av.label}
                  aria-label={av.label}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    avatarInput === av.emoji
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 scale-105'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[42px]"
          >
            <UserCheck className="w-4 h-4" aria-hidden="true" />
            Saqlash
          </button>
        </form>

        {/* Asosiy ko‘rsatkichlar */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Umumiy XP
            </div>
            <div className="font-display text-3xl font-extrabold text-indigo-600 dark:text-teal-300 tabular-nums mt-1">
              {progress.xp}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {rank.description}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" aria-hidden="true" />
              Kunlik seriya
            </div>
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
              {progress.streak} kun
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Har kuni kirish seriyani oshiradi
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Yakunlangan modullar
            </div>
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
              {completedModules} / 12
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              O‘yinlar: {progress.gamesPlayed} ta o‘ynaldi
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Award className="w-4 h-4" aria-hidden="true" />
              Yutuqlar
            </div>
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
              {progress.unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Blits rekord: {progress.blitzBestScore}
            </p>
          </div>
        </div>
      </section>

      {/* Darajalar zinapoyasi */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Darajalar zinapoyasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RANKS.map((r) => {
            const reached = progress.xp >= r.minXp;
            const current = rank.level === r.level;
            return (
              <div
                key={r.level}
                className={`rounded-xl border p-3.5 ${
                  current
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 ring-1 ring-indigo-500'
                    : reached
                    ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-700 dark:text-teal-300">
                    {r.level}-daraja
                  </span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">
                    {r.minXp}+ XP
                  </span>
                </div>
                <div className="font-display text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {r.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12 modul bo‘yicha o‘zlashtirish grafigi */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          12 modul bo‘yicha natijalar xaritasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_MODULES.map((m) => {
            const score = progress.moduleBestScores[m.id] ?? 0;
            return (
              <div
                key={m.id}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200 truncate pr-2">
                    {m.id}. {m.shortTitle}
                  </span>
                  <span className="tabular-nums text-indigo-600 dark:text-teal-300">
                    {score}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= 70 ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sevimli modullar */}
      {progress.favoriteModules.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
            Saqlangan (sevimli) modullar
          </h2>
          <div className="flex flex-wrap gap-2">
            {progress.favoriteModules.map((id) => {
              const m = ALL_MODULES.find((item) => item.id === id);
              if (!m) return null;
              return (
                <Link
                  key={id}
                  to={`/modul/${id}`}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100"
                >
                  {m.icon} {m.id}-modul: {m.shortTitle}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 22 ta yutuqlar */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Yutuqlar galereyasi ({progress.unlockedAchievements.length} / {ACHIEVEMENTS.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = progress.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  unlocked
                    ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 opacity-65'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                  {unlocked ? (
                    <span aria-hidden="true">{ach.icon}</span>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {ach.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {ach.description}
                  </p>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-teal-300 mt-1">
                    +{ach.xpBonus} XP · {unlocked ? 'Ochilgan' : 'Yopiq'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ma’lumotlarni saqlash, tiklash va tozalash */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Natijalarni saqlash va boshqarish
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Natijalaringiz brauzerning o‘zida saqlanadi. Boshqa qurilmaga ko‘chirish uchun faylga yuklab olishingiz yoki qayta yuklashingiz mumkin.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold min-h-[42px]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Natijalarni yuklab olish (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold min-h-[42px]"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Fayldan tiklash
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold min-h-[42px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Progressni tozalash
          </button>
        </div>

        {confirmResetOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            className="rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/50 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3
                  id="reset-dialog-title"
                  className="font-display text-sm font-bold text-rose-900 dark:text-rose-200"
                >
                  Barcha natijalarni o‘chirishni tasdiqlaysizmi?
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                  Bu amalni ortga qaytarib bo‘lmaydi: XP, yutuqlar, BBA tarixi va ochilgan modullar boshlang‘ich holatga qaytadi.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold min-h-[38px]"
              >
                Ha, tozalash
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[38px]"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
