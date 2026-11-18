import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { ColorLegend } from './ColorLegend';

const NAV_LINKS = [
  { to: '/', label: 'Bosh sahifa' },
  { to: '/oyinlar', label: 'O‘yinlar' },
  { to: '/bba-testlar', label: 'BBA test' },
  { to: '/uy-vazifasi', label: 'Uy vazifasi' },
  { to: '/lugat', label: 'Lug‘at' },
];

const FLOATING_SYMBOLS = [
  { char: '!', top: '12%', left: '5%', delay: '0s' },
  { char: '?', top: '22%', left: '92%', delay: '1.5s' },
  { char: '—', top: '46%', left: '4%', delay: '3s' },
  { char: '« »', top: '65%', left: '93%', delay: '2s' },
  { char: ':', top: '78%', left: '8%', delay: '4s' },
  { char: ';', top: '34%', left: '88%', delay: '5s' },
  { char: 'O‘', top: '86%', left: '86%', delay: '2.5s' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { progress, rank, toggleTheme, toggleSound, toast, dismissToast } =
    useProgress();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative aurora-bg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Yengil suzuvchi fon belgilari */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden z-0 no-print select-none"
        aria-hidden="true"
      >
        {FLOATING_SYMBOLS.map((item, idx) => (
          <span
            key={idx}
            className="absolute font-display text-2xl sm:text-4xl font-bold text-indigo-500/[0.06] dark:text-indigo-300/[0.07] animate-float-slow"
            style={{
              top: item.top,
              left: item.left,
              animationDelay: item.delay,
            }}
          >
            {item.char}
          </span>
        ))}
      </div>

      {/* Yuqori navigatsiya paneli (Top Bar Contract: 3 zona) */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* 1-zona: Brend nomi */}
          <Link
            to="/"
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-teal-500 to-rose-500 bg-clip-text text-transparent whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
          >
            SintaksisLand
          </Link>

          {/* 2-zona: 5 ta ixcham navigatsiya havolasi */}
          <nav
            className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300"
            aria-label="Asosiy navigatsiya"
          >
            {NAV_LINKS.map((link) => {
              const active =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                    active
                      ? 'border-indigo-600 text-indigo-700 dark:border-teal-400 dark:text-teal-300'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3-zona: Profil va tezkor sozlamalar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={progress.soundEnabled ? 'Ovozni o‘chirish' : 'Ovozni yoqish'}
              title={progress.soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o‘chirilgan'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                progress.theme === 'dark'
                  ? 'Yorug‘ rejimga o‘tish'
                  : 'Tungi rejimga o‘tish'
              }
              title={
                progress.theme === 'dark' ? 'Yorug‘ rejim' : 'Tungi rejim'
              }
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              {progress.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <Link
              to="/profil"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <span aria-hidden="true">{progress.avatar}</span>
              <span className="max-w-[90px] truncate">
                {progress.name || 'Profil'}
              </span>
              <span className="hidden sm:inline tabular-nums text-indigo-100">
                · {progress.xp} XP
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menyuni ochish"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobil menyu */}
        {mobileMenuOpen && (
          <nav
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1"
            aria-label="Mobil navigatsiya"
          >
            {NAV_LINKS.map((link) => {
              const active =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-bold ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-teal-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/haqida"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Qanday foydalanish
            </Link>
          </nav>
        )}
      </header>

      {/* Yutuq / Daraja xabarnomasi */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 shadow-xl p-4 flex items-start gap-3 no-print"
        >
          <span className="text-2xl shrink-0" aria-hidden="true">
            {toast.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
              {toast.title}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {toast.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Xabarni yopish"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Doimiy Rang kaliti chizig‘i */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 no-print">
        <ColorLegend compact />
      </div>

      {/* Asosiy sahifa mazmuni */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Pastki qism (Footer) */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span className="font-display font-bold text-slate-900 dark:text-white">
              SintaksisLand
            </span>
            <span aria-hidden="true">·</span>
            <span>8–11-sinf va BBA imtihoniga tayyorlov platformasi</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Daraja: {rank.title} ({progress.streak} kunlik seriya)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              to="/lugat"
              className="hover:text-indigo-600 dark:hover:text-teal-300 font-semibold whitespace-nowrap"
            >
              Lug‘at va jadval
            </Link>
            <Link
              to="/haqida"
              className="hover:text-indigo-600 dark:hover:text-teal-300 font-semibold whitespace-nowrap"
            >
              Biz haqimizda
            </Link>
            <Link
              to="/profil"
              className="hover:text-indigo-600 dark:hover:text-teal-300 font-semibold whitespace-nowrap"
            >
              Yutuqlar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
