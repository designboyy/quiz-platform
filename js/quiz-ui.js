import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, doc, getDoc, query,
  orderBy, limit, where, serverTimestamp, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const EMOJI_MAP = {
  science: '🔬', history: '📜', math: '➕', tech: '💻',
  geography: '🌍', 'pop-culture': '🎬', language: '🗣️', other: '🎯', general: '⚡'
};

const GRADIENT_MAP = {
  science: 'linear-gradient(135deg,#6C63FF,#00D4FF)',
  history: 'linear-gradient(135deg,#FF6B9D,#FFB830)',
  math: 'linear-gradient(135deg,#6C63FF,#FF6B9D)',
  tech: 'linear-gradient(135deg,#00E5A0,#00D4FF)',
  geography: 'linear-gradient(135deg,#FFB830,#FF6B9D)',
  'pop-culture': 'linear-gradient(135deg,#FF4757,#6C63FF)',
  language: 'linear-gradient(135deg,#00D4FF,#00E5A0)',
  other: 'linear-gradient(135deg,#6C63FF,#00E5A0)',
  general: 'linear-gradient(135deg,#6C63FF,#00D4FF)'
};

const QuizUI = {
  currentFilter: 'all',
  currentDifficulty: 'all',
  searchQuery: '',

  init() {
    this.loadQuizzes();
    this.initBuilder();
    this.initGameplay();
    this.initFilters();
    this.initSearch();
  },

  // =====================
  // LOAD FROM FIRESTORE
  // =====================
  async loadQuizzes() {
    const homeGrid = document.getElementById('home-quiz-grid');
    const exploreGrid = document.getElementById('explore-quiz-grid');
    if (homeGrid) homeGrid.innerHTML = this.loadingSkeletons(3);
    if (exploreGrid) exploreGrid.innerHTML = this.loadingSkeletons(6);

    try {
      const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      AppState.quizzes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.renderHomeQuizzes();
      this.renderExploreQuizzes();
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      if (homeGrid) homeGrid.innerHTML = this.emptyState('Could not load quizzes', '⚠️');
      if (exploreGrid) exploreGrid.innerHTML = this.emptyState('Could not load quizzes', '⚠️');
    }
  },

  loadingSkeletons(count) {
    return Array(count).fill(0).map(() => `
      <div class="quiz-card" style="animation:pulse 1.5s infinite;">
        <div style="height:80px;background:var(--bg-elevated);border-radius:var(--radius-md);margin-bottom:12px;"></div>
        <div style="height:16px;background:var(--bg-elevated);border-radius:4px;margin-bottom:8px;width:70%;"></div>
        <div style="height:12px;background:var(--bg-elevated);border-radius:4px;width:40%;"></div>
      </div>
    `).join('');
  },

  emptyState(message, icon = '📭') {
    return `
      <div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl);color:var(--text-muted);">
        <div style="font-size:2.5rem;margin-bottom:var(--space-md);">${icon}</div>
        <div style="font-size:0.9rem;">${message}</div>
      </div>
    `;
  },

  // =====================
  // QUIZ CARD BUILDER
  // =====================
  buildCard(quiz) {
    const emoji = quiz.emoji || EMOJI_MAP[quiz.category] || '⚡';
    const gradient = quiz.coverColor || GRADIENT_MAP[quiz.category] || GRADIENT_MAP.general;
    const qCount = Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questionCount || 0);
    const plays = quiz.plays || 0;
    const rating = quiz.rating ? quiz.rating.toFixed(1) : null;
    const diffClass = { easy: 'badge-success', medium: 'badge-cyan', hard: 'badge-warning' }[quiz.difficulty] || 'badge-cyan';
    const author = quiz.authorName || quiz.author || 'Anonymous';
    const authorAvatar = quiz.authorAvatar || author.substring(0, 2).toUpperCase();

    return `
      <div class="quiz-card" style="cursor:pointer;" onclick="QuizUI.openQuizDetail('${quiz.id}')">
        <div class="quiz-card-cover" style="background:${gradient};">
          <span style="font-size:2rem;">${emoji}</span>
          <div class="quiz-card-cover-overlay"></div>
        </div>
        <div class="quiz-card-body">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
            <span class="badge ${diffClass}" style="font-size:0.65rem;">${quiz.difficulty || 'medium'}</span>
            ${quiz.category ? `<span class="badge badge-ghost" style="font-size:0.65rem;">${quiz.category}</span>` : ''}
          </div>
          <div class="quiz-card-title">${quiz.title || 'Untitled Quiz'}</div>
          <div class="quiz-card-meta">
            <span>${qCount} questions</span>
            <span>·</span>
            <span>${plays.toLocaleString()} plays</span>
            ${rating ? `<span>·</span><span>⭐ ${rating}</span>` : ''}
          </div>
        </div>
        <div class="quiz-card-footer">
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="nav-avatar" style="width:22px;height:22px;font-size:0.6rem;">${authorAvatar}</div>
            <span style="font-size:0.75rem;color:var(--text-secondary);">${author}</span>
          </div>
          <button class="btn btn-primary btn-sm" style="padding:4px 12px;font-size:0.75rem;"
            onclick="event.stopPropagation();QuizUI.startQuiz('${quiz.id}')">
            Play
          </button>
        </div>
      </div>
    `;
  },

  renderHomeQuizzes() {
    const grid = document.getElementById('home-quiz-grid');
    if (!grid) return;
    const list = AppState.quizzes.slice(0, 3);
    if (!list.length) {
      grid.innerHTML = this.emptyState('No quizzes yet. Be the first to create one!', '🎯');
      return;
    }
    grid.innerHTML = list.map(q => this.buildCard(q)).join('');
  },

  renderExploreQuizzes() {
    const grid = document.getElementById('explore-quiz-grid');
    if (!grid) return;

    let list = [...AppState.quizzes];

    if (this.currentFilter !== 'all') {
      list = list.filter(q => q.category === this.currentFilter);
    }
    if (this.currentDifficulty !== 'all') {
      list = list.filter(q => q.difficulty === this.currentDifficulty);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(quiz =>
        (quiz.title || '').toLowerCase().includes(q) ||
        (quiz.category || '').toLowerCase().includes(q) ||
        (quiz.author || '').toLowerCase().includes(q) ||
        (quiz.description || '').toLowerCase().includes(q)
      );
    }

    if (!list.length) {
      grid.innerHTML = this.emptyState('No quizzes match your filters', '🔍');
      return;
    }
    grid.innerHTML = list.map(q => this.buildCard(q)).join('');
  },

  // =====================
  // FILTERS & SEARCH
  // =====================
  initFilters() {
    // Category filters
    document.querySelectorAll('[data-cat]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-cat]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilter = chip.dataset.cat;
        this.renderExploreQuizzes();
      });
    });

    // Difficulty filters
    document.querySelectorAll('[data-diff]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-diff]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentDifficulty = chip.dataset.diff;
        this.renderExploreQuizzes();
      });
    });
  },

  initSearch() {
    const input = document.getElementById('quiz-search');
    if (!input) return;
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.searchQuery = input.value.trim();
        this.renderExploreQuizzes();
      }, 250);
    });
  },

  // =====================
  // QUIZ DETAIL (play prompt)
  // =====================
  openQuizDetail(id) {
    const quiz = AppState.quizzes.find(q => q.id === id);
    if (!quiz) return;
    this.startQuiz(id);
  },

  // =====================
  // BUILDER
  // =====================
  initBuilder() {
    const addBtn = document.getElementById('add-question-btn');
    const publishBtn = document.getElementById('publish-quiz-btn');
    const titleInput = document.getElementById('quiz-title');
    const categorySelect = document.getElementById('quiz-category');
    const diffSelect = document.getElementById('quiz-difficulty');
    const descInput = document.getElementById('quiz-description');
    const timeLimitSelect = document.getElementById('quiz-time-limit');
    const visibilitySelect = document.getElementById('quiz-visibility');

    titleInput?.addEventListener('input', (e) => {
      AppState.builderQuiz.title = e.target.value;
      const preview = document.getElementById('builder-quiz-title-preview');
      if (preview) preview.textContent = e.target.value || 'Untitled Quiz';
    });

    categorySelect?.addEventListener('change', e => AppState.builderQuiz.category = e.target.value);
    diffSelect?.addEventListener('change', e => AppState.builderQuiz.difficulty = e.target.value);
    descInput?.addEventListener('input', e => AppState.builderQuiz.description = e.target.value);
    timeLimitSelect?.addEventListener('change', e => AppState.builderQuiz.time_limit = Number(e.target.value));
    visibilitySelect?.addEventListener('change', e => AppState.builderQuiz.visibility = e.target.value);

    addBtn?.addEventListener('click', () => {
      AppState.builderQuiz.questions.push({ text: '', options: ['', '', '', ''], correct: 0 });
      this.renderBuilderQuestions();
    });

    publishBtn?.addEventListener('click', () => this.publishQuiz());

    this.renderBuilderQuestions();
  },

  renderBuilderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;
    if (!AppState.builderQuiz.questions.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:var(--space-2xl);color:var(--text-muted);">
          <div style="font-size:2rem;margin-bottom:var(--space-md);">📝</div>
          <div>No questions yet. Click "Add Question" to get started.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.builderQuiz.questions.map((q, i) => `
      <div class="quiz-meta-card" style="margin-bottom:var(--space-lg);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">
          <span style="font-size:0.8rem;font-weight:700;color:var(--brand-primary);">Question ${i + 1}</span>
          <button class="btn btn-ghost btn-sm" style="color:var(--brand-danger);"
            onclick="QuizUI.removeQuestion(${i})">Remove</button>
        </div>
        <div class="form-group">
          <input class="form-input" placeholder="Enter your question here..."
            value="${this.escHtml(q.text)}"
            oninput="AppState.builderQuiz.questions[${i}].text = this.value" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);">
          ${q.options.map((opt, j) => `
            <div style="display:flex;align-items:center;gap:8px;">
              <input type="radio" name="correct_${i}" id="correct_${i}_${j}"
                ${q.correct === j ? 'checked' : ''}
                onchange="AppState.builderQuiz.questions[${i}].correct = ${j}" />
              <input class="form-input" style="flex:1;" placeholder="Option ${j + 1}"
                value="${this.escHtml(opt)}"
                oninput="AppState.builderQuiz.questions[${i}].options[${j}] = this.value" />
              <label for="correct_${i}_${j}" style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;">Correct?</label>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  removeQuestion(index) {
    AppState.builderQuiz.questions.splice(index, 1);
    this.renderBuilderQuestions();
  },

  async publishQuiz() {
    const quiz = AppState.builderQuiz;
    if (!quiz.title.trim()) {
      Toast.show('Please add a quiz title', 'warning');
      document.getElementById('quiz-title')?.focus();
      return;
    }
    if (!quiz.questions.length) {
      Toast.show('Add at least one question', 'warning');
      return;
    }
    const incomplete = quiz.questions.findIndex(q => !q.text.trim() || q.options.some(o => !o.trim()));
    if (incomplete !== -1) {
      Toast.show(`Question ${incomplete + 1} is incomplete`, 'warning');
      return;
    }

    const btn = document.getElementById('publish-quiz-btn');
    if (btn) { btn.textContent = 'Publishing...'; btn.disabled = true; }

    try {
      const user = AppState.user;
      const profile = AppState.userProfile;
      const quizData = {
        title: quiz.title,
        category: quiz.category || 'general',
        difficulty: quiz.difficulty || 'medium',
        description: quiz.description || '',
        time_limit: quiz.time_limit || 30,
        visibility: quiz.visibility || 'public',
        questions: quiz.questions,
        questionCount: quiz.questions.length,
        plays: 0,
        authorId: user?.uid || null,
        authorName: profile?.username || 'Anonymous',
        authorAvatar: profile?.avatar || '??',
        emoji: EMOJI_MAP[quiz.category] || '⚡',
        coverColor: GRADIENT_MAP[quiz.category] || GRADIENT_MAP.general,
        createdAt: serverTimestamp()
      };

      const ref = await addDoc(collection(db, 'quizzes'), quizData);

      // Increment user's quizzesCreated
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), { quizzesCreated: increment(1) });
      }

      Toast.show('Quiz published! 🚀', 'success');

      // Reset builder
      AppState.builderQuiz = { title: '', category: '', difficulty: 'medium', description: '', time_limit: 30, visibility: 'public', questions: [] };
      const titleInput = document.getElementById('quiz-title');
      if (titleInput) titleInput.value = '';
      const preview = document.getElementById('builder-quiz-title-preview');
      if (preview) preview.textContent = 'Untitled Quiz';
      this.renderBuilderQuestions();

      // Reload quizzes and navigate to explore
      await this.loadQuizzes();
      window.Navigation.switchSection('explore');
    } catch (err) {
      console.error('Publish failed:', err);
      Toast.show('Failed to publish quiz. Check your connection.', 'error');
    } finally {
      if (btn) { btn.textContent = 'Publish Quiz'; btn.disabled = false; }
    }
  },

  // =====================
  // GAMEPLAY
  // =====================
  async startQuiz(id) {
    if (!AppState.isAuthenticated) {
      Toast.show('Sign in to play quizzes', 'warning');
      window.Navigation.goToAuth('login');
      return;
    }

    let quiz = AppState.quizzes.find(q => q.id === id);

    // If not in cache, fetch from Firestore
    if (!quiz) {
      try {
        const snap = await getDoc(doc(db, 'quizzes', id));
        if (!snap.exists()) { Toast.show('Quiz not found', 'error'); return; }
        quiz = { id: snap.id, ...snap.data() };
      } catch (err) {
        Toast.show('Failed to load quiz', 'error');
        return;
      }
    }

    if (!quiz.questions || !quiz.questions.length) {
      Toast.show('This quiz has no questions yet', 'warning');
      return;
    }

    AppState.activeQuiz = quiz;
    AppState.activeQuizId = id;
    AppState.currentQuestionIndex = 0;
    AppState.userAnswers = [];
    AppState.timeLeft = quiz.time_limit || 30;

    this.renderQuestion(0);
    ModalManager.open('quiz-play-modal');
  },

  renderQuestion(index) {
    const quiz = AppState.activeQuiz;
    const questions = quiz.questions;
    const q = questions[index];
    if (!q) return;

    const total = questions.length;
    const current = index + 1;
    const pct = (current / total) * 100;

    // Progress
    const progressText = document.getElementById('modal-progress-text');
    if (progressText) progressText.textContent = `Question ${current} of ${total}`;
    const progressFill = document.getElementById('quiz-progress-fill');
    if (progressFill) progressFill.style.width = pct + '%';

    // Question text
    document.getElementById('question-label').textContent = `Question ${current}`;
    document.getElementById('question-text').textContent = q.text;

    // Clear feedback
    const feedback = document.getElementById('answer-feedback');
    if (feedback) feedback.textContent = '';

    // Disable next button
    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = index < total - 1 ? 'Next Question →' : 'See Results';
    }

    // Render options
    const grid = document.getElementById('options-grid');
    if (grid) {
      grid.innerHTML = (q.options || []).map((opt, idx) => `
        <button class="option-btn" onclick="QuizUI.selectOption(${idx})">
          <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
          <span class="option-text">${opt}</span>
        </button>
      `).join('');
    }

    // Start timer
    this.startTimer(quiz.time_limit || 30);
  },

  selectOption(selectedIndex) {
    // Prevent double-selection
    if (document.querySelector('.option-btn.correct, .option-btn.incorrect')) return;

    const quiz = AppState.activeQuiz;
    const q = quiz.questions[AppState.currentQuestionIndex];
    const isCorrect = selectedIndex === q.correct;

    // Stop timer
    this.stopTimer();

    // Record answer
    AppState.userAnswers.push({
      questionIndex: AppState.currentQuestionIndex,
      selected: selectedIndex,
      correct: q.correct,
      isCorrect
    });

    // Visual feedback on all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add('correct');
      else if (idx === selectedIndex && !isCorrect) btn.classList.add('incorrect');
    });

    const feedback = document.getElementById('answer-feedback');
    if (feedback) {
      feedback.textContent = isCorrect ? '✓ Correct!' : `✕ Correct answer: ${q.options[q.correct]}`;
      feedback.style.color = isCorrect ? 'var(--brand-success)' : 'var(--brand-danger)';
    }

    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) nextBtn.disabled = false;
  },

  startTimer(seconds) {
    this.stopTimer();
    AppState.timeLeft = seconds;
    const display = document.getElementById('timer-count');
    const timerEl = document.getElementById('modal-timer');

    if (display) display.textContent = seconds;

    AppState.timerInterval = setInterval(() => {
      AppState.timeLeft--;
      if (display) display.textContent = AppState.timeLeft;
      if (timerEl) {
        timerEl.classList.toggle('timer-warning', AppState.timeLeft <= 5);
      }
      if (AppState.timeLeft <= 0) {
        this.stopTimer();
        this.timeUp();
      }
    }, 1000);
  },

  stopTimer() {
    if (AppState.timerInterval) {
      clearInterval(AppState.timerInterval);
      AppState.timerInterval = null;
    }
  },

  timeUp() {
    const quiz = AppState.activeQuiz;
    const q = quiz.questions[AppState.currentQuestionIndex];

    // Auto-record as unanswered/wrong
    AppState.userAnswers.push({
      questionIndex: AppState.currentQuestionIndex,
      selected: -1,
      correct: q.correct,
      isCorrect: false
    });

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add('correct');
    });

    const feedback = document.getElementById('answer-feedback');
    if (feedback) {
      feedback.textContent = `⏰ Time's up! Answer: ${q.options[q.correct]}`;
      feedback.style.color = 'var(--brand-warning)';
    }

    const nextBtn = document.getElementById('next-question-btn');
    if (nextBtn) nextBtn.disabled = false;
  },

  initGameplay() {
    const nextBtn = document.getElementById('next-question-btn');
    nextBtn?.addEventListener('click', () => {
      const total = AppState.activeQuiz?.questions?.length || 0;
      const next = AppState.currentQuestionIndex + 1;
      if (next < total) {
        AppState.currentQuestionIndex = next;
        this.renderQuestion(next);
      } else {
        this.finishQuiz();
      }
    });

    document.getElementById('quiz-exit-btn')?.addEventListener('click', () => {
      this.stopTimer();
      ModalManager.close('quiz-play-modal');
    });

    document.getElementById('retry-btn')?.addEventListener('click', () => {
      ModalManager.close('result-modal');
      if (AppState.activeQuizId) {
        setTimeout(() => this.startQuiz(AppState.activeQuizId), 300);
      }
    });

    document.getElementById('back-to-explore-btn')?.addEventListener('click', () => {
      ModalManager.close('result-modal');
      window.Navigation.switchSection('explore');
    });
  },

  async finishQuiz() {
    this.stopTimer();
    ModalManager.close('quiz-play-modal');

    const answers = AppState.userAnswers;
    const total = AppState.activeQuiz.questions.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const incorrect = total - correct;
    const percentage = Math.round((correct / total) * 100);
    const xpEarned = correct * 20 + (percentage >= 80 ? 50 : percentage >= 60 ? 20 : 0);

    // Update result modal
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
    const title = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!';
    const subtitle = percentage >= 80 ? 'You crushed it!' : percentage >= 60 ? 'Solid effort' : 'You can do better next time';

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-subtitle').textContent = subtitle;
    document.getElementById('result-percentage').textContent = percentage + '%';
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-incorrect').textContent = incorrect;
    document.getElementById('result-xp').textContent = `+${xpEarned}`;

    ModalManager.open('result-modal');

    // Save result to Firestore
    await this.saveQuizResult(percentage, correct, total, xpEarned);
  },

  async saveQuizResult(percentage, correct, total, xpEarned) {
    const user = AppState.user;
    if (!user) return;

    try {
      // Save session
      await addDoc(collection(db, 'quiz_sessions'), {
        userId: user.uid,
        quizId: AppState.activeQuizId,
        quizTitle: AppState.activeQuiz.title,
        score: percentage,
        correct,
        total,
        xpEarned,
        answers: AppState.userAnswers,
        completedAt: serverTimestamp()
      });

      // Update user stats
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        quizzesPlayed: increment(1),
        xp: increment(xpEarned)
      });

      // Recalculate avgScore
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const newAvg = Math.round(((data.avgScore || 0) * (data.quizzesPlayed - 1) + percentage) / data.quizzesPlayed);
        await updateDoc(userRef, { avgScore: newAvg });
        AppState.userProfile = { ...data, avgScore: newAvg };
      }

      // Increment quiz play count
      await updateDoc(doc(db, 'quizzes', AppState.activeQuizId), {
        plays: increment(1)
      });

      // Update home stats
      if (window.DashboardUI) DashboardUI.loadStats();

    } catch (err) {
      console.error('Failed to save quiz result:', err);
    }
  }
};

window.QuizUI = QuizUI;
