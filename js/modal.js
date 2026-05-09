// ============================================
// MODAL.JS — Modal & Toast management
// ============================================

const ModalManager = {
  open(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = '';
  },

  closeAll() {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  },

  init() {
    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeAll();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  }
};

const Toast = {
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size:1rem;flex-shrink:0;">${icons[type] || icons.info}</span>
      <span style="flex:1;font-size:0.875rem;">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0;font-size:1rem;line-height:1;">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('exiting');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

window.ModalManager = ModalManager;
window.Toast = Toast;
