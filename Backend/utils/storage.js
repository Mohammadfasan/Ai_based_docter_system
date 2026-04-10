// IndexedDB wrapper for storing large files
const DB_NAME = 'MedicalRecordsDB';
const DB_VERSION = 1;
const STORE_NAME = 'medicalRecords';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create object store with userId as key path for efficient queries
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

export const saveMedicalRecordsToIndexedDB = async (userId, records) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing records for this user
    const index = store.index('userId');
    const existingRecords = await getAllRecordsByUserId(userId);
    
    for (const record of existingRecords) {
      store.delete(record.id);
    }

    // Save new records
    for (const record of records) {
      store.put(record);
    }

    return true;
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw error;
  }
};

export const getMedicalRecordsFromIndexedDB = async (userId) => {
  try {
    const db = await initDB();
    return await getAllRecordsByUserId(userId);
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    return [];
  }
};

const getAllRecordsByUserId = async (userId) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('userId');
      const records = [];
      
      const cursorRequest = index.openCursor(IDBKeyRange.only(userId));
      
      cursorRequest.onerror = () => reject(cursorRequest.error);
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          // Sort by date descending
          records.sort((a, b) => new Date(b.date) - new Date(a.date));
          resolve(records);
        }
      };
    };
  });
};

export const deleteMedicalRecordFromIndexedDB = async (recordId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(recordId);
    return true;
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error);
    throw error;
  }
};