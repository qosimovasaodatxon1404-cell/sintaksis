import React, { useState } from 'react';
import { Check, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { ROLE_META } from '../../data/modules';
import { useProgress } from '../../hooks/useProgress';
import { SyntaxRole } from '../../types/syntax';

const STEPS: { role: SyntaxRole; title: string; prompt: string }[] = [
  {
    role: 'kesim',
    title: '1-qadam: Kesimni toping',
    prompt: 'Gapdagi hukmni bildiruvchi, «Nima qildi? Nima qiladi? Qanday?» so‘rog‘iga javob bo‘ladigan so‘z(lar)ni bosing.',
  },
  {
    role: 'ega',
    title: '2-qadam: Egani toping',
    prompt: 'Ish-harakatni bajaruvchi yoki hukm qaratilgan «Kim? Nima? Qayer?» so‘rog‘idagi bosh bo‘lakni bosing.',
  },
  {
    role: 'toldiruvchi',
    title: '3-qadam: To‘ldiruvchini toping',
    prompt: 'Kesimga bog‘lanib «Kimni? Nimani? Kimga? Nimada? Kimdan?» so‘roqlariga javob bo‘luvchi so‘zlarni bosing.',
  },
  {
    role: 'aniqlovchi',
    title: '4-qadam: Aniqlovchini toping',
    prompt: 'Predmetning belgisini yoki kimga qarashliligini bildiruvchi («Qanday? Kimning?») so‘zlarni bosing.',
  },
  {
    role: 'hol',
    title: '5-qadam: Holni toping',
    prompt: 'Harakatning o‘rni, payti, tarzi, sababi yoki maqsadini («Qachon? Qayerda? Qanday?») bildiruvchi so‘zlarni bosing.',
  },
  {
    role: 'other',
    title: '6-qadam: Yordamchi yoki ajratilgan so‘zlar',
    prompt: 'Bog‘lovchi, kirish so‘z yoki undalma bo‘lsa belgilang.',
  },
];

const SAMPLE_SENTENCES = [
  'Bahorda bog‘bonlar mevali daraxtlarni mehr bilan parvarish qildilar.',
  'Albatta, tirishqoq o‘quvchilar murakkab testlarni tez yechadilar.',
  'Do‘stlar, mustaqil Vatanimizning kelajagi bizning qo‘limizda!',
];

export const GuidedAnalyzerTool: React.FC = () => {
  const { addXp, soundPlay } = useProgress();
  const [inputText, setInputText] = useState(SAMPLE_SENTENCES[0]);
  const [words, setWords] = useState<string[]>(() =>
    SAMPLE_SENTENCES[0].split(/\s+/).filter(Boolean)
  );
  const [tags, setTags] = useState<Record<number, SyntaxRole>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleLoadSentence = (text: string) => {
    const split = text.trim().split(/\s+/).filter(Boolean);
    setWords(split);
    setTags({});
    setStepIdx(0);
    soundPlay('click');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleLoadSentence(inputText);
  };

  const currentStep = STEPS[stepIdx];

  const toggleWordTag = (wordIndex: number) => {
    const role = currentStep.role;
    setTags((prev) => {
      const next = { ...prev };
      if (next[wordIndex] === role) {
        delete next[wordIndex];
      } else {
        next[wordIndex] = role;
      }
      return next;
    });
    soundPlay('click');
  };

  const taggedCount = Object.keys(tags).length;

  const handleCopySummary = async () => {
    const lines = words.map((w, idx) => {
      const role = tags[idx];
      return role ? `${w} — ${ROLE_META[role].label}` : `${w} — (belgilanmagan)`;
    });
    try {
      await navigator.clipboard.writeText(
        `Gap: ${words.join(' ')}\nTahlil:\n${lines.join('\n')}`
      );
      setCopied(true);
      addXp(5);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Interaktiv gap tahlilchisi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Istalgan o‘zbekcha gapingizni kiriting va bosqichma-bosqich yo‘riqnoma yordamida uni gap bo‘laklariga ajrating.
          </p>
        </div>
      </div>

      {/* Gap kiritish */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-label="Tahlil qilish uchun gap kiriting"
            placeholder="O‘zbekcha gap yozing..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px] whitespace-nowrap"
          >
            Tahlilga joylash
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">
            Tayyor namunalar:
          </span>
          {SAMPLE_SENTENCES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInputText(s);
                handleLoadSentence(s);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 font-semibold"
            >
              {i + 1}-namuna
            </button>
          ))}
        </div>
      </form>

      {/* Bosqich tanlagich */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STEPS.map((st, i) => {
          const meta = ROLE_META[st.role];
          const active = stepIdx === i;
          return (
            <button
              key={st.role}
              type="button"
              onClick={() => setStepIdx(i)}
              className={`rounded-xl border px-3 py-2 text-left transition-all ${
                active
                  ? `${meta.bgClass} ${meta.borderClass} ring-2 ring-indigo-500`
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {i + 1}-bosqich
              </div>
              <div className={`text-xs font-extrabold ${active ? meta.textClass : 'text-slate-800 dark:text-slate-200'}`}>
                {meta.label.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Faol bosqich yo‘riqnomasi */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 space-y-1">
        <div className={`text-sm font-bold ${ROLE_META[currentStep.role].textClass}`}>
          {currentStep.title}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {currentStep.prompt}
        </p>
      </div>

      {/* So‘zlar maydoni */}
      <div className="flex flex-wrap gap-2.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50">
        {words.map((word, idx) => {
          const assigned = tags[idx];
          const meta = assigned ? ROLE_META[assigned] : null;
          return (
            <button
              key={`${idx}-${word}`}
              type="button"
              onClick={() => toggleWordTag(idx)}
              className={`rounded-xl border px-3.5 py-2 text-base font-bold transition-all min-h-[44px] flex flex-col items-center ${
                meta
                  ? `${meta.bgClass} ${meta.textClass} ${meta.borderClass}`
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-indigo-400'
              }`}
            >
              <span className={meta ? meta.underlineClass : ''}>{word}</span>
              {meta && (
                <span className="text-[10px] font-extrabold mt-0.5 uppercase tracking-wide">
                  {meta.label.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Amallar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          Belgilangan so‘zlar: {taggedCount} / {words.length}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTags({})}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[40px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Tozalash
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold min-h-[40px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Tahlil nusxalandi (+5 XP)
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                Tahlilni nusxalash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
