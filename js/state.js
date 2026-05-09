// ============================================
// STATE.JS — Central app state store
// ============================================

const AppState = {
  user: null,
  isAuthenticated: false,
  currentSection: 'home',
  currentTheme: localStorage.getItem('qf-theme') || 'dark',

  settings: JSON.parse(localStorage.getItem('qf-settings') || JSON.stringify({
    darkMode: true,
    sound: true,
    timer: true,
    timerMode: 'bonus',
    notifications: { invites: true, leaderboard: false, streak: true }
  })),

  activeQuiz: null,
  activeQuizId: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  timerInterval: null,
  timeLeft: 30,

  quizzes: [],
  leaderboardData: [],

  builderQuiz: {
    title: '',
    category: '',
    difficulty: 'medium',
    description: '',
    time_limit: 30,
    visibility: 'public',
    questions: []
  },

  saveSettings() {
    localStorage.setItem('qf-settings', JSON.stringify(this.settings));
  }
};

window.AppState = AppState;
