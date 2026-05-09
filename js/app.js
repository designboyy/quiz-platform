// ============================================
// APP.JS — Main entry point, boots everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Theme first (prevents flash of wrong theme)
  ThemeManager.init();

  // 2. Core UI modules
  ModalManager.init();
  Animations.init();
  Animations.initRipples();

  // 3. Navigation
  Navigation.init();

  // 4. Auth UI
  AuthUI.init();

  // 5. App feature modules
  QuizUI.init();
  LeaderboardUI.init();
  ProfileUI.init();
  SettingsUI.init();

  // 6. Landing page button wiring
  bindLandingButtons();

  // 7. Theme toggles (all instances)
  bindThemeToggles();

  // 8. Mobile nav for landing
  bindMobileNav();

  // 9. Auth-page logo → back to landing
  document.getElementById('auth-logo-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    Navigation.goToLanding();
  });

});

function bindLandingButtons() {
  const goSignup = () => Navigation.goToAuth('signup');
  const goLogin  = () => Navigation.goToAuth('login');

  document.getElementById('nav-signup-btn')?.addEventListener('click', goSignup);
  document.getElementById('nav-login-btn')?.addEventListener('click', goLogin);
  document.getElementById('hero-cta-btn')?.addEventListener('click', goSignup);
  document.getElementById('hero-login-btn')?.addEventListener('click', goLogin);
  document.getElementById('how-cta-btn')?.addEventListener('click', goSignup);
  document.getElementById('mobile-signup-btn')?.addEventListener('click', goSignup);
  document.getElementById('mobile-login-btn')?.addEventListener('click', goLogin);

  // Smooth scroll for nav links
  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Nav logo → landing if on auth
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
