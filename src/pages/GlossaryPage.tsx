import React, { useMemo, useState } from 'react';
import { BookOpen, Printer, Search, Sparkles, Table2 } from 'lucide-react';
import {
  CHEAT_SHEET_ROWS,
  GLOSSARY_TERMS,
  PROVERBS_SYNTAX,
} from '../data/glossaryAndRules';

type GlossaryTab = 'terms' | 'table' | 'proverbs';

export const GlossaryPage: React.FC = () => {
  const [tab, setTab] = useState<GlossaryTab>('terms');
  const [query, setQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('Barchasi');

  const letters = useMemo(() => {
    const set = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.letter))).sort();
    return ['Barchasi', ...set];
  }, []);

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((t) => {
      const matchLetter =
        selectedLetter === 'Barchasi' || t.letter === selectedLetter;
      const matchQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchLetter && matchQuery;
    });
  }, [query, selectedLetter]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-4 no-print">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Sintaksis lug‘ati va tezkor jadval
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              {GLOSSARY_TERMS.length} ta ilmiy atama izohi, chop etish uchun qoidalar jadvali va o‘zbek xalq maqollarining sintaktik tahlili.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'terms'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Atamalar lug‘ati ({GLOSSARY_TERMS.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('table')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'table'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
            Qoidalar jadvali
          </button>

          <button
            type="button"
            onClick={() => setTab('proverbs')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] ${
              tab === 'proverbs'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Maqollar sintaksisi
          </button>
        </div>
      </section>

      {tab === 'terms' && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Atama yoki ta’rif bo‘yicha qidirish..."
                aria-label="Lug‘atdan qidirish"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {letters.map((ltr) => (
                <button
                  key={ltr}
                  type="button"
                  onClick={() => setSelectedLetter(ltr)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[34px] ${
                    selectedLetter === ltr
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {ltr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTerms.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {item.term}
                  </h2>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-teal-300">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.definition}
                </p>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                  <strong>Misol: </strong>
                  {item.example}
                </div>
              </div>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
              Qidiruv bo‘yicha atama topilmadi. Boshqa so‘z kiritib ko‘ring.
            </div>
          )}
        </section>
      )}

      {tab === 'table' && (
        <section className="space-y-4">
          <div className="flex justify-end no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold min-h-[42px]"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Jadvalni chop etish / PDF
            </button>
          </div>

          <div className="print-container rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 overflow-x-auto">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
              Sintaksis bo‘yicha tezkor qoidalar jadvali
            </h2>
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-bold">Bo‘lim</th>
                  <th className="py-2.5 pr-4 font-bold">Mavzu</th>
                  <th className="py-2.5 pr-4 font-bold">Asosiy qoida</th>
                  <th className="py-2.5 pr-4 font-bold">Sxema / Belgi</th>
                  <th className="py-2.5 font-bold">Misol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {CHEAT_SHEET_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-xs font-bold text-indigo-600 dark:text-teal-300 whitespace-nowrap">
                      {row.category}
                    </td>
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {row.topic}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                      {row.keyRule}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-700 dark:text-slate-200">
                      {row.formulaOrMarks}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {row.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'proverbs' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVERBS_SYNTAX.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5"
            >
              <div className="text-xs font-bold text-teal-600 dark:text-teal-300">
                {p.sentenceType}
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                «{p.proverb}»
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ma’nosi: {p.meaning}
              </p>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <strong>Sintaktik tahlil: </strong>
                {p.analysis}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
