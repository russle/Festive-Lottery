// IndexedDB 儲存工具 - 用於儲存大體積資料（如音樂檔案）
const DB_NAME = 'FestiveLotteryDB';
const STORE_NAME = 'assets';
const BGM_KEY = 'background_music';

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveBGMFile = async (file: File | Blob): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(file, BGM_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const loadBGMFile = async (): Promise<File | Blob | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(BGM_KEY);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

export const deleteBGMFile = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(BGM_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
