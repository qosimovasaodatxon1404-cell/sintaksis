export type SyntaxRole =
  | 'ega'
  | 'kesim'
  | 'toldiruvchi'
  | 'aniqlovchi'
  | 'hol'
  | 'other';

export type Difficulty = 'oson' | 'orta' | 'qiyin';

export interface SentenceToken {
  text: string;
  role: SyntaxRole;
  question?: string;
  note?: string;
}

export interface ModuleRule {
  id: string;
  title: string;
  summary: string;
  details: string[];
  formula?: string;
  accentRole?: SyntaxRole;
}

export interface ModuleExample {
  id: string;
  sentence: string;
  source: string;
  schema: string;
  explanation: string;
  tokens: SentenceToken[];
}

export interface CommonMistake {
  wrong: string;
  correct: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  passage?: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface WrittenHomeworkTask {
  id: string;
  prompt: string;
  hint: string;
  sampleAnswer: string;
  checklist: string[];
}

export interface ModuleHomework {
  partA: QuizQuestion[]; // 5 ta test savoli
  partB: WrittenHomeworkTask[]; // 3 ta yozma topshiriq
  partC: WrittenHomeworkTask; // 1 ta ijodiy topshiriq
}

export interface ModuleGameRef {
  gameType: GameId;
  title: string;
  description: string;
  itemIds?: string[];
}

export interface ModuleSummary {
  keyTakeaways: string[];
  formulaTable: { term: string; question: string; example: string }[];
  examTip: string;
}

export interface SyntaxModule {
  id: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: string;
  estimatedMinutes: number;
  intro: {
    story: string;
    question: string;
    hookAnswer: string;
  };
  rules: ModuleRule[];
  examples: ModuleExample[];
  commonMistakes: CommonMistake[];
  memoryKey: {
    title: string;
    mnemonic: string;
    tip: string;
  };
  games: [ModuleGameRef, ModuleGameRef];
  miniTest: QuizQuestion[];
  homework: ModuleHomework;
  summary: ModuleSummary;
}

export type GameId =
  | 'gap_quruvchi'
  | 'bolak_ovchisi'
  | 'tinish_ustaxonasi'
  | 'juftini_top'
  | 'xatoni_top'
  | 'blits_bellashuv'
  | 'ergash_detektivi'
  | 'kochirma_ozlashtirma'
  | 'sintaksis_qalasi';

export interface SentenceBuilderItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  words: string[];
  correctSentence: string;
  hint: string;
  explanation: string;
}

export interface PartHunterItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  tokens: SentenceToken[];
  explanation: string;
}

export interface PunctuationSlotItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  /** Segments separated by slots where punctuation can be placed. length = slots + 1 */
  segments: string[];
  /** Correct punctuation for each slot (use '' for no punctuation) */
  correctMarks: string[];
  availableMarks: string[];
  explanation: string;
}

export interface PairMatchItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  pairs: { left: string; right: string; relation: string }[];
}

export interface ErrorFinderItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  segments: string[];
  errorIndex: number;
  options: [string, string, string];
  correctReplacement: string;
  explanation: string;
}

export interface ClauseDetectiveItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  sentence: string;
  subordinateClause: string;
  options: [string, string, string, string];
  correctType: string;
  explanation: string;
}

export interface DirectIndirectItem {
  id: string;
  moduleId: number;
  difficulty: Difficulty;
  directSentence: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface CastleFloor {
  floor: number;
  title: string;
  guardian: string;
  description: string;
  questions: QuizQuestion[];
}

export interface BbaVariant {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  letter: string;
  category: string;
  definition: string;
  example: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  category: 'boshlanish' | 'modul' | 'oyin' | 'imtihon' | 'intizom';
}

export interface BbaAttempt {
  id: string;
  variantId: number;
  variantTitle: string;
  mode: 'mashq' | 'imtihon' | 'xatolar';
  score: number;
  total: number;
  percentage: number;
  date: string;
  weakModules: number[];
}

export interface WrongQuestionRecord {
  question: QuizQuestion;
  wrongCount: number;
  streakCorrect: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedDate: string;
}

export interface UserProgress {
  name: string;
  avatar: string;
  onboarded: boolean;
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyChallengeCompletedDate: string;
  moduleBestScores: Record<number, number>; // moduleId -> percentage (0-100)
  moduleCompletedSections: Record<number, string[]>;
  homeworkCompleted: Record<number, {
    partAScore: number;
    partADone: boolean;
    partBDone: boolean;
    partCDone: boolean;
    writtenNotes: Record<string, string>;
  }>;
  bbaHistory: BbaAttempt[];
  wrongQuestions: Record<string, WrongQuestionRecord>;
  unlockedAchievements: string[];
  favoriteModules: number[];
  lastRoute: string;
  gamesPlayed: number;
  gamesWon: number;
  blitzBestScore: number;
  castleCleared: boolean;
  duelsPlayed: number;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
}
