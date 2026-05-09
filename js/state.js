// ============================================
// STATE.JS — Central app state store
// Firebase-ready: swap mock data with real DB calls later
// ============================================

const AppState = {
  // Auth state — replace with Firebase Auth user object later
  user: null,
  isAuthenticated: false,

  // UI state
  currentSection: 'home',
  currentTheme: localStorage.getItem('qf-theme') || 'dark',

  // Settings — persisted to localStorage (later: Firestore user doc)
  settings: JSON.parse(localStorage.getItem('qf-settings') || JSON.stringify({
    darkMode: true,
    sound: true,
    timer: true,
    timerMode: 'bonus',
    notifications: { invites: true, leaderboard: false, streak: true }
  })),

  // Quiz gameplay state
  activeQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  timerInterval: null,
  timeLeft: 30,

  // Builder state
  builderQuiz: {
    title: '',
    category: '',
    difficulty: 'medium',
    description: '',
    time_limit: 30,
    visibility: 'public',
    questions: []
  },

  // Mock data — replace with Firestore queries later
  mockUser: {
    uid: 'mock-uid-001',
    username: 'Fiyebo Paul',
    handle: '@thatdesignboyy',
    email: 'fiyebo@example.com',
    avatar: 'FP',
    level: 12,
    xp: 2840,
    streak: 12,
    rank: 34,
    quizzesPlayed: 142,
    quizzesCreated: 18,
    avgScore: 78
  },

  mockQuizzes: [
    {
      id: 'q1', title: 'The Solar System', category: 'science',
      difficulty: 'easy', questions: 10, plays: 4820, emoji: '🪐',
      coverColor: 'linear-gradient(135deg,#6C63FF,#00D4FF)',
      author: 'CosmosQuiz', authorAvatar: 'CQ', rating: 4.8,
      tags: ['space', 'astronomy']
    },
    {
      id: 'q2', title: 'World War II Timeline', category: 'history',
      difficulty: 'medium', questions: 15, plays: 3210, emoji: '📜',
      coverColor: 'linear-gradient(135deg,#FF6B9D,#FFB830)',
      author: 'HistoryNerd', authorAvatar: 'HN', rating: 4.6,
      tags: ['ww2', 'history', 'europe']
    },
    {
      id: 'q3', title: 'JavaScript Fundamentals', category: 'tech',
      difficulty: 'medium', questions: 20, plays: 9100, emoji: '💻',
      coverColor: 'linear-gradient(135deg,#00E5A0,#00D4FF)',
      author: 'DevMaster', authorAvatar: 'DM', rating: 4.9,
      tags: ['coding', 'javascript', 'web']
    },
    {
      id: 'q4', title: 'Capital Cities of Africa', category: 'geography',
      difficulty: 'hard', questions: 12, plays: 2340, emoji: '🌍',
      coverColor: 'linear-gradient(135deg,#FFB830,#FF6B9D)',
      author: 'GeoWhiz', authorAvatar: 'GW', rating: 4.5,
      tags: ['africa', 'capitals', 'geography']
    },
    {
      id: 'q5', title: 'Marvel Universe Trivia', category: 'pop-culture',
      difficulty: 'easy', questions: 15, plays: 12400, emoji: '🦸',
      coverColor: 'linear-gradient(135deg,#FF4757,#6C63FF)',
      author: 'MarvelFan', authorAvatar: 'MF', rating: 4.7,
      tags: ['marvel', 'movies', 'comics']
    },
    {
      id: 'q6', title: 'Algebra Basics', category: 'math',
      difficulty: 'easy', questions: 10, plays: 5600, emoji: '➕',
      coverColor: 'linear-gradient(135deg,#6C63FF,#FF6B9D)',
      author: 'MathPro', authorAvatar: 'MP', rating: 4.4,
      tags: ['algebra', 'math', 'equations']
    }
  ],

  mockLeaderboard: [
    { rank: 1, username: 'AceQuizzer', avatar: 'AQ', xp: 18420, quizzes: 312, isCurrentUser: false },
    { rank: 2, username: 'BrainStorm99', avatar: 'BS', xp: 16800, quizzes: 287, isCurrentUser: false },
    { rank: 3, username: 'KnowledgeKing', avatar: 'KK', xp: 14950, quizzes: 241, isCurrentUser: false },
    { rank: 4, username: 'QuizWizard', avatar: 'QW', xp: 12300, quizzes: 198, isCurrentUser: false },
    { rank: 5, username: 'SmartAlec', avatar: 'SA', xp: 11200, quizzes: 176, isCurrentUser: false },
    { rank: 6, username: 'FactMaster', avatar: 'FM', xp: 9800, quizzes: 154, isCurrentUser: false },
    { rank: 7, username: 'TriviaKing', avatar: 'TK', xp: 8700, quizzes: 143, isCurrentUser: false },
    { rank: 34, username: 'Fiyebo Paul', avatar: 'FP', xp: 2840, quizzes: 142, isCurrentUser: true },
  ],

  mockAchievements: [
    { icon: '🚀', name: 'First Quiz', unlocked: true },
    { icon: '🔥', name: '7-Day Streak', unlocked: true },
    { icon: '🏆', name: 'Top 50', unlocked: true },
    { icon: '⚡', name: 'Speed Demon', unlocked: true },
    { icon: '🎯', name: 'Perfect Score', unlocked: true },
    { icon: '📚', name: '100 Quizzes', unlocked: true },
    { icon: '🌟', name: 'Creator', unlocked: false },
    { icon: '💎', name: 'Diamond', unlocked: false },
    { icon: '👑', name: 'Champion', unlocked: false },
    { icon: '🌍', name: 'Globetrotter', unlocked: false },
  ],

  mockActivity: [
    { icon: '🎯', text: 'Scored 90% on JavaScript Fundamentals', time: '2h ago', xp: '+180 XP' },
    { icon: '🔥', text: 'Maintained 12-day streak', time: '5h ago', xp: '+50 XP' },
    { icon: '🏆', text: 'Ranked #34 on weekly leaderboard', time: '1d ago', xp: '' },
    { icon: '✏️', text: 'Created quiz: CSS Grid Mastery', time: '2d ago', xp: '+100 XP' },
    { icon: '🎯', text: 'Scored 75% on World War II Timeline', time: '3d ago', xp: '+120 XP' },
  ],

  mockQuestions: [
    {
      id: 'qn1', text: 'What is the chemical formula for water?',
      options: ['H₃O', 'H₂O', 'HO₂', 'H₂O₂'], correct: 1
    },
    {
      id: 'qn2', text: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Earth', 'Mercury', 'Mars'], correct: 2
    },
    {
      id: 'qn3', text: 'What is the speed of light (approx)?',
      options: ['299,000 km/s', '199,792 km/s', '399,792 km/s', '299,792 km/s'], correct: 3
    },
    {
      id: 'qn4', text: 'Who wrote "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correct: 1
    },
    {
      id: 'qn5', text: 'What is 12 × 12?',
      options: ['132', '144', '124', '156'], correct: 1
    }
  ],

  // Persist settings to localStorage
  saveSettings() {
    localStorage.setItem('qf-settings', JSON.stringify(this.settings));
  }
};

// Make accessible globally
window.AppState = AppState;
