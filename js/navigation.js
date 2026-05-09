// ============================================
// NAVIGATION.JS — SPA routing & view switching
// ============================================

const Navigation = {
  sectionTitles: {
    home: 'Home',
    explore: 'Explore Quizzes',
    create: 'Create Quiz',
    leaderboard: 'Leaderboard',
    profile: 'Profile',
    settings: 'Settings'
  },

  init() {
    this.bindSidebarLinks();
    this.bindMobileToggle();
    this.bindSidebarOverlay();
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
  },

  goToLanding() {
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('app-shell').classList.remove('visible');
    window.scrollTo(0, 0);
  },

  goToAuth(form = 'login') {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('app-shell').classList.remove('visible');
    AuthUI.showForm(form);
  },

  goToApp() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('auth-page').style.display = 'none';
    const shell = document.getElementById('app-shell');
    shell.style.display = 'flex';
    shell.classList.add('visible');
    this.switchSection('home');
  },

  switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    // Show target
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section);
    });

    // Update header title
    const titleEl = document.getElementById('section-title');
    if (titleEl) titleEl.textContent = this.sectionTitles[section] || section;

    AppState.currentSection = section;

    // Close mobile sidebar if open
    this.closeMobileSidebar();
  },

  bindSidebarLinks() {
    document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
      link.addEventListener('click', () => {
        this.switchSection(link.dataset.section);
      });
    });
  },

  bindMobileToggle() {
    const btn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    btn?.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      if (overlay) overlay.style.display = open ? 'block' : 'none';
    });
  },

  bindSidebarOverlay() {
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      this.closeMobileSidebar();
    });
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
  },

  checkResponsive() {
    const isMobile = window.innerWidth <= 768;
    const btn = document.getElementById('sidebar-toggle-btn');
    if (btn) btn.style.display = isMobile ? 'flex' : 'none';
  }
};

// Global shortcut used by inline onclick handlers
window.navigateTo = (section) => Navigation.switchSection(section);
window.Navigation = Navigation;
