// ============================================
// QUIZ-UI.JS — Quiz cards, gameplay, builder
// ============================================
import { db } from "./firebase.js";

const QuizUI = {

  async loadQuizzes() {
    const { collection, getDocs } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );

    const snap = await getDocs(collection(db, "quizzes"));

    AppState.mockQuizzes = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    this.renderHomeQuizzes();
    this.renderExploreQuizzes();
  },

  init() {
    this.loadQuizzes();

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
        <div class="quiz-card-cover" style="background:${quiz.coverColor || '#333'};">
          <span style="position:relative;z-index:1;font-size:2.5rem;">${quiz.emoji || '🧠'}</span>
        </div>

        <div class="quiz-card-body">
          <div class="quiz-card-tags">
            <span class="badge badge-primary">${quiz.category || 'General'}</span>
            <span class="badge badge-${diffColors[quiz.difficulty] || 'primary'}">${quiz.difficulty || 'easy'}</span>
          </div>

          <div class="quiz-card-title">${quiz.title || 'Untitled Quiz'}</div>

          <div class="quiz-card-meta">
            <span class="quiz-card-meta-item">
              ${quiz.questions || 0} questions
            </span>
            <span class="quiz-card-meta-item">
              ${(quiz.plays ? (quiz.plays / 1000).toFixed(1) : 0)}k plays
            </span>
          </div>
        </div>

        <div class="quiz-card-footer">
          <div class="quiz-card-author">
            <div class="author-avatar">${quiz.authorAvatar || '👤'}</div>
            ${quiz.author || 'Anonymous'}
          </div>

          <button class="btn btn-primary btn-sm"
            onclick="event.stopPropagation();QuizUI.startQuiz('${quiz.id}')">
            Play
          </button>
        </div>
      </div>
    `;
  },

  renderHomeQuizzes() {
    const grid = document.getElementById('home-quiz-grid');
    if (!grid || !AppState.mockQuizzes) return;

    const recent = AppState.mockQuizzes.slice(0, 3);
    grid.innerHTML = recent.map(q => this.buildCard(q)).join('');
  },

  renderExploreQuizzes(quizzes = null) {
    const grid = document.getElementById('explore-quiz-grid');
    if (!grid || !AppState.mockQuizzes) return;

    const list = quizzes || AppState.mockQuizzes;

    grid.innerHTML = list.length
      ? list.map(q => this.buildCard(q)).join('')
      : `<div class="empty-state" style="grid-column:span 3;">
           <div class="empty-state-icon">🔍</div>
           <div class="empty-state-title">No quizzes found</div>
         </div>`;
  },

  initFilters() {
    document.getElementById('category-filters')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      document.querySelectorAll('#category-filters .filter-chip')
        .forEach(c => c.classList.remove('active'));

      chip.classList.add('active');

      const cat = chip.dataset.cat;

      const filtered = cat === 'all'
        ? AppState.mockQuizzes
        : AppState.mockQuizzes.filter(q => q.category === cat);

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
          (q.title || '').toLowerCase().includes(query) ||
          (q.category || '').toLowerCase().includes(query)
        );

        this.renderExploreQuizzes(filtered);
      }, 250);
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
    const questions = AppState.mockQuestions || [];

    if (index >= questions.length) {
      this.showResults();
      return;
    }

    const q = questions[index];

    document.getElementById('question-text').textContent = q.text;
    document.getElementById('options-grid').innerHTML =
      (q.options || []).map((opt, i) => `
        <button class="option-btn"
          onclick="QuizUI.selectOption(${i}, ${q.correct})">
          ${opt}
        </button>
      `).join('');
  },

  selectOption(selected, correct) {
    const isCorrect = selected === correct;

    AppState.userAnswers.push({ selected, correct, isCorrect });

    document.getElementById('answer-feedback').textContent =
      isCorrect ? "Correct!" : "Wrong!";

    document.getElementById('next-question-btn').disabled = false;
  },

  nextQuestion() {
    AppState.currentQuestionIndex++;

    if (AppState.currentQuestionIndex >= AppState.mockQuestions.length) {
      this.showResults();
    } else {
      this.renderQuestion(AppState.currentQuestionIndex);
    }
  },

  showResults() {
    const answers = AppState.userAnswers || [];
    const correct = answers.filter(a => a.isCorrect).length;

    alert(`Quiz complete! Score: ${correct}`);
  },

  initGameplay() {
    document.getElementById('next-question-btn')
      ?.addEventListener('click', () => this.nextQuestion());
  },

  // ── BUILDER (basic safe version) ──
  initBuilder() {
    document.getElementById('publish-quiz-btn')?.addEventListener('click', async () => {
      try {
        const title = document.getElementById('quiz-title')?.value || 'Untitled Quiz';

        const { collection, addDoc } = await import(
          "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
        );

        await addDoc(collection(db, "quizzes"), {
          title,
          createdAt: Date.now()
        });

        alert("Quiz published!");
      } catch (err) {
        console.error(err);
        alert("Error saving quiz");
      }
    });
  }

};

window.QuizUI = QuizUI;