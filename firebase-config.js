// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBR8Ygtcg1kyLyHWxPHo0D6E2lbQG8N0fM",
  authDomain: "vinsn-323ee.firebaseapp.com",
  projectId: "vinsn-323ee",
  storageBucket: "vinsn-323ee.firebasestorage.app",
  messagingSenderId: "134578525800",
  appId: "1:134578525800:web:6fb1d20c53591f44854ddd",
  measurementId: "G-YK8YS1HZX6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Export auth functions for use in other files
window.firebaseAuth = {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Check authentication state and save to localStorage
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userId', user.uid);
    
    // Dispatch custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user, loggedIn: true } }));
  } else {
    // User is signed out
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    
    // Dispatch custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null, loggedIn: false } }));
  }
});
