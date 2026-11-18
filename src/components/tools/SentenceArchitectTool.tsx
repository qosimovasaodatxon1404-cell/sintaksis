import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Hammer,
  Plus,
  Trash2,
} from 'lucide-react';
import { ROLE_META } from '../../data/modules';
import { useProgress } from '../../hooks/useProgress';
import { SyntaxRole } from '../../types/syntax';

interface Block {
  id: string;
  role: SyntaxRole;
  word: string;
}

const ROLE_ORDER: SyntaxRole[] = [
  'aniqlovchi',
  'ega',
  'hol',
  'toldiruvchi',
  'kesim',
  'other',
];

const STARTER_BLOCKS: Block[] = [
  { id: 'b1', role: 'hol', word: 'Erta tongda' },
  { id: 'b2', role: 'aniqlovchi', word: 'tirishqoq' },
  { id: 'b3', role: 'ega', word: 'o‘quvchilar' },
  { id: 'b4', role: 'toldiruvchi', word: 'kitoblarni' },
  { id: 'b5', role: 'kesim', word: 'o‘qishdi.' },
];

const PRESET_TEMPLATES: { title: string; blocks: Block[] }[] = [
  {
    title: 'Sodda yoyiq gap',
    blocks: STARTER_BLOCKS,
  },
  {
    title: 'Ot-kesimli gap',
    blocks: [
      { id: 't1', role: 'ega', word: 'Ilm' },
      { id: 't2', role: 'other', word: '—' },
      { id: 't3', role: 'aniqlovchi', word: 'tuganmas' },
      { id: 't4', role: 'kesim', word: 'boylik.' },
    ],
  },
  {
    title: 'Undalmali gap',
    blocks: [
      { id: 'u1', role: 'other', word: 'Aziz do‘stlar,' },
      { id: 'u2', role: 'toldiruvchi', word: 'ona tilini' },
      { id: 'u3', role: 'hol', word: 'astoydil' },
      { id: 'u4', role: 'kesim', word: 'o‘rganing!' },
    ],
  },
];

export const SentenceArchitectTool: React.FC = () => {
  const { addXp, soundPlay } = useProgress();
  const [blocks, setBlocks] = useState<Block[]>(STARTER_BLOCKS);
  const [selectedRole, setSelectedRole] = useState<SyntaxRole>('ega');
  const [wordInput, setWordInput] = useState('');
  const [copied, setCopied] = useState(false);

  const addBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = wordInput.trim();
    if (!cleaned) return;
    setBlocks((prev) => [
      ...prev,
      { id: `blk-${Date.now()}-${Math.random()}`, role: selectedRole, word: cleaned },
    ]);
    setWordInput('');
    soundPlay('click');
    addXp(2);
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((prev) => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    soundPlay('click');
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    soundPlay('click');
  };

  const fullSentence = blocks.map((b) => b.word).join(' ');
  const schemaText = blocks.map((b) => ROLE_META[b.role].label).join(' + ');

  const hasEga = blocks.some((b) => b.role === 'ega');
  const hasKesim = blocks.some((b) => b.role === 'kesim');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${fullSentence}\nSxema: ${schemaText}`
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Hammer className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Gap me’mori — Ijodiy konstruktor
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Rangli g‘ishtchalardan o‘zingizning mukammal gapingizni quring, tartibini o‘zgartiring va tuzilish sxemasini kuzating.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.title}
              type="button"
              onClick={() => {
                setBlocks(tpl.blocks);
                soundPlay('click');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-500/20 transition-colors"
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Yangi g‘ishtcha qo‘shish */}
      <form onSubmit={addBlock} className="space-y-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          1. Bo‘lak turini tanlang va so‘z kiriting:
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_ORDER.map((role) => {
            const meta = ROLE_META[role];
            const active = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all min-h-[36px] ${
                  active
                    ? `${meta.bgClass} ${meta.textClass} ${meta.borderClass} ring-2 ring-indigo-500`
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder={`Masalan: ${
              selectedRole === 'ega'
                ? 'qushlar'
                : selectedRole === 'kesim'
                ? 'sayradi.'
                : selectedRole === 'aniqlovchi'
                ? 'sho‘x'
                : selectedRole === 'toldiruvchi'
                ? 'qo‘shiqni'
                : selectedRole === 'hol'
                ? 'bog‘da'
                : 'albatta,'
            }`}
            aria-label="So‘z yoki birikma"
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold min-h-[44px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Bo‘lak qo‘shish
          </button>
        </div>
      </form>

      {/* Qurilgan bloklar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Qurilgan gap g‘ishtchalari ({blocks.length} ta):
          </span>
          {blocks.length > 0 && (
            <button
              type="button"
              onClick={() => setBlocks([])}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Hammasini tozalash
            </button>
          )}
        </div>

        {blocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Hali birorta bo‘lak qo‘shilmagan. Yuqoridan so‘z qo‘shib gap qurishni boshlang!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {blocks.map((block, index) => {
              const meta = ROLE_META[block.role];
              return (
                <div
                  key={block.id}
                  className={`rounded-xl border px-3 py-2 flex flex-col gap-1.5 ${meta.bgClass} ${meta.borderClass}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[11px] font-bold ${meta.textClass}`}>
                      {meta.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0}
                        aria-label="Chapga surish"
                        className="p-0.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 1)}
                        disabled={index === blocks.length - 1}
                        aria-label="O‘ngga surish"
                        className="p-0.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        aria-label="O‘chirish"
                        className="p-0.5 rounded text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className={`text-base font-bold text-slate-900 dark:text-white ${meta.underlineClass}`}>
                    {block.word}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Yakuniy natija ko‘rinishi */}
      {blocks.length > 0 && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/10 p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo-700 dark:text-teal-300">
                Yig‘ilgan gap:
              </div>
              <p className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {fullSentence}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 min-h-[36px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  Nusxa olindi
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Nusxa olish
                </>
              )}
            </button>
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
            Sxema: {schemaText}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {hasEga && hasKesim
              ? 'Bu ikki tarkibli gap: ham ega, ham kesim mavjud.'
              : hasKesim
              ? 'Diqqat: gapda kesim bor, ega qatnashmagan (bir tarkibli yoki to‘liqsiz gap ko‘rinishida).'
              : 'Eslatma: to‘liq gap hosil bo‘lishi uchun odatda kesim bo‘lagi qo‘shish kerak.'}
          </div>
        </div>
      )}
    </div>
  );
};
