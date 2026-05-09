// ============================================
// ANIMATIONS.JS — Scroll reveals & micro-interactions
// ============================================

const Animations = {
  init() {
    this.setupScrollReveal();
    this.setupNavbarScroll();
  },

  setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
      const delay = el.classList.contains('stagger-1') ? '0.05s'
                  : el.classList.contains('stagger-2') ? '0.1s'
                  : el.classList.contains('stagger-3') ? '0.15s'
                  : el.classList.contains('stagger-4') ? '0.2s'
                  : el.classList.contains('stagger-5') ? '0.25s'
                  : el.classList.contains('stagger-6') ? '0.3s' : '0s';
      el.style.transitionDelay = delay;
      observer.observe(el);
    });
  },

  setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  },

  addRipple(btn) {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        border-radius:50%;background:rgba(255,255,255,0.15);
        top:${e.clientY - rect.top - size/2}px;
        left:${e.clientX - rect.left - size/2}px;
        transform:scale(0);pointer-events:none;
        animation:ripple 0.5s ease forwards;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  },

  initRipples() {
    const style = document.createElement('style');
    style.textContent = `@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }`;
    document.head.appendChild(style);
    document.querySelectorAll('.btn-primary, .btn-accent').forEach(btn => {
      btn.style.position = 'relative';
      this.addRipple(btn);
    });
  }
};

window.Animations = Animations;
