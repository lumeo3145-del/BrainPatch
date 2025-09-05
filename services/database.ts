import { Platform } from 'react-native';
import { Memo, MemoInput } from '../types';
import FirebaseDatabaseImplementation from './firebaseDatabase';

// プラットフォーム別DB実装
let dbImplementation: DatabaseImplementation;

interface DatabaseImplementation {
  initDatabase(): Promise<void>;
  getAllMemos(limit?: number, offset?: number): Promise<Memo[]>;
  createMemo(memoInput: MemoInput): Promise<number | string>;
  updateMemo(id: number | string, memoInput: MemoInput): Promise<void>;
  deleteMemo(id: number | string): Promise<void>;
  searchMemos(query: string): Promise<Memo[]>;
  getMemosByCategory(category: string): Promise<Memo[]>;
  getMemoStats(): Promise<any>;
  migrateFromAsyncStorage(): Promise<void>;
}

// Web版実装（IndexedDB使用）
class WebDatabaseImplementation implements DatabaseImplementation {
  private dbName = 'brainpatch_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // メモストア作成
        if (!db.objectStoreNames.contains('memos')) {
          const memoStore = db.createObjectStore('memos', { keyPath: 'id', autoIncrement: true });
          memoStore.createIndex('category', 'category', { unique: false });
          memoStore.createIndex('priority', 'priority', { unique: false });
          memoStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async getAllMemos(limit?: number, offset?: number): Promise<Memo[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['memos'], 'readonly');
      const store = transaction.objectStore('memos');
      const index = store.index('updatedAt');
      const request = index.getAll();

      request.onsuccess = () => {
        let memos = request.result.reverse(); // 新しい順
        
        if (offset) {
          memos = memos.slice(offset);
        }
        if (limit) {
          memos = memos.slice(0, limit);
        }
        
        resolve(memos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createMemo(memoInput: MemoInput): Promise<number | string> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const now = new Date().toISOString();
      const memo: Memo = {
        id: Date.now(),
        ...memoInput,
        createdAt: now,
        updatedAt: now,
      };

      const transaction = this.db.transaction(['memos'], 'readwrite');
      const store = transaction.objectStore('memos');
      const request = store.add(memo);

      request.onsuccess = () => resolve(memo.id);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMemo(id: number | string, memoInput: MemoInput): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['memos'], 'readwrite');
      const store = transaction.objectStore('memos');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const memo = getRequest.result;
        if (memo) {
          const updatedMemo = {
            ...memo,
            ...memoInput,
            updatedAt: new Date().toISOString(),
          };
          
          const updateRequest = store.put(updatedMemo);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Memo not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteMemo(id: number | string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['memos'], 'readwrite');
      const store = transaction.objectStore('memos');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async searchMemos(query: string): Promise<Memo[]> {
    const allMemos = await this.getAllMemos();
    const lowercaseQuery = query.toLowerCase();
    
    return allMemos.filter(memo => 
      memo.title.toLowerCase().includes(lowercaseQuery) ||
      memo.content.toLowerCase().includes(lowercaseQuery) ||
      memo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getMemosByCategory(category: string): Promise<Memo[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['memos'], 'readonly');
      const store = transaction.objectStore('memos');
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => {
        const memos = request.result.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(memos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getMemoStats(): Promise<any> {
    const allMemos = await this.getAllMemos();
    
    return {
      total: allMemos.length,
      bugs: allMemos.filter(m => m.category === 'bug').length,
      features: allMemos.filter(m => m.category === 'feature').length,
      ideas: allMemos.filter(m => m.category === 'idea').length,
      notes: allMemos.filter(m => m.category === 'note').length,
      todos: allMemos.filter(m => m.category === 'todo').length,
      high_priority: allMemos.filter(m => m.priority === 'high').length,
    };
  }

  async migrateFromAsyncStorage(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const oldData = await AsyncStorage.getItem('brainpatch_memos');
      
      if (oldData) {
        const memos = JSON.parse(oldData) as Memo[];
        console.log(`Migrating ${memos.length} memos from AsyncStorage...`);
        
        for (const memo of memos) {
          await this.createMemo({
            title: memo.title,
            content: memo.content,
            category: memo.category,
            priority: memo.priority,
            tags: memo.tags,
          });
        }
        
        await AsyncStorage.removeItem('brainpatch_memos');
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.log('No AsyncStorage data to migrate or migration failed:', error);
    }
  }
}

// SQLite実装（iOS/Android）
class SQLiteDatabaseImplementation implements DatabaseImplementation {
  private db: any;

  async initDatabase(): Promise<void> {
    try {
      // expo-sqliteが利用可能かチェック
      let SQLite;
      try {
        SQLite = require('expo-sqlite');
        if (!SQLite || !SQLite.openDatabaseAsync) {
          throw new Error('expo-sqlite not available');
        }
      } catch (requireError) {
        console.error('expo-sqlite module not found:', requireError);
        throw new Error('SQLite not available in this environment');
      }

      this.db = await SQLite.openDatabaseAsync('brainpatch.db');
      
      if (!this.db) {
        throw new Error('Failed to open database');
      }
      
      await this.createTables();
      await this.createIndexes();
      
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('SQLite initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('bug', 'feature', 'idea', 'note', 'todo')),
        priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
        tags TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async createIndexes(): Promise<void> {
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_memos_category ON memos (category);
      CREATE INDEX IF NOT EXISTS idx_memos_priority ON memos (priority);
      CREATE INDEX IF NOT EXISTS idx_memos_updated_at ON memos (updated_at);
    `);
  }

  async getAllMemos(limit?: number, offset?: number): Promise<Memo[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';
    
    const result = await this.db.getAllAsync(`
      SELECT * FROM memos 
      ORDER BY updated_at DESC
      ${limitClause} ${offsetClause}
    `);
    
    return result.map(this.mapRowToMemo);
  }

  async createMemo(memoInput: MemoInput): Promise<number | string> {
    const result = await this.db.runAsync(`
      INSERT INTO memos (title, content, category, priority, tags, updated_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [memoInput.title, memoInput.content, memoInput.category, memoInput.priority, JSON.stringify(memoInput.tags)]);
    
    return result.lastInsertRowId;
  }

  async updateMemo(id: number | string, memoInput: MemoInput): Promise<void> {
    await this.db.runAsync(`
      UPDATE memos 
      SET title = ?, content = ?, category = ?, priority = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [memoInput.title, memoInput.content, memoInput.category, memoInput.priority, JSON.stringify(memoInput.tags), id]);
  }

  async deleteMemo(id: number | string): Promise<void> {
    await this.db.runAsync('DELETE FROM memos WHERE id = ?', [id]);
  }

  async searchMemos(query: string): Promise<Memo[]> {
    if (!query.trim()) {
      return this.getAllMemos();
    }
    
    const result = await this.db.getAllAsync(`
      SELECT * FROM memos 
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY updated_at DESC
    `, [`%${query}%`, `%${query}%`]);
    
    return result.map(this.mapRowToMemo);
  }

  async getMemosByCategory(category: string): Promise<Memo[]> {
    const result = await this.db.getAllAsync(`
      SELECT * FROM memos 
      WHERE category = ?
      ORDER BY updated_at DESC
    `, [category]);
    
    return result.map(this.mapRowToMemo);
  }

  async getMemoStats(): Promise<any> {
    return await this.db.getFirstAsync(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN category = 'bug' THEN 1 END) as bugs,
        COUNT(CASE WHEN category = 'feature' THEN 1 END) as features,
        COUNT(CASE WHEN category = 'idea' THEN 1 END) as ideas,
        COUNT(CASE WHEN category = 'note' THEN 1 END) as notes,
        COUNT(CASE WHEN category = 'todo' THEN 1 END) as todos,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
      FROM memos
    `);
  }

  async migrateFromAsyncStorage(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const oldData = await AsyncStorage.getItem('brainpatch_memos');
      
      if (oldData) {
        const memos = JSON.parse(oldData) as Memo[];
        console.log(`Migrating ${memos.length} memos from SQLite...`);
        
        for (const memo of memos) {
          await this.createMemo({
            title: memo.title,
            content: memo.content,
            category: memo.category,
            priority: memo.priority,
            tags: memo.tags,
          });
        }
        
        await AsyncStorage.removeItem('brainpatch_memos');
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.log('No AsyncStorage data to migrate:', error);
    }
  }

  private mapRowToMemo = (row: any): Memo => ({
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    priority: row.priority,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

// データベース実装の初期化（Firebase優先）
const initializeDatabase = () => {
  try {
    // Firebase実装を優先使用（クラウド同期のため）
    console.log('Using Firebase for cloud sync');
    dbImplementation = new FirebaseDatabaseImplementation();
  } catch (error) {
    console.error('Firebase初期化エラー、ローカル実装にフォールバック:', error);
    
    // フォールバック: プラットフォーム別ローカル実装
    const isWeb = (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') ||
                  (typeof navigator !== 'undefined' && navigator.userAgent.includes('Mozilla'));
    
    if (isWeb) {
      console.log('Using IndexedDB fallback');
      dbImplementation = new WebDatabaseImplementation();
    } else {
      console.log('Using SQLite fallback');
      dbImplementation = new SQLiteDatabaseImplementation();
    }
  }
};

// 安全な初期化関数
const ensureInitialized = async () => {
  if (!dbImplementation) {
    initializeDatabase();
  }
};

// エクスポート関数（エラーハンドリング付き）
export const initDatabase = async () => {
  try {
    await ensureInitialized();
    return await dbImplementation.initDatabase();
  } catch (error) {
    console.error('Database initialization failed, falling back to IndexedDB:', error);
    // SQLiteで失敗した場合はIndexedDBにフォールバック
    dbImplementation = new WebDatabaseImplementation();
    return await dbImplementation.initDatabase();
  }
};

export const getAllMemos = async (limit?: number, offset?: number) => {
  await ensureInitialized();
  return dbImplementation.getAllMemos(limit, offset);
};

export const createMemo = async (memoInput: MemoInput) => {
  await ensureInitialized();
  return dbImplementation.createMemo(memoInput);
};

export const updateMemo = async (id: number | string, memoInput: MemoInput) => {
  await ensureInitialized();
  return dbImplementation.updateMemo(id, memoInput);
};

export const deleteMemo = async (id: number | string) => {
  await ensureInitialized();
  return dbImplementation.deleteMemo(id);
};

export const searchMemos = async (query: string) => {
  await ensureInitialized();
  return dbImplementation.searchMemos(query);
};

export const getMemosByCategory = async (category: string) => {
  await ensureInitialized();
  return dbImplementation.getMemosByCategory(category);
};

export const getMemoStats = async () => {
  await ensureInitialized();
  return dbImplementation.getMemoStats();
};

export const migrateFromAsyncStorage = async () => {
  await ensureInitialized();
  return dbImplementation.migrateFromAsyncStorage();
};