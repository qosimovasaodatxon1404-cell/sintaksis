import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Lightbulb,
  Printer,
  Save,
} from 'lucide-react';
import { ALL_MODULES } from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import { launchConfetti } from '../utils/confetti';

export const HomeworkPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId?: string }>();
  const initialId = Number(moduleId) || 1;
  const [selectedId, setSelectedId] = useState<number>(
    ALL_MODULES.some((m) => m.id === initialId) ? initialId : 1
  );

  const { progress, saveHomeworkPartA, saveHomeworkWritten, soundPlay } =
    useProgress();

  const mod = ALL_MODULES.find((m) => m.id === selectedId) ?? ALL_MODULES[0];
  const savedHw = progress.homeworkCompleted[mod.id];

  // A qism holati
  const [partAAnswers, setPartAAnswers] = useState<Record<string, number>>({});
  const [partASubmitted, setPartASubmitted] = useState(false);

  // B va C qismlar matnlari
  const [notes, setNotes] = useState<Record<string, string>>(
    savedHw?.writtenNotes ?? {}
  );
  const [revealedSamples, setRevealedSamples] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  useEffect(() => {
    if (moduleId) {
      const num = Number(moduleId);
      if (ALL_MODULES.some((m) => m.id === num)) {
        setSelectedId(num);
      }
    }
  }, [moduleId]);

  useEffect(() => {
    const hw = progress.homeworkCompleted[selectedId];
    setNotes(hw?.writtenNotes ?? {});
    setPartAAnswers({});
    setPartASubmitted(false);
    setRevealedSamples({});
    setRevealedHints({});
    setSavedBanner(null);
  }, [selectedId, progress.homeworkCompleted]);

  const partAAnsweredCount = Object.keys(partAAnswers).length;
  const partAScore = mod.homework.partA.reduce(
    (s, q) => s + (partAAnswers[q.id] === q.correctIndex ? 1 : 0),
    0
  );

  const handleSubmitPartA = () => {
    setPartASubmitted(true);
    saveHomeworkPartA(mod.id, partAScore, mod.homework.partA.length);
    if (partAScore >= 4) {
      soundPlay('levelUp');
      launchConfetti();
    } else {
      soundPlay('click');
    }
  };

  const handleSavePartB = () => {
    const bNotes: Record<string, string> = {};
    mod.homework.partB.forEach((task) => {
      bNotes[task.id] = notes[task.id] ?? '';
    });
    saveHomeworkWritten(mod.id, 'B', bNotes);
    soundPlay('correct');
    setSavedBanner('B qismi muvaffaqiyatli saqlandi (+30 XP)!');
    window.setTimeout(() => setSavedBanner(null), 3500);
  };

  const handleSavePartC = () => {
    const cTask = mod.homework.partC;
    saveHomeworkWritten(mod.id, 'C', {
      [cTask.id]: notes[cTask.id] ?? '',
    });
    soundPlay('levelUp');
    launchConfetti();
    setSavedBanner('C qismi muvaffaqiyatli saqlandi (+35 XP)!');
    window.setTimeout(() => setSavedBanner(null), 3500);
  };

  const toggleChecklistItem = (key: string) => {
    setCheckedChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Uy vazifasi daftari
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Har bir modul uchun 3 qismli (test, yozma va ijodiy) topshiriqlar va chop etish imkoniyati.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold min-h-[42px] self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            Chop etish / PDF
          </button>
        </div>

        {/* Modul tanlash chizig‘i */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {ALL_MODULES.map((m) => {
            const hw = progress.homeworkCompleted[m.id];
            const fullyDone = hw?.partADone && hw?.partBDone && hw?.partCDone;
            const active = m.id === selectedId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors min-h-[38px] ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : fullyDone
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {fullyDone && !active && (
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {m.id}-modul
              </button>
            );
          })}
        </div>
      </section>

      {savedBanner && (
        <div
          role="status"
          className="rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-bold shadow-md no-print"
        >
          {savedBanner}
        </div>
      )}

      {/* Chop etiladigan asosiy konteyner */}
      <div className="print-container space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-indigo-600 dark:text-teal-300">
              {mod.id}-MODUL UY VAZIFASI
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {mod.title}
            </h2>
          </div>
          <Link
            to={`/modul/${mod.id}`}
            className="text-xs font-bold text-indigo-600 dark:text-teal-300 hover:underline no-print"
          >
            Qoidalarni qayta o‘qish →
          </Link>
        </div>

        {/* A qism: 5 ta avtomatik test */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                A qism — Tezkor test (5 ta savol)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avtomatik tekshiriladi va darhol izoh ko‘rsatiladi.
              </p>
            </div>
            {savedHw?.partADone && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Bajarildi ({savedHw.partAScore}%)
              </span>
            )}
          </div>

          <div className="space-y-4">
            {mod.homework.partA.map((q, idx) => {
              const pick = partAAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2.5"
                >
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const selected = pick === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      let cls =
                        'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400';
                      if (!partASubmitted && selected) {
                        cls =
                          'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 ring-1 ring-indigo-500';
                      } else if (partASubmitted) {
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
                          disabled={partASubmitted}
                          onClick={() =>
                            setPartAAnswers((prev) => ({
                              ...prev,
                              [q.id]: optIdx,
                            }))
                          }
                          className={`text-left rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold min-h-[40px] ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {partASubmitted && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-indigo-700 dark:text-teal-300">
                        Izoh:{' '}
                      </strong>
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            {partASubmitted ? (
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                Natija: {partAScore} / {mod.homework.partA.length} (
                {Math.round((partAScore / mod.homework.partA.length) * 100)}%)
              </div>
            ) : (
              <div />
            )}
            <button
              type="button"
              disabled={partAAnsweredCount < mod.homework.partA.length}
              onClick={handleSubmitPartA}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold min-h-[42px]"
            >
              A qismini tekshirish ({partAAnsweredCount}/{mod.homework.partA.length})
            </button>
          </div>
        </section>

        {/* B qism: 3 ta yozma topshiriq */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                B qism — Yozma mashqlar (3 ta topshiriq)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Javobingizni yozing, so‘ngra namunaviy javob va o‘z-o‘zini tekshirish mezonlari bilan solishtiring.
              </p>
            </div>
            {savedHw?.partBDone && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Bajarildi
              </span>
            )}
          </div>

          <div className="space-y-5">
            {mod.homework.partB.map((task, idx) => (
              <div
                key={task.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {idx + 1}. {task.prompt}
                </div>

                <textarea
                  rows={3}
                  value={notes[task.id] ?? ''}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [task.id]: e.target.value }))
                  }
                  placeholder="Javobingizni shu yerga yozing..."
                  aria-label={`${idx + 1}-yozma topshiriq javobi`}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex flex-wrap gap-2 no-print">
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedHints((p) => ({
                        ...p,
                        [task.id]: !p[task.id],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold"
                  >
                    <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                    {revealedHints[task.id] ? 'Maslahatni yopish' : 'Yo‘l-yo‘riq'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRevealedSamples((p) => ({
                        ...p,
                        [task.id]: !p[task.id],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    {revealedSamples[task.id]
                      ? 'Namunani yashirish'
                      : 'Namunaviy javob'}
                  </button>
                </div>

                {revealedHints[task.id] && (
                  <p className="rounded-lg bg-amber-50/80 dark:bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                    <strong>Maslahat: </strong>
                    {task.hint}
                  </p>
                )}

                {revealedSamples[task.id] && (
                  <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-500/10 p-3 text-xs space-y-2">
                    <div className="text-emerald-900 dark:text-emerald-200">
                      <strong>Namunaviy javob: </strong>
                      {task.sampleAnswer}
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        O‘z-o‘zini tekshirish:
                      </div>
                      {task.checklist.map((chk, ci) => {
                        const key = `${task.id}-chk-${ci}`;
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(checkedChecklist[key])}
                              onChange={() => toggleChecklistItem(key)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{chk}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end no-print">
            <button
              type="button"
              onClick={handleSavePartB}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold min-h-[42px]"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              B qismini saqlash (+30 XP)
            </button>
          </div>
        </section>

        {/* C qism: 1 ta ijodiy topshiriq */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                C qism — Ijodiy topshiriq
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bilimingizni hayotiy matn va nutq yaratishda qo‘llang.
              </p>
            </div>
            {savedHw?.partCDone && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Bajarildi
              </span>
            )}
          </div>

          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {mod.homework.partC.prompt}
          </div>

          <textarea
            rows={4}
            value={notes[mod.homework.partC.id] ?? ''}
            onChange={(e) =>
              setNotes((prev) => ({
                ...prev,
                [mod.homework.partC.id]: e.target.value,
              }))
            }
            placeholder="Ijodiy ishingizni shu yerga yozing..."
            aria-label="Ijodiy topshiriq matni"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={() =>
                setRevealedHints((p) => ({
                  ...p,
                  [mod.homework.partC.id]: !p[mod.homework.partC.id],
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold"
            >
              <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
              Yo‘l-yo‘riq
            </button>
            <button
              type="button"
              onClick={() =>
                setRevealedSamples((p) => ({
                  ...p,
                  [mod.homework.partC.id]: !p[mod.homework.partC.id],
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              Namunaviy javob
            </button>
          </div>

          {revealedHints[mod.homework.partC.id] && (
            <p className="rounded-lg bg-amber-50/80 dark:bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <strong>Maslahat: </strong>
              {mod.homework.partC.hint}
            </p>
          )}

          {revealedSamples[mod.homework.partC.id] && (
            <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-500/10 p-3 text-xs space-y-2">
              <div className="text-emerald-900 dark:text-emerald-200">
                <strong>Namuna: </strong>
                {mod.homework.partC.sampleAnswer}
              </div>
              <div className="space-y-1 pt-1">
                {mod.homework.partC.checklist.map((chk, ci) => {
                  const key = `${mod.homework.partC.id}-chk-${ci}`;
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checkedChecklist[key])}
                        onChange={() => toggleChecklistItem(key)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{chk}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end no-print">
            <button
              type="button"
              onClick={handleSavePartC}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold min-h-[42px]"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              C qismini saqlash (+35 XP)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
