import { db } from "./firebase.js";

const QuizUI = {

  // =====================
  // INIT
  // =====================
  init() {
    this.loadQuizzes();
    this.initBuilder();
    this.initGameplay();
    this.initFilters();
    this.initSearch();
  },

  // =====================
  // LOAD QUIZZES
  // =====================
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

  // =====================
  // CARD UI
  // =====================
  buildCard(quiz) {
    return `
      <div class="quiz-card" onclick="QuizUI.startQuiz('${quiz.id}')">
        <div class="quiz-card-title">${quiz.title}</div>
        <div>${quiz.category || 'General'}</div>
        <div>${quiz.questions?.length || 0} questions</div>
        <button onclick="event.stopPropagation();QuizUI.startQuiz('${quiz.id}')">
          Play
        </button>
      </div>
    `;
  },

  renderHomeQuizzes() {
    const grid = document.getElementById('home-quiz-grid');
    if (!grid || !AppState.mockQuizzes) return;
    grid.innerHTML = AppState.mockQuizzes.slice(0, 3).map(q => this.buildCard(q)).join('');
  },

  renderExploreQuizzes(quizzes = null) {
    const grid = document.getElementById('explore-quiz-grid');
    if (!grid || !AppState.mockQuizzes) return;

    const list = quizzes || AppState.mockQuizzes;
    grid.innerHTML = list.map(q => this.buildCard(q)).join('');
  },

  // =====================
  // BUILDER INIT
  // =====================
  initBuilder() {

    const addBtn = document.getElementById('add-question-btn');
    const publishBtn = document.getElementById('publish-quiz-btn');
    const titleInput = document.getElementById('quiz-title');

    // TITLE SYNC
    titleInput?.addEventListener('input', (e) => {
      AppState.builderQuiz.title = e.target.value;
      const preview = document.getElementById('builder-quiz-title-preview');
      if (preview) preview.textContent = e.target.value || "Untitled Quiz";
    });

    // ADD QUESTION FIX
    addBtn?.addEventListener('click', () => {
      AppState.builderQuiz.questions.push({
        text: "",
        options: ["", "", "", ""],
        correct: 0
      });

      this.renderBuilderQuestions();
    });

    // PUBLISH FIX
    publishBtn?.addEventListener('click', async () => {
      try {

        const { collection, addDoc } = await import(
          "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
        );

        const quizData = {
          title: AppState.builderQuiz.title || "Untitled Quiz",
          category: AppState.builderQuiz.category || "general",
          difficulty: AppState.builderQuiz.difficulty || "medium",
          questions: AppState.builderQuiz.questions,
          createdAt: Date.now()
        };

        if (!quizData.questions.length) {
          alert("Add at least one question!");
          return;
        }

        await addDoc(collection(db, "quizzes"), quizData);

        alert("Quiz Published 🚀");

        // RESET
        AppState.builderQuiz.questions = [];
        AppState.builderQuiz.title = "";

        this.renderBuilderQuestions();

        document.getElementById('questions-container').innerHTML = "";

      } catch (err) {
        console.error(err);
        alert("Failed to publish quiz");
      }
    });

    this.renderBuilderQuestions();
  },

  // =====================
  // 🔥 NEW FUNCTION (FIXED UI RENDER)
  // =====================
  renderBuilderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;

    container.innerHTML = AppState.builderQuiz.questions.map((q, i) => `
      <div class="question-box">

        <input 
          placeholder="Enter question"
          value="${q.text}"
          oninput="AppState.builderQuiz.questions[${i}].text = this.value"
        />

        ${q.options.map((opt, j) => `
          <div>
            <input
              placeholder="Option ${j + 1}"
              value="${opt}"
              oninput="AppState.builderQuiz.questions[${i}].options[${j}] = this.value"
            />
            <button onclick="AppState.builderQuiz.questions[${i}].correct = ${j}">
              ✔
            </button>
          </div>
        `).join('')}

      </div>
    `).join('');
  },

  // =====================
  // GAMEPLAY
  // =====================
  startQuiz(id) {
    const quiz = AppState.mockQuizzes.find(q => q.id === id);
    if (!quiz) return;

    AppState.activeQuiz = quiz;
    AppState.mockQuestions = quiz.questions || [];

    AppState.currentQuestionIndex = 0;
    AppState.userAnswers = [];

    this.renderQuestion(0);
  },

  renderQuestion(i) {
    const q = AppState.mockQuestions[i];
    if (!q) return;

    document.getElementById('question-text').textContent = q.text;

    document.getElementById('options-grid').innerHTML =
      q.options.map((opt, idx) => `
        <button onclick="QuizUI.selectOption(${idx}, ${q.correct})">
          ${opt}
        </button>
      `).join('');
  },

  selectOption(selected, correct) {
    const isCorrect = selected === correct;
    AppState.userAnswers.push({ selected, correct, isCorrect });
  },

  initGameplay() {
    document.getElementById('next-question-btn')
      ?.addEventListener('click', () => {
        AppState.currentQuestionIndex++;
        this.renderQuestion(AppState.currentQuestionIndex);
      });
  },

  initFilters() {},
  initSearch() {}

};

window.QuizUI = QuizUI;

export default QuizUI;