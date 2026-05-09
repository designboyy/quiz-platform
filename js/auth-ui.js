import { auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

const AuthUI = {
  init() {
    this.bindFormSwitches();
    this.bindLoginForm();
    this.bindSignupForm();
    this.bindForgotForm();
    this.bindPasswordToggles();
    this.bindPasswordStrength();
    this.bindGoogleButtons();
  },

  showForm(form) {
    ['login', 'signup', 'forgot'].forEach(f => {
      const el = document.getElementById(`${f}-form-container`);
      if (el) el.style.display = f === form ? 'block' : 'none';
    });
  },

  bindFormSwitches() {
    document.getElementById('go-to-signup')?.addEventListener('click', () => this.showForm('signup'));
    document.getElementById('go-to-login')?.addEventListener('click', () => this.showForm('login'));
    document.getElementById('forgot-password-link')?.addEventListener('click', () => this.showForm('forgot'));
    document.getElementById('back-to-login')?.addEventListener('click', () => this.showForm('login'));
  },

  bindLoginForm() {
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.validateLogin()) return;
      const btn = document.getElementById('login-submit-btn');
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      this.setLoading(btn, true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.Navigation.goToApp();
        Toast.show('Welcome back! 👋', 'success');
      } catch (err) {
        Toast.show(this.friendlyError(err.code), 'error');
        this.setLoading(btn, false);
      }
    });
  },

  bindSignupForm() {
    document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.validateSignup()) return;
      const btn = document.getElementById('signup-submit-btn');
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      this.setLoading(btn, true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.Navigation.goToApp();
        Toast.show('Account created! Welcome 🚀', 'success');
      } catch (err) {
        Toast.show(this.friendlyError(err.code), 'error');
        this.setLoading(btn, false);
      }
    });
  },

  bindForgotForm() {
    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      if (!email) {
        this.showFieldError('forgot-email-error', 'Please enter your email address');
        return;
      }
      const btn = document.getElementById('forgot-submit-btn');
      this.setLoading(btn, true);
      try {
        await sendPasswordResetEmail(auth, email);
        Toast.show('Reset link sent! Check your inbox.', 'success');
        this.showForm('login');
      } catch (err) {
        Toast.show(this.friendlyError(err.code), 'error');
      }
      this.setLoading(btn, false);
    });
  },

  bindGoogleButtons() {
    ['google-login-btn', 'google-signup-btn'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', async () => {
        try {
          await signInWithPopup(auth, googleProvider);
          window.Navigation.goToApp();
          Toast.show('Signed in with Google! 🎉', 'success');
        } catch (err) {
          Toast.show(this.friendlyError(err.code), 'error');
        }
      });
    });
  },

  bindPasswordToggles() {
    this.bindToggle('toggle-login-password', 'login-password');
    this.bindToggle('toggle-signup-password', 'signup-password');
  },

  bindToggle(btnId, inputId) {
    document.getElementById(btnId)?.addEventListener('click', () => {
      const input = document.getElementById(inputId);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  },

  bindPasswordStrength() {
    const input = document.getElementById('signup-password');
    if (!input) return;
    input.addEventListener('input', () => {
      const score = this.getStrengthScore(input.value);
      this.renderStrength(score);
    });
  },

  getStrengthScore(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  },

  renderStrength(score) {
    const bars = [1,2,3,4].map(i => document.getElementById(`strength-${i}`));
    const label = document.getElementById('strength-label');
    const colors = ['', 'active-weak', 'active-fair', 'active-strong', 'active-strong'];
    const labels = ['Enter a password', 'Too weak', 'Getting there', 'Strong password', 'Very strong!'];
    bars.forEach((bar, i) => {
      if (!bar) return;
      bar.className = 'strength-bar';
      if (i < score) bar.classList.add(colors[score]);
    });
    if (label) {
      label.textContent = labels[score];
      label.style.color = score <= 1 ? 'var(--brand-danger)' : score === 2 ? 'var(--brand-warning)' : 'var(--brand-success)';
    }
  },

  validateLogin() {
    let valid = true;
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    this.clearErrors();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.showFieldError('login-email-error', 'Please enter a valid email address');
      valid = false;
    }
    if (!password || password.length < 6) {
      this.showFieldError('login-password-error', 'Password must be at least 6 characters');
      valid = false;
    }
    return valid;
  },

  validateSignup() {
    let valid = true;
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm-password').value;
    this.clearErrors();
    if (!username || username.length < 3) {
      this.showFieldError('signup-username-error', 'Username must be at least 3 characters');
      valid = false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.showFieldError('signup-email-error', 'Please enter a valid email address');
      valid = false;
    }
    if (!password || password.length < 8) {
      this.showFieldError('signup-password-error', 'Password must be at least 8 characters');
      valid = false;
    }
    if (password !== confirm) {
      this.showFieldError('signup-confirm-error', 'Passwords do not match');
      valid = false;
    }
    return valid;
  },

  showFieldError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '⚠ ' + message;
    el.classList.remove('hidden');
  },

  clearErrors() {
    document.querySelectorAll('.form-error-msg').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
  },

  setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Loading...';
      btn.disabled = true;
      btn.style.opacity = '0.75';
    } else {
      btn.textContent = btn.dataset.originalText || 'Submit';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  },

  friendlyError(code) {
    const messages = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/popup-closed-by-user': 'Google sign in was cancelled',
      'auth/network-request-failed': 'Network error, check your connection',
      'auth/too-many-requests': 'Too many attempts, please try again later'
    };
    return messages[code] || 'Something went wrong, please try again';
  }
};

window.AuthUI = AuthUI;