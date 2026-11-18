import { UserProgress } from '../types/syntax';

const STORAGE_KEY = 'sintaksisland_progress_v1';

export const AVATAR_OPTIONS = [
  { id: 'boy-1', emoji: '🧑‍🎓', label: 'Talaba' },
  { id: 'girl-1', emoji: '👩‍🎓', label: 'Bilimdon' },
  { id: 'owl', emoji: '🦉', label: 'Boyo‘g‘li' },
  { id: 'fox', emoji: '🦊', label: 'Ziyrak tulki' },
  { id: 'lion', emoji: '🦁', label: 'Sher' },
  { id: 'rocket', emoji: '🚀', label: 'Kosmonavt' },
  { id: 'book', emoji: '📚', label: 'Kitobxon' },
  { id: 'pen', emoji: '🖋️', label: 'Qalam ustasi' },
  { id: 'crown', emoji: '👑', label: 'Til sultoni' },
  { id: 'star', emoji: '🌟', label: 'Yulduz' },
];

export interface RankInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
  description: string;
}

export const RANKS: RankInfo[] = [
  {
    level: 1,
    title: 'Harf shogirdi',
    minXp: 0,
    nextXp: 150,
    description: 'Sintaksis shahriga ilk qadam qo‘ydi.',
  },
  {
    level: 2,
    title: 'So‘z ustasi',
    minXp: 150,
    nextXp: 400,
    description: 'So‘z birikmalarini mohirlik bilan bog‘laydi.',
  },
  {
    level: 3,
    title: 'Gap me’mori',
    minXp: 400,
    nextXp: 850,
    description: 'Ega, kesim va bo‘laklardan mustahkam gap quradi.',
  },
  {
    level: 4,
    title: 'Tinish posboni',
    minXp: 850,
    nextXp: 1450,
    description: 'Vergul, tire va ikki nuqtani aniq joyiga qo‘yadi.',
  },
  {
    level: 5,
    title: 'Sintaksis akademigi',
    minXp: 1450,
    nextXp: 2300,
    description: 'Qo‘shma gaplar va BBA savollarini bemalol yechadi.',
  },
  {
    level: 6,
    title: 'Til sultoni',
    minXp: 2300,
    nextXp: 5000,
    description: 'O‘zbek tili sintaksisining oliy bilimdoni!',
  },
];

export function getRankInfo(xp: number): RankInfo {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      current = rank;
    }
  }
  return current;
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultProgress(): UserProgress {
  const today = getTodayString();
  return {
    name: '',
    avatar: '🦉',
    onboarded: false,
    xp: 0,
    streak: 1,
    lastActiveDate: today,
    dailyChallengeCompletedDate: '',
    moduleBestScores: {},
    moduleCompletedSections: {},
    homeworkCompleted: {},
    bbaHistory: [],
    wrongQuestions: {},
    unlockedAchievements: [],
    favoriteModules: [],
    lastRoute: '/modul/1',
    gamesPlayed: 0,
    gamesWon: 0,
    blitzBestScore: 0,
    castleCleared: false,
    duelsPlayed: 0,
    soundEnabled: true,
    theme: 'light',
  };
}

let memoryFallback: UserProgress | null = null;

export function loadProgress(): UserProgress {
  const defaults = getDefaultProgress();
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return memoryFallback ?? defaults;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return memoryFallback ?? defaults;
    }
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    const merged: UserProgress = {
      ...defaults,
      ...parsed,
      moduleBestScores: parsed.moduleBestScores ?? {},
      moduleCompletedSections: parsed.moduleCompletedSections ?? {},
      homeworkCompleted: parsed.homeworkCompleted ?? {},
      bbaHistory: Array.isArray(parsed.bbaHistory) ? parsed.bbaHistory : [],
      wrongQuestions: parsed.wrongQuestions ?? {},
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      favoriteModules: Array.isArray(parsed.favoriteModules)
        ? parsed.favoriteModules
        : [],
    };
    return merged;
  } catch {
    return memoryFallback ?? defaults;
  }
}

export function saveProgress(progress: UserProgress): void {
  memoryFallback = progress;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // localStorage mavjud bo‘lmasa yoki kvota to‘lsa jim o‘tib ketadi
  }
}

export function clearProgress(): UserProgress {
  const fresh = getDefaultProgress();
  memoryFallback = fresh;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // xatosiz ishlash
  }
  return fresh;
}

export function isModuleUnlocked(
  moduleId: number,
  moduleBestScores: Record<number, number>
): boolean {
  if (moduleId <= 1) return true;
  const prevScore = moduleBestScores[moduleId - 1] ?? 0;
  return prevScore >= 70;
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
