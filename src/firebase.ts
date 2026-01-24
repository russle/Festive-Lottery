import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 這裡使用基本配置，Realtime Database URL 是關鍵
const firebaseConfig = {
  databaseURL: "https://my-festive-lottery.asia-southeast1.firebasedatabase.app/",
  // 其他欄位若為 Public DB 則暫時不需要，若有權限限制則需補上 apiKey 等
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
