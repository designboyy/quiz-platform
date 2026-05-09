// ============================================
// PROFILE-UI.JS — Profile page rendering
// ============================================

const ProfileUI = {
  init() {
    this.renderAchievements();
    this.renderActivity();
    this.bindEditProfile();
  },

  renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = AppState.mockAchievements.map(a => `
      <div class="achievement-badge ${a.unlocked ? '' : 'locked'}" title="${a.name}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
      </div>
    `).join('');
  },

  renderActivity() {
    const list = document.getElementById('activity-list');
    if (!list) return;
    list.innerHTML = AppState.mockActivity.map(item => `
      <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md) 0;border-bottom:1px solid var(--border-subtle);">
        <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${item.icon}</div>
        <div style="flex:1;">
          <div style="font-size:0.875rem;font-weight:500;">${item.text}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${item.time}</div>
        </div>
        ${item.xp ? `<span class="badge badge-success">${item.xp}</span>` : ''}
      </div>
    `).join('');
  },

  bindEditProfile() {
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      Toast.show('Profile editing will be wired to Firestore soon!', 'info');
    });
  }
};

window.ProfileUI = ProfileUI;
