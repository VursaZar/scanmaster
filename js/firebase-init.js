import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, Timestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBY0ViRfbI8HZpdgd7gKE4HZAXKl-jup6E",
  authDomain: "scanmaster-298a7.firebaseapp.com",
  projectId: "scanmaster-298a7",
  storageBucket: "scanmaster-298a7.firebasestorage.app",
  messagingSenderId: "307472327808",
  appId: "1:307472327808:web:904cd8de85514cb8ba7265",
  measurementId: "G-6D5TH7KXLZ"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { Timestamp };
console.log("✅ Firebase и Firestore инициализированы");


