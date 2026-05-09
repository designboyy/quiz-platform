// ============================================
// THEME.JS — Dark/light mode
// ============================================

const ThemeManager = {
  init() {
    const saved = localStorage.getItem('qf-theme') || 'dark';
    this.apply(saved, false);
  },

  apply(theme, animate = true) {
    AppState.currentTheme = theme;
    localStorage.setItem('qf-theme', theme);
    if (animate) {
      document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
    }
    document.documentElement.setAttribute('data-theme', theme);
    this.updateIcons(theme);
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.checked = theme === 'dark';
  },

  toggle() {
    const next = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    this.apply(next, true);
  },

  updateIcons(theme) {
    const sunIcon = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    const iconSvg = theme === 'dark' ? sunIcon : moonIcon;
    ['theme-icon-landing', 'theme-icon-auth', 'theme-icon-app'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = iconSvg;
    });
  }
};

window.ThemeManager = ThemeManager;
