import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  Achievement,
  BbaAttempt,
  QuizQuestion,
  UserProgress,
  WrongQuestionRecord,
} from '../types/syntax';
import { launchConfetti } from '../utils/confetti';
import { playSound } from '../utils/sound';
import {
  addDaysToDateString,
  clearProgress,
  getRankInfo,
  getTodayString,
  getYesterdayString,
  loadProgress,
  RankInfo,
  saveProgress,
} from '../utils/storage';

interface ToastNotification {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

interface ProgressContextValue {
  progress: UserProgress;
  rank: RankInfo;
  dueReviews: WrongQuestionRecord[];
  toast: ToastNotification | null;
  dismissToast: () => void;
  setProfile: (name: string, avatar: string) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  soundPlay: (type: 'correct' | 'wrong' | 'levelUp' | 'click') => void;
  addXp: (amount: number, reason?: string) => void;
  recordModuleSection: (moduleId: number, sectionId: string) => void;
  recordMiniTestResult: (moduleId: number, score: number, total: number) => void;
  saveHomeworkPartA: (moduleId: number, score: number, total: number) => void;
  saveHomeworkWritten: (
    moduleId: number,
    part: 'B' | 'C',
    notes: Record<string, string>
  ) => void;
  recordBbaAttempt: (attempt: Omit<BbaAttempt, 'id' | 'date'>) => void;
  recordWrongQuestion: (q: QuizQuestion) => void;
  markSpacedReviewResult: (questionId: string, correct: boolean) => void;
  recordGameFinish: (opts: {
    won: boolean;
    xp: number;
    blitzScore?: number;
    castleCleared?: boolean;
    isDuel?: boolean;
  }) => void;
  completeDailyChallenge: (correctCount: number) => void;
  toggleFavoriteModule: (moduleId: number) => void;
  setLastRoute: (route: string) => void;
  exportProgressJson: () => string;
  importProgressJson: (raw: string) => { ok: boolean; error?: string };
  resetAllProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function checkAndApplyAchievements(state: UserProgress): {
  next: UserProgress;
  newlyUnlocked: Achievement[];
} {
  const already = new Set(state.unlockedAchievements);
  const newlyUnlocked: Achievement[] = [];

  const completedModulesCount = Object.values(state.moduleBestScores).filter(
    (s) => s >= 70
  ).length;
  const perfectMiniTests = Object.values(state.moduleBestScores).filter(
    (s) => s === 100
  ).length;
  const homeworkFullCount = Object.values(state.homeworkCompleted).filter(
    (h) => h.partADone && h.partBDone && h.partCDone
  ).length;

  const checks: Record<string, boolean> = {
    first_step: state.onboarded && state.name.trim().length > 0,
    module_1_done: (state.moduleBestScores[1] ?? 0) >= 70,
    word_combo_master: (state.moduleBestScores[2] ?? 0) >= 70,
    sentence_architect:
      (state.moduleBestScores[4] ?? 0) >= 70 &&
      (state.moduleBestScores[5] ?? 0) >= 70,
    compound_guru: (state.moduleBestScores[9] ?? 0) >= 70,
    punctuation_dove: (state.moduleBestScores[11] ?? 0) >= 70,
    all_modules_done: completedModulesCount >= 12,
    perfect_minitest: perfectMiniTests >= 1,
    three_perfect_tests: perfectMiniTests >= 3,
    first_game: state.gamesPlayed >= 1,
    five_games: state.gamesPlayed >= 5,
    blitz_champion: state.blitzBestScore >= 120,
    castle_conqueror: state.castleCleared,
    duel_partner: state.duelsPlayed >= 1,
    bba_starter: state.bbaHistory.length >= 1,
    bba_high_score: state.bbaHistory.some((b) => b.percentage >= 80),
    homework_diligent: homeworkFullCount >= 3,
    homework_master: homeworkFullCount >= 8,
    daily_challenger: state.dailyChallengeCompletedDate !== '',
    streak_3: state.streak >= 3,
    streak_7: state.streak >= 7,
    xp_1000: state.xp >= 1000,
  };

  let bonusXp = 0;
  for (const ach of ACHIEVEMENTS) {
    if (!already.has(ach.id) && checks[ach.id]) {
      already.add(ach.id);
      newlyUnlocked.push(ach);
      bonusXp += ach.xpBonus;
    }
  }

  if (newlyUnlocked.length === 0) {
    return { next: state, newlyUnlocked: [] };
  }

  return {
    next: {
      ...state,
      xp: state.xp + bonusXp,
      unlockedAchievements: Array.from(already),
    },
    newlyUnlocked,
  };
}

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const loaded = loadProgress();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let streak = loaded.streak;
    if (loaded.lastActiveDate !== today) {
      if (loaded.lastActiveDate === yesterday) {
        streak = loaded.streak + 1;
      } else if (loaded.lastActiveDate) {
        streak = 1;
      }
    }
    const updated: UserProgress = {
      ...loaded,
      streak: Math.max(1, streak),
      lastActiveDate: today,
    };
    saveProgress(updated);
    return updated;
  });

  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback((t: ToastNotification) => {
    setToast(t);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Sync Tailwind .dark class on <html>
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (progress.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.theme]);

  const soundPlay = useCallback(
    (type: 'correct' | 'wrong' | 'levelUp' | 'click') => {
      playSound(type, progress.soundEnabled);
    },
    [progress.soundEnabled]
  );

  const commitUpdate = useCallback(
    (updater: (prev: UserProgress) => UserProgress) => {
      setProgress((prev) => {
        const oldRank = getRankInfo(prev.xp);
        const draft = updater(prev);
        const { next, newlyUnlocked } = checkAndApplyAchievements(draft);
        const newRank = getRankInfo(next.xp);
        saveProgress(next);

        if (newlyUnlocked.length > 0) {
          const first = newlyUnlocked[0];
          playSound('levelUp', next.soundEnabled);
          launchConfetti();
          showToast({
            id: `ach-${first.id}-${Date.now()}`,
            title: `Yangi yutuq: ${first.title}!`,
            subtitle: `+${first.xpBonus} XP · ${first.description}`,
            icon: first.icon,
          });
        } else if (newRank.level > oldRank.level) {
          playSound('levelUp', next.soundEnabled);
          launchConfetti();
          showToast({
            id: `rank-${newRank.level}-${Date.now()}`,
            title: `Yangi daraja: ${newRank.title}!`,
            subtitle: newRank.description,
            icon: '🌟',
          });
        }
        return next;
      });
    },
    [showToast]
  );

  const setProfile = useCallback(
    (name: string, avatar: string) => {
      commitUpdate((prev) => ({
        ...prev,
        name: name.trim() || 'Bilimdon',
        avatar,
        onboarded: true,
      }));
    },
    [commitUpdate]
  );

  const toggleTheme = useCallback(() => {
    setProgress((prev) => {
      const next: UserProgress = {
        ...prev,
        theme: prev.theme === 'light' ? 'dark' : 'light',
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((prev) => {
      const next: UserProgress = {
        ...prev,
        soundEnabled: !prev.soundEnabled,
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const addXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      commitUpdate((prev) => ({
        ...prev,
        xp: prev.xp + amount,
      }));
    },
    [commitUpdate]
  );

  const recordModuleSection = useCallback(
    (moduleId: number, sectionId: string) => {
      commitUpdate((prev) => {
        const current = prev.moduleCompletedSections[moduleId] ?? [];
        if (current.includes(sectionId)) return prev;
        return {
          ...prev,
          xp: prev.xp + 5,
          moduleCompletedSections: {
            ...prev.moduleCompletedSections,
            [moduleId]: [...current, sectionId],
          },
        };
      });
    },
    [commitUpdate]
  );

  const recordMiniTestResult = useCallback(
    (moduleId: number, score: number, total: number) => {
      const pct = Math.round((score / Math.max(1, total)) * 100);
      commitUpdate((prev) => {
        const oldBest = prev.moduleBestScores[moduleId] ?? 0;
        const earnedXp = score * 5 + (pct >= 70 && oldBest < 70 ? 40 : 0);
        return {
          ...prev,
          xp: prev.xp + earnedXp,
          moduleBestScores: {
            ...prev.moduleBestScores,
            [moduleId]: Math.max(oldBest, pct),
          },
        };
      });
    },
    [commitUpdate]
  );

  const saveHomeworkPartA = useCallback(
    (moduleId: number, score: number, total: number) => {
      const pct = Math.round((score / Math.max(1, total)) * 100);
      commitUpdate((prev) => {
        const existing = prev.homeworkCompleted[moduleId] ?? {
          partAScore: 0,
          partADone: false,
          partBDone: false,
          partCDone: false,
          writtenNotes: {},
        };
        const bonus = existing.partADone ? 0 : 25;
        return {
          ...prev,
          xp: prev.xp + bonus + score * 3,
          homeworkCompleted: {
            ...prev.homeworkCompleted,
            [moduleId]: {
              ...existing,
              partAScore: Math.max(existing.partAScore, pct),
              partADone: true,
            },
          },
        };
      });
    },
    [commitUpdate]
  );

  const saveHomeworkWritten = useCallback(
    (moduleId: number, part: 'B' | 'C', notes: Record<string, string>) => {
      commitUpdate((prev) => {
        const existing = prev.homeworkCompleted[moduleId] ?? {
          partAScore: 0,
          partADone: false,
          partBDone: false,
          partCDone: false,
          writtenNotes: {},
        };
        const alreadyDone =
          part === 'B' ? existing.partBDone : existing.partCDone;
        const bonus = alreadyDone ? 0 : part === 'B' ? 30 : 35;
        return {
          ...prev,
          xp: prev.xp + bonus,
          homeworkCompleted: {
            ...prev.homeworkCompleted,
            [moduleId]: {
              ...existing,
              partBDone: part === 'B' ? true : existing.partBDone,
              partCDone: part === 'C' ? true : existing.partCDone,
              writtenNotes: {
                ...existing.writtenNotes,
                ...notes,
              },
            },
          },
        };
      });
    },
    [commitUpdate]
  );

  const recordBbaAttempt = useCallback(
    (attempt: Omit<BbaAttempt, 'id' | 'date'>) => {
      commitUpdate((prev) => {
        const newAttempt: BbaAttempt = {
          ...attempt,
          id: `bba-${Date.now()}`,
          date: getTodayString(),
        };
        const earnedXp = attempt.score * 4 + (attempt.percentage >= 70 ? 35 : 10);
        return {
          ...prev,
          xp: prev.xp + earnedXp,
          bbaHistory: [newAttempt, ...prev.bbaHistory].slice(0, 30),
        };
      });
    },
    [commitUpdate]
  );

  const recordWrongQuestion = useCallback((q: QuizQuestion) => {
    setProgress((prev) => {
      const today = getTodayString();
      const existing = prev.wrongQuestions[q.id];
      const next: UserProgress = {
        ...prev,
        wrongQuestions: {
          ...prev.wrongQuestions,
          [q.id]: {
            question: q,
            wrongCount: (existing?.wrongCount ?? 0) + 1,
            streakCorrect: 0,
            nextReviewDate: today,
            lastReviewedDate: today,
          },
        },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const markSpacedReviewResult = useCallback(
    (questionId: string, correct: boolean) => {
      commitUpdate((prev) => {
        const record = prev.wrongQuestions[questionId];
        if (!record) return prev;
        const today = getTodayString();
        const copy = { ...prev.wrongQuestions };

        if (correct) {
          const nextStreak = record.streakCorrect + 1;
          if (nextStreak >= 3) {
            delete copy[questionId];
          } else {
            const days = nextStreak === 1 ? 1 : 3;
            copy[questionId] = {
              ...record,
              streakCorrect: nextStreak,
              lastReviewedDate: today,
              nextReviewDate: addDaysToDateString(today, days),
            };
          }
          return {
            ...prev,
            xp: prev.xp + 8,
            wrongQuestions: copy,
          };
        }

        copy[questionId] = {
          ...record,
          wrongCount: record.wrongCount + 1,
          streakCorrect: 0,
          lastReviewedDate: today,
          nextReviewDate: today,
        };
        return {
          ...prev,
          wrongQuestions: copy,
        };
      });
    },
    [commitUpdate]
  );

  const recordGameFinish = useCallback(
    (opts: {
      won: boolean;
      xp: number;
      blitzScore?: number;
      castleCleared?: boolean;
      isDuel?: boolean;
    }) => {
      commitUpdate((prev) => ({
        ...prev,
        xp: prev.xp + Math.max(0, opts.xp),
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + (opts.won ? 1 : 0),
        blitzBestScore: Math.max(prev.blitzBestScore, opts.blitzScore ?? 0),
        castleCleared: prev.castleCleared || Boolean(opts.castleCleared),
        duelsPlayed: prev.duelsPlayed + (opts.isDuel ? 1 : 0),
      }));
    },
    [commitUpdate]
  );

  const completeDailyChallenge = useCallback(
    (correctCount: number) => {
      const today = getTodayString();
      commitUpdate((prev) => {
        const alreadyToday = prev.dailyChallengeCompletedDate === today;
        const bonus = alreadyToday ? 0 : 40 + correctCount * 8;
        return {
          ...prev,
          xp: prev.xp + bonus,
          dailyChallengeCompletedDate: today,
        };
      });
    },
    [commitUpdate]
  );

  const toggleFavoriteModule = useCallback((moduleId: number) => {
    setProgress((prev) => {
      const exists = prev.favoriteModules.includes(moduleId);
      const nextFavs = exists
        ? prev.favoriteModules.filter((id) => id !== moduleId)
        : [...prev.favoriteModules, moduleId];
      const next = { ...prev, favoriteModules: nextFavs };
      saveProgress(next);
      return next;
    });
  }, []);

  const setLastRoute = useCallback((route: string) => {
    setProgress((prev) => {
      if (prev.lastRoute === route) return prev;
      const next = { ...prev, lastRoute: route };
      saveProgress(next);
      return next;
    });
  }, []);

  const exportProgressJson = useCallback(() => {
    return JSON.stringify(progress, null, 2);
  }, [progress]);

  const importProgressJson = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as Partial<UserProgress>;
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.xp !== 'number') {
        return {
          ok: false,
          error: 'Fayl formati noto‘g‘ri. SintaksisLand eksport faylini tanlang.',
        };
      }
      const next: UserProgress = {
        ...clearProgress(),
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
      saveProgress(next);
      setProgress(next);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'JSON faylni o‘qib bo‘lmadi. Iltimos, to‘g‘ri fayl yuklang.',
      };
    }
  }, []);

  const resetAllProgress = useCallback(() => {
    const fresh = clearProgress();
    setProgress(fresh);
  }, []);

  const rank = useMemo(() => getRankInfo(progress.xp), [progress.xp]);

  const dueReviews = useMemo(() => {
    const today = getTodayString();
    return Object.values(progress.wrongQuestions).filter(
      (rec) => rec.nextReviewDate <= today
    );
  }, [progress.wrongQuestions]);

  const value: ProgressContextValue = {
    progress,
    rank,
    dueReviews,
    toast,
    dismissToast,
    setProfile,
    toggleTheme,
    toggleSound,
    soundPlay,
    addXp,
    recordModuleSection,
    recordMiniTestResult,
    saveHomeworkPartA,
    saveHomeworkWritten,
    recordBbaAttempt,
    recordWrongQuestion,
    markSpacedReviewResult,
    recordGameFinish,
    completeDailyChallenge,
    toggleFavoriteModule,
    setLastRoute,
    exportProgressJson,
    importProgressJson,
    resetAllProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress faqat ProgressProvider ichida ishlatiladi');
  }
  return ctx;
}
