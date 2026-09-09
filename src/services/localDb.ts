import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'waveflow-personal';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDb = () => {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tasks')) {
          const store = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          store.createIndex('status', 'status');
        }
      },
    });
  }
  return dbPromise;
};

export const localDb = {
  async getTasks() {
    const db = await getDb();
    if (!db) return [];
    return db.getAll('tasks');
  },
  
  async addTask(title: string, status: string = 'TODO', priority: string = 'MEDIUM') {
    const db = await getDb();
    if (!db) return null;
    const task = {
      title,
      status,
      createdAt: new Date().toISOString(),
      priority
    };
    const id = await db.add('tasks', task);
    return { ...task, id };
  },
  
  async updateTaskStatus(id: number, status: string) {
    const db = await getDb();
    if (!db) return;
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const task = await store.get(id);
    if (task) {
      task.status = status;
      await store.put(task);
    }
    await tx.done;
  }
};
