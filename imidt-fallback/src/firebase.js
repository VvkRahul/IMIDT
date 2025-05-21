// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS LINE

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWqcl703RBa4k2633TPNkMPSMI0wU-1qs",
  authDomain: "imidt-6c426.firebaseapp.com",
  projectId: "imidt-6c426",
  storageBucket: "imidt-6c426.firebasestorage.app",
  messagingSenderId: "450071181447",
  appId: "1:450071181447:web:f06772db537b301d046022",
  measurementId: "G-GZ2QWXEWV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize and export Firestore
const db = getFirestore(app);
export { db };
