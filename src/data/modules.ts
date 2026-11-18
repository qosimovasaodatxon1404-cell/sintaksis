import { MODULES_PART_1 } from './modulesPart1';
import { MODULES_PART_2 } from './modulesPart2';
import { MODULES_PART_3 } from './modulesPart3';
import { QuizQuestion, SyntaxModule, SyntaxRole } from '../types/syntax';

export const ALL_MODULES: SyntaxModule[] = [
  ...MODULES_PART_1,
  ...MODULES_PART_2,
  ...MODULES_PART_3,
];

export interface RoleMeta {
  role: SyntaxRole;
  label: string;
  question: string;
  lineLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  underlineClass: string;
  hex: string;
}

export const ROLE_META: Record<SyntaxRole, RoleMeta> = {
  ega: {
    role: 'ega',
    label: 'Ega',
    question: 'Kim? Nima? Qayer?',
    lineLabel: '──── (1 chiziq)',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/25',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-500/40',
    underlineClass: 'syntax-ega',
    hex: '#2563EB',
  },
  kesim: {
    role: 'kesim',
    label: 'Kesim',
    question: 'Nima qildi? Qanday?',
    lineLabel: '════ (2 chiziq)',
    bgClass: 'bg-rose-500/15 dark:bg-rose-500/25',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-500/40',
    underlineClass: 'syntax-kesim',
    hex: '#E11D48',
  },
  toldiruvchi: {
    role: 'toldiruvchi',
    label: 'To‘ldiruvchi',
    question: 'Kimni? Nimani? Kimga?',
    lineLabel: '- - - (uzuk chiziq)',
    bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/40',
    underlineClass: 'syntax-toldiruvchi',
    hex: '#059669',
  },
  aniqlovchi: {
    role: 'aniqlovchi',
    label: 'Aniqlovchi',
    question: 'Qanday? Kimning?',
    lineLabel: '~~~~ (to‘lqinli)',
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/25',
    textClass: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-500/40',
    underlineClass: 'syntax-aniqlovchi',
    hex: '#D97706',
  },
  hol: {
    role: 'hol',
    label: 'Hol',
    question: 'Qachon? Qayerda? Nega?',
    lineLabel: '-·-·- (nuqta-chiziq)',
    bgClass: 'bg-violet-500/15 dark:bg-violet-500/25',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-500/40',
    underlineClass: 'syntax-hol',
    hex: '#7C3AED',
  },
  other: {
    role: 'other',
    label: 'Bog‘lovchi / Kirish / Undalma',
    question: 'Yordamchi yoki ajratilgan birlik',
    lineLabel: '(alohida)',
    bgClass: 'bg-teal-500/15 dark:bg-teal-500/25',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-500/40',
    underlineClass: '',
    hex: '#0D9488',
  },
};

export interface DailySentence {
  sentence: string;
  author: string;
  type: string;
  breakdown: string;
}

export const DAILY_SENTENCES: DailySentence[] = [
  {
    sentence: 'Ilm — inson tafakkurining bebaho chirog‘i.',
    author: 'O‘zbek hikmati',
    type: 'Ikki tarkibli sodda yoyiq gap (ot-kesimli)',
    breakdown: '«Ilm» — ega; «chirog‘i» — ot-kesim; «inson tafakkurining bebaho» — aniqlovchilar. Bog‘lama bo‘lmagani uchun tire qo‘yilgan.',
  },
  {
    sentence: 'Yetti o‘lchab, bir kes.',
    author: 'Xalq maqoli',
    type: 'Bir tarkibli (shaxsi umumlashgan) sodda yoyiq gap',
    breakdown: '«kes» — kesim; «yetti o‘lchab» — ravish holi; «bir» — miqdor holi. Barcha shaxslarga umumiy tegishli.',
  },
  {
    sentence: 'Kim halol mehnat qilsa, u albatta murodiga yetadi.',
    author: 'Hikmatli so‘z',
    type: 'Ega ergash gapli qo‘shma gap',
    breakdown: '«Kim halol mehnat qilsa» — ega ergash gap; «u» — bosh gap egasi; «albatta» — kirish so‘z (gap bo‘lagi emas).',
  },
  {
    sentence: 'Do‘stlar, vaqt — eng qimmatli boyligimiz!',
    author: 'Tarbiyaviy fikr',
    type: 'Undalmali undov gap (ot-kesimli)',
    breakdown: '«Do‘stlar» — undalma; «vaqt» — ega; «boyligimiz» — ot-kesim.',
  },
  {
    sentence: 'Bog‘da qizil, sariq va oq lolalar tongda ochildi.',
    author: 'Badiiy tasvir',
    type: 'Uyushiq aniqlovchili sodda yoyiq gap',
    breakdown: '«Bog‘da» (o‘rin holi), «qizil, sariq va oq» (uyushiq aniqlovchilar), «lolalar» (ega), «tongda» (payt holi), «ochildi» (kesim).',
  },
  {
    sentence: 'Alisher Navoiy: «Bilmaganni so‘rab o‘rgangan olim», — deganlar.',
    author: 'Alisher Navoiy',
    type: 'Ko‘chirma gapli qurilma',
    breakdown: '«Alisher Navoiy ... deganlar» — muallif gapi; qo‘shtirnoq ichidagi hikmat — ko‘chirma gap.',
  },
  {
    sentence: 'Bahor keldi: dalalar yam-yashil gilamga burkandi.',
    author: 'Tabiat manzarasi',
    type: 'Bog‘lovchisiz qo‘shma gap',
    breakdown: 'Ikkinchi qism birinchisining natijasi va manzarasini ochib bergani uchun ikki nuqta (:) qo‘yilgan.',
  },
];

export function getDailySentence(): DailySentence {
  const now = new Date();
  const dayIndex =
    now.getFullYear() * 366 + now.getMonth() * 31 + now.getDate();
  return DAILY_SENTENCES[dayIndex % DAILY_SENTENCES.length];
}

export function getDailyChallengeQuestions(): QuizQuestion[] {
  const allPool: QuizQuestion[] = ALL_MODULES.flatMap((m) => m.miniTest);
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const selected: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < 5; i += 1) {
    let idx = (seed * (i + 3) + i * 17) % allPool.length;
    while (usedIds.has(allPool[idx].id)) {
      idx = (idx + 1) % allPool.length;
    }
    usedIds.add(allPool[idx].id);
    selected.push(allPool[idx]);
  }
  return selected;
}
