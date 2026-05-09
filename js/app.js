// ============================================
// APP.JS — Main entry point
// All modules export globals via window.X
// This file boots the entire app
// ============================================

// Load state first (no imports, sets window.AppState)
import "./state.js";

// Load theme, modal, animations (no firebase deps, set globals)
import "./theme.js";
import "./modal.js";
import "./animations.js";

// Load navigation (uses window.AuthUI — must be defined before goToAuth is called)
import "./navigation.js";

// Load Firebase-dependent modules
import "./auth-ui.js";
import "./quiz-ui.js";
import "./leaderboard-ui.js";
import "./profile-ui.js";
import "./dashboard-ui.js";
import "./settings-ui.js";

// Boot everything after DOM is ready
document.addEventListener('DOMContentLoaded', () => {

  // Theme first — prevents flash
  ThemeManager.init();

  // Core UI
  ModalManager.init();
  Animations.init();
  Animations.initRipples();

  // Navigation
  Navigation.init();

  // Auth (includes onAuthStateChanged watcher)
  AuthUI.init();

  // Feature modules
  QuizUI.init();
  LeaderboardUI.init();
  ProfileUI.init();
  SettingsUI.init();

  // Landing page wiring
  bindLandingButtons();
  bindThemeToggles();
  bindMobileNav();

  // Auth page logo button
  document.getElementById('auth-logo-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    Navigation.goToLanding();
  });

  // Header avatar → profile
  document.getElementById('header-avatar')?.addEventListener('click', () => {
    Navigation.switchSection('profile');
    ProfileUI.loadProfile();
  });

  // Sidebar user → profile
  document.getElementById('sidebar-user-btn')?.addEventListener('click', () => {
    Navigation.switchSection('profile');
    ProfileUI.loadProfile();
  });

  // Leaderboard section switch triggers data load
  document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
    link.addEventListener('click', () => {
      const section = link.dataset.section;
      if (section === 'leaderboard') LeaderboardUI.loadLeaderboard();
      if (section === 'profile') ProfileUI.loadProfile();
    });
  });

});

function bindLandingButtons() {
  const goSignup = () => Navigation.goToAuth('signup');
  const goLogin = () => Navigation.goToAuth('login');

  document.getElementById('nav-signup-btn')?.addEventListener('click', goSignup);
  document.getElementById('nav-login-btn')?.addEventListener('click', goLogin);
  document.getElementById('hero-cta-btn')?.addEventListener('click', goSignup);
  document.getElementById('hero-login-btn')?.addEventListener('click', goLogin);
  document.getElementById('how-cta-btn')?.addEventListener('click', goSignup);
  document.getElementById('mobile-signup-btn')?.addEventListener('click', goSignup);
  document.getElementById('mobile-login-btn')?.addEventListener('click', goLogin);

  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.getElementById('nav-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    Navigation.goToLanding();
  });
}

function bindThemeToggles() {
  ['theme-toggle-landing', 'theme-toggle-auth', 'theme-toggle-app'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => ThemeManager.toggle());
  });
}

function bindMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}
