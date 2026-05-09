import { db } from "./firebase.js";
import {
  doc, getDoc, collection, query, where, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const DashboardUI = {
  async loadStats() {
    const user = AppState.user;
    if (!user) return;

    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) return;
      const profile = snap.data();
      AppState.userProfile = profile;

      // Update stat cards
      this.updateStatCard(0, (profile.quizzesPlayed || 0).toLocaleString());
      this.updateStatCard(1, (profile.xp || 0).toLocaleString());
      this.updateStatCard(2, profile.rank ? '#' + profile.rank : 'N/A');
      this.updateStatCard(3, (profile.streak || 0).toString());

      // Streak subtext
      const statCards = document.querySelectorAll('#section-home .stat-card');
      if (statCards[3]) {
        const changeEl = statCards[3].querySelector('.stat-change');
        if (changeEl) {
          const streak = profile.streak || 0;
          changeEl.textContent = streak > 0 ? `${streak > 1 ? 'Keep it up!' : 'Day 1!'}` : 'Start your streak';
        }
      }

    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  },

  updateStatCard(index, value) {
    const cards = document.querySelectorAll('#section-home .stat-card');
    const card = cards[index];
    if (!card) return;
    const valEl = card.querySelector('.stat-value');
    if (valEl) valEl.textContent = value;
  }
};

window.DashboardUI = DashboardUI;
