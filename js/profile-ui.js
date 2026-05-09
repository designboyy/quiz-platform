import { db } from "./firebase.js";
import {
  doc, getDoc, collection, query, where, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ProfileUI = {
  init() {
    this.bindEditProfile();
  },

  async loadProfile() {
    const user = AppState.user;
    if (!user) return;

    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        AppState.userProfile = snap.data();
        this.renderProfile(snap.data());
      }
      await this.loadRecentActivity(user.uid);
      this.renderAchievements(snap.data());
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  },

  renderProfile(profile) {
    if (!profile) return;
    const username = profile.username || 'User';
    const avatar = profile.avatar || username.substring(0, 2).toUpperCase();

    document.getElementById('profile-avatar').textContent = avatar;
    document.getElementById('profile-name').textContent = username;
    document.getElementById('profile-handle').textContent = `@${username.toLowerCase().replace(/\s+/g, '')}`;

    // Stats
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // Stats row
    const statsRow = document.querySelector('#section-profile .profile-stats-row');
    if (statsRow) {
      const vals = statsRow.querySelectorAll('.profile-stat-val');
      if (vals[0]) vals[0].textContent = (profile.quizzesPlayed || 0).toLocaleString();
      if (vals[1]) vals[1].textContent = (profile.quizzesCreated || 0).toLocaleString();
      if (vals[2]) vals[2].textContent = (profile.xp || 0).toLocaleString();
      if (vals[3]) vals[3].textContent = (profile.avgScore || 0) + '%';
    }

    // Badges
    const badgesContainer = document.querySelector('#section-profile .profile-header-card .profile-info > div:nth-child(3)');
    if (badgesContainer) {
      const level = profile.level || 1;
      const streak = profile.streak || 0;
      const xp = profile.xp || 0;
      badgesContainer.innerHTML = `
        <span class="badge badge-primary">⚡ Level ${level}</span>
        ${streak > 0 ? `<span class="badge badge-cyan">🔥 ${streak}-Day Streak</span>` : ''}
        ${xp >= 10000 ? `<span class="badge badge-success">🏆 Top Creator</span>` : ''}
      `;
    }

    // Update sidebar too
    AuthUI.updateUserUI();
  },

  renderAchievements(profile) {
    const grid = document.getElementById('achievements-grid');
    if (!grid || !profile) return;

    const xp = profile.xp || 0;
    const played = profile.quizzesPlayed || 0;
    const created = profile.quizzesCreated || 0;
    const streak = profile.streak || 0;

    const achievements = [
      { icon: '🚀', name: 'First Quiz', unlocked: played >= 1, desc: 'Play your first quiz' },
      { icon: '🔥', name: '7-Day Streak', unlocked: streak >= 7, desc: 'Maintain a 7-day streak' },
      { icon: '🏆', name: 'Top 50', unlocked: (profile.rank || 999) <= 50, desc: 'Reach top 50 on leaderboard' },
      { icon: '⚡', name: 'Speed Demon', unlocked: played >= 20, desc: 'Play 20 quizzes' },
      { icon: '🎯', name: 'Perfect Score', unlocked: (profile.bestScore || 0) >= 100, desc: 'Get 100% on a quiz' },
      { icon: '📚', name: '100 Quizzes', unlocked: played >= 100, desc: 'Play 100 quizzes' },
      { icon: '🌟', name: 'Creator', unlocked: created >= 1, desc: 'Create your first quiz' },
      { icon: '💎', name: 'Diamond', unlocked: xp >= 10000, desc: 'Earn 10,000 XP' },
      { icon: '👑', name: 'Champion', unlocked: (profile.rank || 999) <= 10, desc: 'Reach top 10 globally' },
      { icon: '🌍', name: 'Globetrotter', unlocked: played >= 50, desc: 'Play 50 quizzes' },
    ];

    grid.innerHTML = achievements.map(a => `
      <div class="achievement-badge ${a.unlocked ? '' : 'locked'}" title="${a.desc}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
      </div>
    `).join('');
  },

  async loadRecentActivity(uid) {
    const list = document.getElementById('activity-list');
    if (!list) return;

    try {
      const q = query(
        collection(db, 'quiz_sessions'),
        where('userId', '==', uid),
        orderBy('completedAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        list.innerHTML = `<div style="text-align:center;padding:var(--space-xl);color:var(--text-muted);">No activity yet. Play a quiz to get started!</div>`;
        return;
      }

      list.innerHTML = snap.docs.map(d => {
        const data = d.data();
        const score = data.score || 0;
        const icon = score >= 80 ? '🎯' : score >= 60 ? '📝' : '💪';
        const time = data.completedAt?.toDate ? this.timeAgo(data.completedAt.toDate()) : 'recently';
        return `
          <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md) 0;border-bottom:1px solid var(--border-subtle);">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${icon}</div>
            <div style="flex:1;">
              <div style="font-size:0.875rem;font-weight:500;">Scored ${score}% on ${data.quizTitle || 'a quiz'}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${time}</div>
            </div>
            ${data.xpEarned ? `<span class="badge badge-success">+${data.xpEarned} XP</span>` : ''}
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('Failed to load activity:', err);
      list.innerHTML = `<div style="text-align:center;padding:var(--space-xl);color:var(--text-muted);">Could not load activity</div>`;
    }
  },

  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  },

  bindEditProfile() {
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      Toast.show('Profile editing coming soon!', 'info');
    });
  }
};

window.ProfileUI = ProfileUI;
