import { auth, db } from '../../utils/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// データを強制的に読み込んでアプリの状態を更新
export const forceLoadUserData = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user authenticated');
    return null;
  }

  console.log('🔄 Force loading user data...');

  try {
    // 1. 最新の予算を取得
    const budgetsRef = collection(db, 'budget_book');
    const q = query(
      budgetsRef,
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('❌ No budget found for user');
      return null;
    }

    const doc = snapshot.docs[0];
    const budgetData = {
      id: doc.id,
      ...doc.data()
    };

    console.log('✅ Budget data loaded:', budgetData);

    // 2. 残高を計算
    const transactions = budgetData.transactions || [];
    const totalSpent = transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    const currentBalance = budgetData.amount - totalSpent;

    const result = {
      budget: budgetData,
      calculatedBalance: currentBalance,
      transactionCount: transactions.length,
      totalSpent
    };

    console.log('💰 Calculated values:', result);
    return result;

  } catch (error) {
    console.error('❌ Error force loading data:', error);
    return null;
  }
};

// アプリの状態を直接更新する関数
export const updateAppState = (budgetData: any, setters: any) => {
  const { 
    setMonthlyBudget, 
    setCurrentBudgetId, 
    setTransactions, 
    setCurrentBalance,
    setShowBudgetModal 
  } = setters;

  console.log('🎯 Updating app state with:', budgetData);

  // 状態を更新
  setMonthlyBudget(budgetData.budget.amount);
  setCurrentBudgetId(budgetData.budget.id);
  setTransactions(budgetData.budget.transactions || []);
  setCurrentBalance(budgetData.calculatedBalance);
  setShowBudgetModal(false); // モーダルを閉じる

  console.log('✅ App state updated');
};