// ============================================
// SETTINGS-UI.JS — Settings panel wiring
// ============================================

const SettingsUI = {
  init() {
    this.syncToggles();
    this.bindDarkMode();
    this.bindToggles();
    this.bindLogout();
    this.bindDangerZone();
  },

  syncToggles() {
    const s = AppState.settings;
    const map = {
      'sound-toggle': s.sound,
      'timer-toggle': s.timer,
      'notif-invites': s.notifications.invites,
      'notif-leaderboard': s.notifications.leaderboard,
      'notif-streak': s.notifications.streak
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.checked = val;
    });

    const timerMode = document.getElementById('timer-mode-select');
    if (timerMode) timerMode.value = s.timerMode;
  },

  bindDarkMode() {
    document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
      ThemeManager.apply(e.target.checked ? 'dark' : 'light');
      AppState.settings.darkMode = e.target.checked;
      AppState.saveSettings();
    });
  },

  bindToggles() {
    const bindings = {
      'sound-toggle': (v) => { AppState.settings.sound = v; },
      'timer-toggle': (v) => { AppState.settings.timer = v; },
      'notif-invites': (v) => { AppState.settings.notifications.invites = v; },
      'notif-leaderboard': (v) => { AppState.settings.notifications.leaderboard = v; },
      'notif-streak': (v) => { AppState.settings.notifications.streak = v; }
    };
    Object.entries(bindings).forEach(([id, fn]) => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        fn(e.target.checked);
        AppState.saveSettings();
        Toast.show('Setting saved', 'success', 1500);
      });
    });

    document.getElementById('timer-mode-select')?.addEventListener('change', (e) => {
      AppState.settings.timerMode = e.target.value;
      AppState.saveSettings();
      Toast.show('Timer mode updated', 'success', 1500);
    });
  },

  bindLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      // TODO: Firebase Auth signOut()
      window.Navigation.goToLanding();
      Toast.show('Signed out successfully', 'info');
    });
  },

  bindDangerZone() {
    document.getElementById('change-password-btn')?.addEventListener('click', () => {
      Toast.show('Password change will use Firebase Auth', 'info');
    });
    document.getElementById('delete-account-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure? This action cannot be undone.')) {
        Toast.show('Account deletion will use Firebase Auth', 'warning');
      }
    });
  }
};

window.SettingsUI = SettingsUI;
