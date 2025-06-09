import { auth, db } from '../../utils/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// 手動でデータを確認・作成する関数
export const manualDataCheck = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('No user authenticated');
    return;
  }

  console.log('=== MANUAL DATA CHECK START ===');
  console.log('Current user:', {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName
  });

  try {
    // 1. 全てのドキュメントを取得
    const allDocs = await getDocs(collection(db, 'budget_book'));
    console.log('Total documents in budget_book:', allDocs.size);
    
    const userDocs = allDocs.docs.filter(doc => doc.data().user_id === user.uid);
    console.log('Documents for current user:', userDocs.length);
    
    userDocs.forEach(doc => {
      const data = doc.data();
      console.log('User document:', {
        id: doc.id,
        amount: data.amount,
        transactions: data.transactions?.length || 0,
        created_at: data.created_at
      });
    });

    // 2. もしデータがない場合、テストデータを作成
    if (userDocs.length === 0) {
      console.log('No data found for user. Creating test budget...');
      
      const testBudget = {
        user_id: user.uid,
        amount: 50000,
        transactions: [
          {
            amount: 1500,
            date: new Date().toISOString(),
            remainingBalance: 48500,
            jenre: '食費'
          }
        ],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const newDocRef = doc(collection(db, 'budget_book'));
      await setDoc(newDocRef, testBudget);
      
      console.log('Test budget created:', newDocRef.id);
    }

  } catch (error) {
    console.error('Manual data check error:', error);
  }
  
  console.log('=== MANUAL DATA CHECK END ===');
};

// Firestoreの接続状態を確認
export const checkFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    const testCollection = collection(db, 'budget_book');
    const snapshot = await getDocs(testCollection);
    console.log('Firestore connection successful. Documents:', snapshot.size);
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
};