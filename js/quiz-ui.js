// ============================================
// QUIZ-UI.JS — Quiz cards, gameplay, builder
// ============================================

const QuizUI = {
  init() {
    this.renderHomeQuizzes();
    this.renderExploreQuizzes();
    this.initBuilder();
    this.initGameplay();
    this.initFilters();
    this.initSearch();
  },

  // ── CARD RENDERER ──
  buildCard(quiz) {
    const diffColors = { easy: 'success', medium: 'warning', hard: 'danger' };
    return `
      <div class="quiz-card" data-quiz-id="${quiz.id}" onclick="QuizUI.startQuiz('${quiz.id}')">
        <div class="quiz-card-cover" style="background:${quiz.coverColor};">
          <span style="position:relative;z-index:1;font-size:2.5rem;">${quiz.emoji}</span>
        </div>
        <div class="quiz-card-body">
          <div class="quiz-card-tags">
            <span class="badge badge-primary">${quiz.category}</span>
            <span class="badge badge-${diffColors[quiz.difficulty]}">${quiz.difficulty}</span>
          </div>
          <div class="quiz-card-title">${quiz.title}</div>
          <div class="quiz-card-meta">
            <span class="quiz-card-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              ${quiz.questions} questions
            </span>
            <span class="quiz-card-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${(quiz.plays / 1000).toFixed(1)}k plays
            </span>
          </div>
        </div>
        <div class="quiz-card-footer">
          <div class="quiz-card-author">
            <div class="author-avatar">${quiz.authorAvatar}</div>
            ${quiz.author}
          </div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();QuizUI.startQuiz('${quiz.id}')">
            Play
          </button>
        </div>
      </div>
    `;
  },

  renderHomeQuizzes() {
    const grid = document.getElementById('home-quiz-grid');
    if (!grid) return;
    const recent = AppState.mockQuizzes.slice(0, 3);
    grid.innerHTML = recent.map(q => this.buildCard(q)).join('');
  },

  renderExploreQuizzes(quizzes = null) {
    const grid = document.getElementById('explore-quiz-grid');
    if (!grid) return;
    const list = quizzes || AppState.mockQuizzes;
    grid.innerHTML = list.length
      ? list.map(q => this.buildCard(q)).join('')
      : `<div class="empty-state" style="grid-column:span 3;">
           <div class="empty-state-icon">🔍</div>
           <div class="empty-state-title">No quizzes found</div>
           <div class="empty-state-desc">Try a different search or category</div>
         </div>`;
  },

  initFilters() {
    // Category filters
    document.getElementById('category-filters')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      document.querySelectorAll('#category-filters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      const filtered = cat === 'all' ? AppState.mockQuizzes : AppState.mockQuizzes.filter(q => q.category === cat);
      this.renderExploreQuizzes(filtered);
    });
  },

  initSearch() {
    const input = document.getElementById('quiz-search');
    if (!input) return;
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const query = input.value.toLowerCase().trim();
        const filtered = AppState.mockQuizzes.filter(q =>
          q.title.toLowerCase().includes(query) ||
          q.category.toLowerCase().includes(query) ||
          (q.tags || []).some(t => t.includes(query))
        );
        this.renderExploreQuizzes(filtered);
      }, 280);
    });
  },

  // ── GAMEPLAY ──
  startQuiz(quizId) {
    const quiz = AppState.mockQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    AppState.activeQuiz = quiz;
    AppState.currentQuestionIndex = 0;
    AppState.userAnswers = [];
    this.renderQuestion(0);
    ModalManager.open('quiz-play-modal');
  },

  renderQuestion(index) {
    const questions = AppState.mockQuestions;
    if (index >= questions.length) {
      this.showResults();
      return;
    }

    const q = questions[index];
    AppState.currentQuestionIndex = index;
    AppState.timeLeft = AppState.settings.timer ? 30 : 999;

    // Update header
    document.getElementById('modal-progress-text').textContent = `Question ${index + 1} of ${questions.length}`;
    document.getElementById('question-label').textContent = `Question ${index + 1}`;
    document.getElementById('question-text').textContent = q.text;

    // Progress bar
    const pct = ((index) / questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = pct + '%';

    // Options
    const grid = document.getElementById('options-grid');
    const letters = ['A', 'B', 'C', 'D'];
    grid.innerHTML = q.options.map((opt, i) => `
      <button class="option-btn" data-index="${i}" onclick="QuizUI.selectOption(${i}, ${q.correct})">
        <span class="option-letter">${letters[i]}</span>
        ${opt}
      </button>
    `).join('');

    // Reset footer
    const nextBtn = document.getElementById('next-question-btn');
    nextBtn.disabled = true;
    nextBtn.textContent = index === questions.length - 1 ? 'Finish Quiz →' : 'Next Question →';
    document.getElementById('answer-feedback').textContent = '';

    // Start timer
    this.startTimer();
  },

  selectOption(selectedIndex, correctIndex) {
    if (document.querySelector('.option-btn.selected, .option-btn.correct')) return; // already answered

    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = selectedIndex === correctIndex;

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correctIndex) btn.classList.add('correct');
      else if (i === selectedIndex && !isCorrect) btn.classList.add('incorrect');
    });

    buttons[selectedIndex].classList.add('selected');

    AppState.userAnswers.push({ selected: selectedIndex, correct: correctIndex, isCorrect });

    const feedback = document.getElementById('answer-feedback');
    feedback.textContent = isCorrect ? '✓ Correct!' : `✕ The answer was ${['A','B','C','D'][correctIndex]}`;
    feedback.style.color = isCorrect ? 'var(--brand-success)' : 'var(--brand-danger)';

    document.getElementById('next-question-btn').disabled = false;
    this.stopTimer();
  },

  startTimer() {
    this.stopTimer();
    if (!AppState.settings.timer) return;

    AppState.timeLeft = 30;
    const timerEl = document.getElementById('timer-count');
    const timerDisplay = document.getElementById('modal-timer');

    AppState.timerInterval = setInterval(() => {
      AppState.timeLeft--;
      if (timerEl) timerEl.textContent = AppState.timeLeft;

      timerDisplay?.classList.toggle('warning', AppState.timeLeft <= 15 && AppState.timeLeft > 8);
      timerDisplay?.classList.toggle('danger', AppState.timeLeft <= 8);

      if (AppState.timeLeft <= 0) {
        this.stopTimer();
        // Auto-move if time runs out
        const q = AppState.mockQuestions[AppState.currentQuestionIndex];
        this.selectOption(-1, q.correct); // force wrong
        setTimeout(() => this.nextQuestion(), 1000);
      }
    }, 1000);
  },

  stopTimer() {
    if (AppState.timerInterval) {
      clearInterval(AppState.timerInterval);
      AppState.timerInterval = null;
    }
    document.getElementById('modal-timer')?.classList.remove('warning', 'danger');
  },

  nextQuestion() {
    const next = AppState.currentQuestionIndex + 1;
    if (next >= AppState.mockQuestions.length) {
      this.showResults();
    } else {
      this.renderQuestion(next);
    }
  },

  showResults() {
    this.stopTimer();
    ModalManager.close('quiz-play-modal');

    const answers = AppState.userAnswers;
    const correct = answers.filter(a => a.isCorrect).length;
    const total = AppState.mockQuestions.length;
    const pct = Math.round((correct / total) * 100);
    const xp = correct * 30 + (pct >= 80 ? 60 : 0);

    const emojis = { 100: '🏆', 80: '🎉', 60: '😊', 0: '💪' };
    const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '😊' : '💪';
    const titles = { 100: 'Perfect Score!', 80: 'Excellent Work!', 60: 'Good Job!', 0: 'Keep Practicing!' };
    const title = pct === 100 ? 'Perfect Score!' : pct >= 80 ? 'Excellent Work!' : pct >= 60 ? 'Good Job!' : 'Keep Practicing!';

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-subtitle').textContent = `You completed: ${AppState.activeQuiz?.title || 'the quiz'}`;
    document.getElementById('result-percentage').textContent = pct + '%';
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-incorrect').textContent = total - correct;
    document.getElementById('result-xp').textContent = '+' + xp;

    ModalManager.open('result-modal');

    Toast.show(`Quiz complete! You earned +${xp} XP`, 'success');
  },

  initGameplay() {
    document.getElementById('next-question-btn')?.addEventListener('click', () => this.nextQuestion());
    document.getElementById('quiz-exit-btn')?.addEventListener('click', () => {
      this.stopTimer();
      ModalManager.close('quiz-play-modal');
    });
    document.getElementById('retry-btn')?.addEventListener('click', () => {
      ModalManager.close('result-modal');
      if (AppState.activeQuiz) this.startQuiz(AppState.activeQuiz.id);
    });
    document.getElementById('back-to-explore-btn')?.addEventListener('click', () => {
      ModalManager.close('result-modal');
      window.navigateTo('explore');
    });
  },

  // ── BUILDER ──
  initBuilder() {
    document.getElementById('add-question-btn')?.addEventListener('click', () => this.addQuestion());
    document.getElementById('quiz-title')?.addEventListener('input', (e) => {
      const preview = document.getElementById('builder-quiz-title-preview');
      if (preview) preview.textContent = e.target.value || 'Untitled Quiz';
      AppState.builderQuiz.title = e.target.value;
    });
    document.getElementById('publish-quiz-btn')?.addEventListener('click', () => {
      Toast.show('Quiz published! (Firebase will save this to Firestore)', 'success');
    });

    // Add initial question
    this.addQuestion();
  },

  questionCount: 0,

  addQuestion() {
    this.questionCount++;
    const count = this.questionCount;
    const container = document.getElementById('questions-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'question-item scale-in';
    div.id = `question-item-${count}`;
    div.dataset.questionId = count;
    div.innerHTML = `
      <div class="question-item-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="question-number-badge">${count}</span>
          <span style="font-size:0.875rem;font-weight:600;color:var(--text-secondary);">Multiple Choice</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-icon-sm btn-ghost" title="Duplicate" onclick="QuizUI.duplicateQuestion(${count})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="btn btn-icon-sm btn-ghost" title="Delete" style="color:var(--brand-danger);" onclick="QuizUI.removeQuestion(${count})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--space-md);">
        <label class="form-label">Question ${count}</label>
        <textarea class="form-input" rows="2" placeholder="Type your question here..." style="resize:vertical;" data-field="question_text"></textarea>
      </div>

      <div class="answer-options-grid" data-question="${count}">
        ${['A','B','C','D'].map((letter, i) => `
          <div class="answer-option-input" id="opt-${count}-${i}">
            <span class="answer-letter-badge">${letter}</span>
            <input type="text" placeholder="Option ${letter}" data-option="${i}" />
            <button class="btn btn-icon-sm btn-ghost" title="Mark as correct" onclick="QuizUI.setCorrectAnswer(${count}, ${i})" style="padding:0;width:24px;height:24px;flex-shrink:0;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:var(--space-md);font-size:0.78rem;color:var(--text-muted);" id="correct-label-${count}">
        Click the ✓ button next to the correct answer option
      </div>
    `;
    container.appendChild(div);
    AppState.builderQuiz.questions.push({ id: count, text: '', options: ['','','',''], correct: null });
  },

  setCorrectAnswer(questionId, optionIndex) {
    const wrapper = document.querySelector(`.answer-options-grid[data-question="${questionId}"]`);
    if (!wrapper) return;
    wrapper.querySelectorAll('.answer-option-input').forEach((opt, i) => {
      opt.classList.toggle('correct-answer', i === optionIndex);
    });
    const label = document.getElementById(`correct-label-${questionId}`);
    if (label) {
      label.textContent = `✓ Option ${['A','B','C','D'][optionIndex]} marked as correct`;
      label.style.color = 'var(--brand-success)';
    }
    const q = AppState.builderQuiz.questions.find(q => q.id === questionId);
    if (q) q.correct = optionIndex;
  },

  removeQuestion(questionId) {
    const el = document.getElementById(`question-item-${questionId}`);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.95)';
      el.style.transition = '0.2s ease';
      setTimeout(() => el.remove(), 200);
    }
    AppState.builderQuiz.questions = AppState.builderQuiz.questions.filter(q => q.id !== questionId);
  },

  duplicateQuestion(questionId) {
    this.addQuestion();
    Toast.show('Question duplicated', 'info');
  }
};

window.QuizUI = QuizUI;
