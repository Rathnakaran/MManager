
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "finwise-uvqzk",
  appId: "1:273069807684:web:4383d38ac5e8530e95c411",
  storageBucket: "finwise-uvqzk.firebasestorage.app",
  apiKey: "AIzaSyAaAXlSMBcxX7CuBvDTy_Tu_AjJ7izk-nA",
  authDomain: "finwise-uvqzk.firebaseapp.com",
  messagingSenderId: "273069807684",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
