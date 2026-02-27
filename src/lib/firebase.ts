import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChQ4oVQBqtCZIH5KVF8hqU4pI3YKlvawM",
  authDomain: "studio-5564269590-7d86a.firebaseapp.com",
  projectId: "studio-5564269590-7d86a",
  storageBucket: "studio-5564269590-7d86a.firebasestorage.app",
  messagingSenderId: "803651331316",
  appId: "1:803651331316:web:59de537bbb8e113ef06aa1",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;