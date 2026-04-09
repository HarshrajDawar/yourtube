import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Correct Auth imports

const firebaseConfig = {
  apiKey: "AIzaSyC_Sfs4PVnVXaABER3B26MwGm_kscTHBYc",
  authDomain: "yourtube-b4761.firebaseapp.com",
  projectId: "yourtube-b4761",
  storageBucket: "yourtube-b4761.firebasestorage.app",
  messagingSenderId: "138827322329",
  appId: "1:138827322329:web:076152bc7408da39a83fc8",
  measurementId: "G-TY16Q29C9M"
};

// Initialize Firebase (safely checks if it's already running to prevent Next.js errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Correct Provider syntax

// Initialize Analytics ONLY on the client side (avoids 'window is not defined' error)
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Exporting app and auth as well, since you will likely need them in your components!
export { app, auth, analytics, provider };