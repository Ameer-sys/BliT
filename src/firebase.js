import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// optional, only if you later use file uploads
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDX_BtHjoMaImB8VTMoDNw8dUkjevyFTBM",
  authDomain: "blit-45c43.firebaseapp.com",
  projectId: "blit-45c43",
  storageBucket: "blit-45c43.firebasestorage.app",
  messagingSenderId: "974598432471",
  appId: "1:974598432471:web:2ff3c8e90e909b6802f292",
  measurementId: "G-900WXBQ5C5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
