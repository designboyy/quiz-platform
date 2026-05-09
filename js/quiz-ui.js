// ============================================
// QUIZ-UI.JS — FIXED VERSION
// ============================================

import { db } from "./firebase.js";

const QuizUI = {

  // =========================
  // LOAD QUIZZES
  // =========================
  async loadQuizzes() {
    try {
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

    } catch (err) {
      console.error("Load quizzes error:", err);
      AppState.mockQuizzes = [];
    }
  },

  // =========================
  // INIT
  // =========================
  init() {
    AppState.mockQuizzes = AppState.mockQuizzes || [];
    AppState.builderQuiz = {
      title: "",
      questions: []
    };

    this.loadQuizzes();
    this.renderHomeQuizzes();
    this.renderExploreQuizzes();
    this.initBuilder();
    this.initGameplay();
    this.initFilters();
    this.initSearch();
  },

  // =========================
  // CARD UI
  // =========================
  buildCard(quiz) {
    return `
      <div class="quiz-card" data-quiz-id="${quiz.id}"
        onclick="QuizUI.startQuiz('${quiz.id}')">

        <div class="quiz-card-cover" style="background:${quiz.coverColor || '#333'};">
          <span style="font-size:2.5rem;">${quiz.emoji || '🧠'}</span>
        </div>

        <div class="quiz-card-body">
          <div class="quiz-card-title">${quiz.title || 'Untitled Quiz'}</div>
          <div>${quiz.questions?.length || 0} questions</div>
        </div>

        <div class="quiz-card-footer">
          <button class="btn btn-primary btn-sm"
            onclick="event.stopPropagation();QuizUI.startQuiz('${quiz.id}')">
            Play
          </button>
        </div>

      </div>
    `;
  },

  renderHomeQuizzes() {
    const grid = document.getElementById("home-quiz-grid");
    if (!grid) return;

    grid.innerHTML = (AppState.mockQuizzes || [])
      .slice(0, 3)
      .map(q => this.buildCard(q))
      .join("");
  },

  renderExploreQuizzes(list = null) {
    const grid = document.getElementById("explore-quiz-grid");
    if (!grid) return;

    const quizzes = list || AppState.mockQuizzes || [];

    grid.innerHTML = quizzes.length
      ? quizzes.map(q => this.buildCard(q)).join("")
      : `<div>No quizzes found</div>`;
  },

  // =========================
  // FILTER + SEARCH
  // =========================
  initFilters() {
    document.getElementById("category-filters")?.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;

      const cat = chip.dataset.cat;

      const filtered = cat === "all"
        ? AppState.mockQuizzes
        : AppState.mockQuizzes.filter(q => q.category === cat);

      this.renderExploreQuizzes(filtered);
    });
  },

  initSearch() {
    const input = document.getElementById("quiz-search");
    if (!input) return;

    let debounce;

    input.addEventListener("input", () => {
      clearTimeout(debounce);

      debounce = setTimeout(() => {
        const q = input.value.toLowerCase();

        const filtered = AppState.mockQuizzes.filter(item =>
          (item.title || "").toLowerCase().includes(q)
        );

        this.renderExploreQuizzes(filtered);
      }, 200);
    });
  },

  // =========================
  // GAMEPLAY (SAFE VERSION)
  // =========================
  startQuiz(quizId) {
    const quiz = AppState.mockQuizzes.find(q => q.id === quizId);
    if (!quiz) return;

    AppState.activeQuiz = quiz;
    AppState.currentQuestionIndex = 0;
    AppState.userAnswers = [];

    AppState.mockQuestions = quiz.questions || [];

    this.renderQuestion(0);
    ModalManager.open("quiz-play-modal");
  },

  renderQuestion(index) {
    const questions = AppState.mockQuestions || [];

    if (!questions.length || index >= questions.length) {
      this.showResults();
      return;
    }

    const q = questions[index];

    document.getElementById("question-text").textContent = q.text || "";

    const grid = document.getElementById("options-grid");

    grid.innerHTML = (q.options || [])
      .map((opt, i) => `
        <button class="option-btn"
          onclick="QuizUI.selectOption(${i}, ${q.correct})">
          ${opt}
        </button>
      `).join("");
  },

  selectOption(selected, correct) {
    const isCorrect = selected === correct;

    AppState.userAnswers.push({ selected, correct, isCorrect });

    document.getElementById("answer-feedback").textContent =
      isCorrect ? "Correct!" : "Wrong!";

    document.getElementById("next-question-btn").disabled = false;
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
    const correct = AppState.userAnswers.filter(a => a.isCorrect).length;

    alert(`Quiz complete! Score: ${correct}`);
  },

  initGameplay() {
    document.getElementById("next-question-btn")
      ?.addEventListener("click", () => this.nextQuestion());
  },

  // =========================
  // BUILDER (FIXED CORE ISSUE)
  // =========================
  initBuilder() {

    // store builder state
    AppState.builderQuiz = {
      title: "",
      questions: []
    };

    // ADD QUESTION (IMPORTANT FIX)
    document.getElementById("add-question-btn")?.addEventListener("click", () => {
      const q = {
        text: "",
        options: ["", "", "", ""],
        correct: 0
      };

      AppState.builderQuiz.questions.push(q);

      alert("Question added (now stored in memory)");
    });

    // UPDATE TITLE
    document.getElementById("quiz-title")?.addEventListener("input", (e) => {
      AppState.builderQuiz.title = e.target.value;
    });

    // PUBLISH FIXED
    document.getElementById("publish-quiz-btn")?.addEventListener("click", async () => {
      try {
        const { collection, addDoc } = await import(
          "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
        );

        const payload = {
          title: AppState.builderQuiz.title || "Untitled Quiz",
          questions: AppState.builderQuiz.questions,
          createdAt: Date.now()
        };

        await addDoc(collection(db, "quizzes"), payload);

        alert("Quiz published successfully 🚀");

        // reset builder
        AppState.builderQuiz = { title: "", questions: [] };

      } catch (err) {
        console.error(err);
        alert("Failed to publish quiz");
      }
    });
  }

};

window.QuizUI = QuizUI;