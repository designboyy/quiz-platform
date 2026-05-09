# QuizForge — Frontend Architecture

Modern quiz platform frontend. Firebase-ready, zero dependencies.

## Stack
- HTML5, CSS3, Vanilla JavaScript
- No frameworks, no build tools
- Google Fonts (Syne + DM Sans)

## Project Structure

```
quiz-platform/
├── index.html          # Full SPA shell — all views live here
├── css/
│   └── styles.css      # Complete design system + all component styles
├── js/
│   ├── state.js        # Central app state + mock data (swap with Firebase later)
│   ├── theme.js        # Dark/light mode with localStorage persistence
│   ├── animations.js   # Scroll reveals, ripple effects, micro-interactions
│   ├── modal.js        # Modal + Toast notification system
│   ├── auth-ui.js      # Login / Signup / Forgot password forms + validation
│   ├── quiz-ui.js      # Quiz cards, gameplay engine, quiz builder
│   ├── leaderboard-ui.js  # Leaderboard podium + table rendering
│   ├── profile-ui.js   # Profile page, achievements, activity feed
│   ├── settings-ui.js  # Settings toggles + persistence
│   ├── navigation.js   # SPA routing between sections
│   └── app.js          # Entry point — boots all modules
└── assets/             # Place images/icons here
```

## Views

**Public (pre-auth)**
- Landing page with hero, features, how-it-works, footer
- Login form
- Signup form with password strength indicator
- Forgot password form

**App (post-auth)**
- Home dashboard with stats + recent quizzes
- Explore — searchable/filterable quiz grid
- Create Quiz — full builder with dynamic questions
- Leaderboard — podium + ranked table
- Profile — stats, achievements, activity feed
- Settings — toggles for theme, sound, timer, notifications

## Connecting Firebase Later

Every piece is structured for this:

```javascript
// auth-ui.js — swap the setTimeout mocks with:
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);

// state.js — swap mockQuizzes with:
const snapshot = await getDocs(collection(db, 'quizzes'));
AppState.mockQuizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
```

Form IDs, data attributes, and state shape are all Firebase-compatible.

## Deploy on Vercel

1. Push to GitHub
2. Import on vercel.com
3. Deploy — no build step needed
