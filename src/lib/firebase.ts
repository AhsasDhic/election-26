import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDc5qZxmMCFSm92H-9cEi5Zy0JC6FS1bKc",
  authDomain: "general-election-4d93a.firebaseapp.com",
  projectId: "general-election-4d93a",
  storageBucket: "general-election-4d93a.firebasestorage.app",
  messagingSenderId: "225999721384",
  appId: "1:225999721384:web:d02bf50e2fbb580a6e039d",
  measurementId: "G-3BSH0K6LBG",
  databaseURL: "https://general-election-4d93a-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
