import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 這裡使用基本配置，Realtime Database URL 是關鍵
const firebaseConfig = {
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-festive-lottery.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
