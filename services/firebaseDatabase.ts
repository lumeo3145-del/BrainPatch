import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Memo, MemoInput } from '../types';

interface DatabaseImplementation {
  initDatabase(): Promise<void>;
  getAllMemos(limit?: number, offset?: number): Promise<any[]>;
  createMemo(memoInput: any): Promise<number | string>;
  updateMemo(id: number | string, memoInput: any): Promise<void>;
  deleteMemo(id: number | string): Promise<void>;
  searchMemos(query: string): Promise<any[]>;
  getMemosByCategory(category: string): Promise<any[]>;
  getMemoStats(): Promise<any>;
  migrateFromAsyncStorage(): Promise<void>;
}

class FirebaseDatabaseImplementation implements DatabaseImplementation {
  private userId: string | null = null;

  constructor() {
    // 認証状態の監視
    auth.onAuthStateChanged((user) => {
      this.userId = user?.uid || null;
    });
  }

  private getUserCollection() {
    if (!this.userId) {
      throw new Error('ユーザーがログインしていません');
    }
    return collection(db, 'users', this.userId, 'memos');
  }

  async initDatabase(): Promise<void> {
    try {
      await enableNetwork(db);
      console.log('Firestore接続成功');
    } catch (error) {
      console.error('Firestore初期化エラー:', error);
      throw error;
    }
  }

  async getAllMemos(limitCount?: number, offset?: number): Promise<Memo[]> {
    try {
      const memosCollection = this.getUserCollection();
      let q = query(memosCollection, orderBy('updatedAt', 'desc'));
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const memos: Memo[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        memos.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          category: data.category,
          priority: data.priority,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Memo);
      });

      return memos.slice(offset || 0);
    } catch (error) {
      console.error('メモ取得エラー:', error);
      throw error;
    }
  }

  async createMemo(memoInput: MemoInput): Promise<string> {
    try {
      const memosCollection = this.getUserCollection();
      const now = new Date();
      
      const docRef = await addDoc(memosCollection, {
        ...memoInput,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    } catch (error) {
      console.error('メモ作成エラー:', error);
      throw error;
    }
  }

  async updateMemo(id: string, memoInput: MemoInput): Promise<void> {
    try {
      const memosCollection = this.getUserCollection();
      const memoDoc = doc(memosCollection, id);
      
      await updateDoc(memoDoc, {
        ...memoInput,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('メモ更新エラー:', error);
      throw error;
    }
  }

  async deleteMemo(id: string): Promise<void> {
    try {
      const memosCollection = this.getUserCollection();
      const memoDoc = doc(memosCollection, id);
      
      await deleteDoc(memoDoc);
    } catch (error) {
      console.error('メモ削除エラー:', error);
      throw error;
    }
  }

  async searchMemos(searchQuery: string): Promise<Memo[]> {
    try {
      // Firestoreは全文検索が限定的なため、全メモを取得してフィルタリング
      const allMemos = await this.getAllMemos();
      const lowercaseQuery = searchQuery.toLowerCase();
      
      return allMemos.filter(memo => 
        memo.title.toLowerCase().includes(lowercaseQuery) ||
        memo.content.toLowerCase().includes(lowercaseQuery) ||
        memo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('メモ検索エラー:', error);
      throw error;
    }
  }

  async getMemosByCategory(category: string): Promise<Memo[]> {
    try {
      const memosCollection = this.getUserCollection();
      const q = query(
        memosCollection,
        where('category', '==', category),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const memos: Memo[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        memos.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          category: data.category,
          priority: data.priority,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Memo);
      });

      return memos;
    } catch (error) {
      console.error('カテゴリー別メモ取得エラー:', error);
      throw error;
    }
  }

  async getMemoStats(): Promise<any> {
    try {
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
    } catch (error) {
      console.error('統計取得エラー:', error);
      throw error;
    }
  }

  // リアルタイム更新のためのリスナー
  onMemosChange(callback: (memos: Memo[]) => void): () => void {
    try {
      const memosCollection = this.getUserCollection();
      const q = query(memosCollection, orderBy('updatedAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const memos: Memo[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          memos.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            category: data.category,
            priority: data.priority,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as Memo);
        });
        callback(memos);
      });

      return unsubscribe;
    } catch (error) {
      console.error('リアルタイム更新エラー:', error);
      return () => {};
    }
  }

  // オフライン対応
  async enableOffline(): Promise<void> {
    try {
      await disableNetwork(db);
      console.log('オフラインモード有効');
    } catch (error) {
      console.error('オフラインモード有効化エラー:', error);
    }
  }

  async enableOnline(): Promise<void> {
    try {
      await enableNetwork(db);
      console.log('オンラインモード有効');
    } catch (error) {
      console.error('オンラインモード有効化エラー:', error);
    }
  }

  // AsyncStorageからの移行（Firebase版では不要）
  async migrateFromAsyncStorage(): Promise<void> {
    console.log('Firebase使用中のため、AsyncStorageからの移行はスキップします');
    return Promise.resolve();
  }
}

export default FirebaseDatabaseImplementation;