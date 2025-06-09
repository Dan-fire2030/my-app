import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

type Transaction = {
  amount: number;
  date: string;
  remainingBalance: number;
  jenre: string;
};

type Budget = {
  id?: string;
  user_id?: string;
  amount: number;
  transactions: Transaction[];
  created_at?: string | Timestamp;
  updated_at?: string | Timestamp;
};

// 最新の予算を取得（ユーザー別）
export const getLatestBudget = async () => {
  try {
    // 現在のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
      console.error('getLatestBudget: No authenticated user');
      throw new Error('User not authenticated');
    }
    
    console.log('getLatestBudget: Fetching for user:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    const budgetsRef = collection(db, 'budget_book');
    
    // エラーハンドリングを改善
    try {
      const q = query(
        budgetsRef, 
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
    } catch (queryError: any) {
      console.error('Firestore query error:', queryError);
      
      // インデックスエラーの場合は、orderByなしで再試行
      if (queryError.code === 'failed-precondition' || queryError.code === 'permission-denied') {
        console.log('Retrying without orderBy...');
        const simpleQuery = query(
          budgetsRef,
          where('user_id', '==', user.uid)
        );
        const querySnapshot = await getDocs(simpleQuery);
        
        // 手動でソート
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => {
              const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
              const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
              return bTime - aTime;
            });
          
          const latestDoc = docs[0];
          return { data: latestDoc, error: null };
        }
      }
      throw queryError;
    }
    
    
    if (querySnapshot.empty) {
      return { data: null, error: null };
    }

    const doc = querySnapshot.docs[0];
    const data = { 
      id: doc.id,
      ...doc.data() 
    };

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching latest budget:", error);
    return { data: null, error };
  }
};

// 新しい予算を作成（ユーザー別）
export const createNewBudget = async (budget: Budget) => {
  try {
    // 現在のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
      console.error('createNewBudget: No authenticated user');
      throw new Error('User not authenticated');
    }

    console.log('createNewBudget: Creating for user:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    console.log('Budget data:', budget);

    // Firestoreに保存するデータ
    const budgetData = {
      amount: budget.amount,
      transactions: budget.transactions || [],
      user_id: user.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    console.log('Sending to Firestore:', budgetData);

    // 新しいドキュメントを作成
    const newBudgetRef = doc(collection(db, 'budget_book'));
    await setDoc(newBudgetRef, budgetData);

    // 作成したデータを取得して返す
    const createdDoc = await getDoc(newBudgetRef);
    const createdData = {
      id: newBudgetRef.id,
      ...createdDoc.data()
    };

    console.log('Budget created successfully:', {
      id: createdData.id,
      user_id: createdData.user_id,
      amount: createdData.amount
    });
    return { data: createdData, error: null };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { data: null, error };
  }
};

// 予算のトランザクションを更新（ユーザー認証付き）
export const updateBudgetTransactions = async (
  budgetId: string,
  transactions: Transaction[]
) => {
  try {
    // 現在のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
      console.error('updateBudgetTransactions: No authenticated user');
      throw new Error('User not authenticated');
    }
    
    console.log('updateBudgetTransactions: Updating for user:', user.uid, 'budgetId:', budgetId);

    const budgetRef = doc(db, 'budget_book', budgetId);
    
    // まず、このドキュメントがユーザーのものか確認
    const budgetDoc = await getDoc(budgetRef);
    if (!budgetDoc.exists()) {
      throw new Error('Budget not found');
    }
    
    const budgetData = budgetDoc.data();
    if (budgetData.user_id !== user.uid) {
      throw new Error('Unauthorized to update this budget');
    }

    // トランザクションを更新
    await updateDoc(budgetRef, {
      transactions: transactions,
      updated_at: serverTimestamp()
    });

    // 更新後のデータを取得
    const updatedDoc = await getDoc(budgetRef);
    const updatedData = {
      id: budgetId,
      ...updatedDoc.data()
    };

    return { data: updatedData, error: null };
  } catch (error) {
    console.error("Error updating transactions:", error);
    return { data: null, error };
  }
};

// 予算履歴を取得（ユーザー別）
export const getBudgetHistory = async () => {
  try {
    // 現在のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
      console.error('getBudgetHistory: No authenticated user');
      throw new Error('User not authenticated');
    }
    
    console.log('getBudgetHistory: Fetching for user:', user.uid);

    const budgetsRef = collection(db, 'budget_book');
    
    // エラーハンドリングを改善
    let querySnapshot;
    try {
      const q = query(
        budgetsRef,
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      
      querySnapshot = await getDocs(q);
    } catch (queryError: any) {
      console.error('Firestore query error in getBudgetHistory:', queryError);
      
      // インデックスエラーの場合は、orderByなしで再試行
      if (queryError.code === 'failed-precondition' || queryError.code === 'permission-denied') {
        console.log('Retrying without orderBy...');
        const simpleQuery = query(
          budgetsRef,
          where('user_id', '==', user.uid)
        );
        querySnapshot = await getDocs(simpleQuery);
      } else {
        throw queryError;
      }
    }
    const budgets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      data: budgets.map((budget: any) => ({
        budget: budget.amount,
        transactions: budget.transactions || [],
      })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching budget history:", error);
    return { data: [], error };
  }
};

// Supabase互換性のための関数（後方互換性）
export const getAllData = async (table: string) => {
  if (table !== 'budget_book') {
    return { data: [], error: new Error('Unsupported table') };
  }
  
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const budgetsRef = collection(db, table);
    const q = query(budgetsRef, where('user_id', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const addData = async (table: string, newData: any) => {
  if (table !== 'budget_book') {
    return null;
  }
  
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const dataWithUser = {
      ...newData,
      user_id: user.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const newDocRef = doc(collection(db, table));
    await setDoc(newDocRef, dataWithUser);

    return { data: { id: newDocRef.id, ...dataWithUser }, error: null };
  } catch (error) {
    return null;
  }
};