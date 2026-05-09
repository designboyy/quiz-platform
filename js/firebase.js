import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAn2NG7jjbwK3xaqsgEKzlw43lwQFnkRmo",
  authDomain: "quizforge-f6651.firebaseapp.com",
  projectId: "quizforge-f6651",
  storageBucket: "quizforge-f6651.firebasestorage.app",
  messagingSenderId: "405590726672",
  appId: "1:405590726672:web:92a5e7ab706a60dc4c1295"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { onAuthStateChanged };
