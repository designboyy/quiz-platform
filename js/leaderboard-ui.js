// ============================================
// LEADERBOARD-UI.JS — Leaderboard rendering
// ============================================

const LeaderboardUI = {
  init() {
    this.renderPodium();
    this.renderTable();
    this.bindPeriodFilters();
  },

  renderPodium() {
    const el = document.getElementById('leaderboard-podium');
    if (!el) return;
    const top3 = AppState.mockLeaderboard.slice(0, 3);
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
      <div class="podium-item">
        <div class="podium-avatar-wrapper">
          ${positions[i] === 1 ? '<div class="podium-crown">👑</div>' : ''}
          <div class="podium-avatar" style="background:${gradients[i]};">${user.avatar}</div>
        </div>
        <div class="podium-name">${user.username}</div>
        <div class="podium-score">${user.xp.toLocaleString()} XP</div>
        <div class="podium-block ${blockClasses[i]}">${positions[i]}</div>
      </div>
    `).join('');
  },

  renderTable(data = null) {
    const el = document.getElementById('leaderboard-table');
    if (!el) return;
    const list = data || AppState.mockLeaderboard;

    el.innerHTML = list.map(user => `
      <div class="leaderboard-row ${user.isCurrentUser ? 'current-user' : ''}">
        <div class="leaderboard-rank ${user.rank <= 3 ? 'top-3' : ''}">
          ${user.rank <= 3 ? ['🥇','🥈','🥉'][user.rank - 1] : '#' + user.rank}
        </div>
        <div class="leaderboard-user">
          <div class="nav-avatar" style="width:36px;height:36px;font-size:0.78rem;">${user.avatar}</div>
          <div>
            <div class="leaderboard-username">${user.username} ${user.isCurrentUser ? '<span class="badge badge-primary" style="font-size:0.6rem;">You</span>' : ''}</div>
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
        // TODO: fetch real data by period from Firestore
        Toast.show(`Showing ${chip.dataset.period} leaderboard`, 'info');
      });
    });
  }
};

window.LeaderboardUI = LeaderboardUI;
