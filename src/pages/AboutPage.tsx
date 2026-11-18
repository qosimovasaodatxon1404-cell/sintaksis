import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  Gamepad2,
  GraduationCap,
  Palette,
} from 'lucide-react';
import { GapchiMascot } from '../components/GapchiMascot';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4">
        <div className="text-xs font-bold text-indigo-600 dark:text-teal-300 uppercase tracking-wide">
          LOYIHA HAQIDA · FOYDALANISH YO‘RIQNOMASI
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          SintaksisLand — ona tilini o‘yin va mantiq orqali o‘rganish maydoni
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Ushbu platforma 8–11-sinf o‘quvchilari hamda Bilim va malakalarni baholash agentligi (BBA) imtihoniga tayyorlanuvchilar uchun maxsus ishlab chiqilgan. Maqsadimiz — murakkab sintaksis qoidalarini quruq yodlash o‘rniga rangli sxemalar, interaktiv tahlil va qiziqarli o‘yinlar orqali ongli o‘zlashtirishdir.
        </p>
      </section>

      <GapchiMascot
        mood="encouraging"
        message="Har bir modulda «Qoida → Misol → O‘yin → Mini-test → Uy vazifasi» zanjiridan o‘tsangiz, imtihonda hech qanday savol sizni chalg‘itolmaydi!"
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
          <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-teal-400" aria-hidden="true" />
            12 modulli izchil tizim
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Mavzular oddiydan murakkabga qarab joylashtirilgan: so‘z birikmasidan tortib ko‘chirma gap va tinish belgilari qoidalarigacha. Keyingi modulni ochish uchun joriy mini-testdan kamida 70% to‘plash kifoya.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
          <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
            <Palette className="w-5 h-5 text-rose-500" aria-hidden="true" />
            Yagona «Rang kaliti»
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Butun sayt bo‘ylab har bir gap bo‘lagi o‘zgarmas rang va chiziq belgisiga ega: Ega (ko‘k, 1 chiziq), Kesim (qizil, 2 chiziq), To‘ldiruvchi (yashil, uzuk chiziq), Aniqlovchi (sariq, to‘lqinli), Hol (binafsha, nuqta-chiziq).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
          <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
            <Gamepad2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            O‘yinlar va ijodiy ustaxona
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            9 ta sintaktik o‘yindan tashqari, sinfdosh bilan bellashish uchun 2 o‘yinchi rejimi, «Gap me’mori» konstruktori va istalgan gapni qadamma-qadam tahlil qiluvchi vosita mavjud.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
          <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
            <GraduationCap className="w-5 h-5 text-amber-500" aria-hidden="true" />
            BBA strategiyasi va aqlli takrorlash
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Testlarda xato qilingan har bir savol avtomatik saqlanib, 1 kun va 3 kun oralig‘ida «Aqlli takrorlash» ro‘yxatiga chiqariladi. 3 marta ketma-ket to‘g‘ri yechilgan savol o‘zlashtirilgan deb hisoblanadi.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-indigo-600 dark:text-teal-300" aria-hidden="true" />
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Barcha natijalar qurilmangiz xotirasida saqlanadi — ro‘yxatdan o‘tish va internet tezligiga bog‘liq emas!
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/modul/1"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold min-h-[40px]"
          >
            1-moduldan boshlash
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            to="/lugat"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[40px]"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Lug‘atni ochish
          </Link>
        </div>
      </section>
    </div>
  );
};
