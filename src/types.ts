export interface Book {
  id: string;
  title: string;
  author: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  levelName: string;
  coverUrl: string;
  percentageCompleted: number;
  pagesLeft: number;
  totalPages: number;
  currentPage: number;
  chapters: Chapter[];
  statsWords: number;
  statsTime: string;
  isFavorited?: boolean;
  isCompleted?: boolean;
  isStarted?: boolean;
  titleTr?: string;
}

export interface Chapter {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  id: string;
  textEn: string;
  textTr: string;
  words: {
    en: string;
    tr: string;
  }[];
}

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  level: string;
  notes?: string;
  exampleEn?: string;
  exampleTr?: string;
  savedAt: string;
}

export interface QuizQuestion {
  id: string;
  word: string;
  level: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  qType?: 'en_to_tr' | 'tr_to_en' | 'fill_blank';
  questionText?: string;
  translation?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  rank: number;
  isCurrentUser?: boolean;
  avatarUrl: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  learnedWordsCount: number;
  completedBooksCount: number;
  dailyStreak: number;
  totalTimeMinutes: number;
  readingGoalPercent: number;
  wordGoalPercent: number;
  timeGoalPercent: number;
  hearts: number; // 0 to 5 or -1 if premium (Infinity)
  isPremium: boolean;
  premiumExpiryDate?: string | null;
  premiumType?: 'monthly' | 'yearly' | null;
  weeklyWords?: number[]; // [Pzt, Sal, Car, Per, Cum, Cmt, Paz]
  weeklyMins?: number[];  // [Pzt, Sal, Car, Per, Cum, Cmt, Paz]
  lastActiveDate?: string; // YYYY-MM-DD format
  dailyQuizzesSolvedCount?: number;
  dailyQuizzesScoreSum?: number;
  dailyQuizzesQuestionsSum?: number;
}

export const getLevelColor = (level?: string): string => {
  const clean = (level || 'A1').toUpperCase().trim();
  if (clean.startsWith('A1')) return '#22C55E'; // Emerald Green
  if (clean.startsWith('A2')) return '#06B6D4'; // Teal/Cyan
  if (clean.startsWith('B1')) return '#EAB308'; // Amber/Yellow
  if (clean.startsWith('B2')) return '#F97316'; // Orange
  if (clean.startsWith('C1')) return '#EF4444'; // Red
  if (clean.startsWith('C2')) return '#B91C1C'; // Dark Crimson
  return '#6B7280'; // Gray fallback
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

