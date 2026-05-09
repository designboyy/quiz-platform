import { db } from "./firebase.js";
import {
  collection, query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const LeaderboardUI = {
  currentPeriod: 'weekly',

  init() {
    this.bindPeriodFilters();
  },

  async loadLeaderboard() {
    const podiumEl = document.getElementById('leaderboard-podium');
    const tableEl = document.getElementById('leaderboard-table');
    if (podiumEl) podiumEl.innerHTML = `<div style="text-align:center;padding:var(--space-xl);color:var(--text-muted);">Loading...</div>`;
    if (tableEl) tableEl.innerHTML = `<div style="text-align:center;padding:var(--space-xl);color:var(--text-muted);">Loading...</div>`;

    try {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(20));
      const snap = await getDocs(q);
      const users = snap.docs.map((d, i) => ({
        rank: i + 1,
        uid: d.id,
        username: d.data().username || 'Unknown',
        avatar: d.data().avatar || '??',
        xp: d.data().xp || 0,
        quizzes: d.data().quizzesPlayed || 0,
        isCurrentUser: d.id === AppState.user?.uid
      }));

      AppState.leaderboardData = users;
      this.renderPodium(users);
      this.renderTable(users);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      if (tableEl) tableEl.innerHTML = `
        <div style="text-align:center;padding:var(--space-2xl);color:var(--text-muted);">
          <div style="font-size:2rem;margin-bottom:8px;">⚠️</div>
          <div>Could not load leaderboard</div>
        </div>`;
    }
  },

  renderPodium(users) {
    const el = document.getElementById('leaderboard-podium');
    if (!el) return;
    const top3 = users.slice(0, 3);
    if (top3.length < 3) {
      el.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--space-xl);">Not enough players yet. Start competing!</div>`;
      return;
    }
    // Reorder: 2nd, 1st, 3rd for visual podium
    const order = [top3[1], top3[0], top3[2]];
    const blockClasses = ['podium-block-2', 'podium-block-1', 'podium-block-3'];
    const positions = [2, 1, 3];
    const gradients = [
      'linear-gradient(135deg,#C0C0C0,#A0A0A0)',
      'linear-gradient(135deg,#FFD700,#FFA500)',
      'linear-gradient(135deg,#CD7F32,#A0522D)'
    ];

    el.innerHTML = order.map((user, i) => `
      <div class="podium-item ${user.isCurrentUser ? 'is-current-user' : ''}">
        <div class="podium-avatar-wrapper">
          ${positions[i] === 1 ? '<div class="podium-crown">👑</div>' : ''}
          <div class="podium-avatar" style="background:${gradients[i]};">${user.avatar}</div>
        </div>
        <div class="podium-name">${user.username}${user.isCurrentUser ? ' <span class="badge badge-primary" style="font-size:0.55rem;">You</span>' : ''}</div>
        <div class="podium-score">${user.xp.toLocaleString()} XP</div>
        <div class="podium-block ${blockClasses[i]}">${positions[i]}</div>
      </div>
    `).join('');
  },

  renderTable(users) {
    const el = document.getElementById('leaderboard-table');
    if (!el) return;
    if (!users.length) {
      el.innerHTML = `<div style="text-align:center;padding:var(--space-2xl);color:var(--text-muted);">No players yet. Be the first!</div>`;
      return;
    }

    el.innerHTML = users.map(user => `
      <div class="leaderboard-row ${user.isCurrentUser ? 'current-user' : ''}">
        <div class="leaderboard-rank ${user.rank <= 3 ? 'top-3' : ''}">
          ${user.rank <= 3 ? ['🥇','🥈','🥉'][user.rank - 1] : '#' + user.rank}
        </div>
        <div class="leaderboard-user">
          <div class="nav-avatar" style="width:36px;height:36px;font-size:0.78rem;">${user.avatar}</div>
          <div>
            <div class="leaderboard-username">
              ${user.username}
              ${user.isCurrentUser ? '<span class="badge badge-primary" style="font-size:0.6rem;margin-left:4px;">You</span>' : ''}
            </div>
            <div class="leaderboard-user-meta">${user.quizzes} quizzes completed</div>
          </div>
        </div>
        <div class="leaderboard-score">${user.xp.toLocaleString()} XP</div>
        <div class="leaderboard-quizzes">${user.quizzes} played</div>
      </div>
    `).join('');
  },

  bindPeriodFilters() {
    document.querySelectorAll('[data-period]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-period]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentPeriod = chip.dataset.period;
        this.loadLeaderboard();
      });
    });
  }
};

window.LeaderboardUI = LeaderboardUI;
