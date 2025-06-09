import { auth, db } from '../../utils/firebase';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// データ同期の詳細調査
export const investigateDataSync = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user authenticated');
    return;
  }

  console.log('🔍 === DATA SYNC INVESTIGATION START ===');
  console.log('👤 Current User:', {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    providerId: user.providerData?.[0]?.providerId
  });

  try {
    // 1. 全ドキュメントを取得
    console.log('📄 Fetching ALL documents from budget_book...');
    const allDocsSnapshot = await getDocs(collection(db, 'budget_book'));
    console.log(`📊 Total documents in collection: ${allDocsSnapshot.size}`);

    if (allDocsSnapshot.empty) {
      console.log('⚠️ No documents found in budget_book collection');
      return { userDocuments: [], allDocuments: [] };
    }

    // 2. 全ドキュメントの詳細を表示
    const allDocuments: any[] = [];
    allDocsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const docInfo = {
        index: index + 1,
        id: doc.id,
        user_id: data.user_id,
        amount: data.amount,
        transactions: data.transactions?.length || 0,
        created_at: data.created_at?.toDate?.()?.toISOString() || 'N/A',
        isCurrentUser: data.user_id === user.uid
      };
      
      allDocuments.push(docInfo);
      console.log(`📝 Document ${index + 1}:`, docInfo);
    });

    // 3. 現在のユーザーのドキュメントを特定
    const userDocuments = allDocuments.filter(doc => doc.isCurrentUser);
    console.log(`👤 Documents for current user (${user.uid}): ${userDocuments.length}`);

    if (userDocuments.length === 0) {
      console.log('❌ No documents found for current user');
      console.log('🤔 Possible causes:');
      console.log('   - User created data with different UID');
      console.log('   - Data was created before authentication changes');
      console.log('   - Data exists in different collection');
    } else {
      console.log('✅ User documents found:');
      userDocuments.forEach((doc, index) => {
        console.log(`   ${index + 1}. Amount: ¥${doc.amount}, Transactions: ${doc.transactions}`);
      });
    }

    // 4. クエリテスト
    console.log('🔍 Testing query with user_id filter...');
    const userQuery = query(
      collection(db, 'budget_book'),
      where('user_id', '==', user.uid)
    );
    const userQuerySnapshot = await getDocs(userQuery);
    console.log(`📊 Query result: ${userQuerySnapshot.size} documents`);

    return {
      userDocuments,
      allDocuments,
      totalDocs: allDocsSnapshot.size,
      userQueryResults: userQuerySnapshot.size
    };

  } catch (error) {
    console.error('❌ Error during investigation:', error);
    return { error: error };
  } finally {
    console.log('🔍 === DATA SYNC INVESTIGATION END ===');
  }
};

// データ移行（別のユーザーIDのデータを現在のユーザーに移行）
export const migrateDataToCurrentUser = async (sourceUserId: string) => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user authenticated');
    return;
  }

  if (sourceUserId === user.uid) {
    console.log('⚠️ Source and target user IDs are the same');
    return;
  }

  console.log('🔄 === DATA MIGRATION START ===');
  console.log(`📤 Migrating from: ${sourceUserId}`);
  console.log(`📥 Migrating to: ${user.uid}`);

  try {
    // 1. 移行元のデータを取得
    const sourceQuery = query(
      collection(db, 'budget_book'),
      where('user_id', '==', sourceUserId)
    );
    const sourceSnapshot = await getDocs(sourceQuery);
    
    if (sourceSnapshot.empty) {
      console.log('❌ No documents found for source user');
      return;
    }

    console.log(`📊 Found ${sourceSnapshot.size} documents to migrate`);

    // 2. 各ドキュメントを新しいユーザーIDで作成
    const migrations = [];
    for (const sourceDoc of sourceSnapshot.docs) {
      const sourceData = sourceDoc.data();
      
      // 新しいドキュメントデータ
      const newData = {
        ...sourceData,
        user_id: user.uid,
        migrated_from: sourceUserId,
        migrated_at: serverTimestamp(),
        original_created_at: sourceData.created_at
      };

      // 新しいドキュメントを作成
      const newDocRef = doc(collection(db, 'budget_book'));
      await setDoc(newDocRef, newData);
      
      migrations.push({
        originalId: sourceDoc.id,
        newId: newDocRef.id,
        amount: sourceData.amount
      });

      console.log(`✅ Migrated document: ${sourceDoc.id} → ${newDocRef.id}`);
    }

    console.log('🎉 Migration completed successfully');
    console.log(`📊 Migrated ${migrations.length} documents`);
    
    return migrations;

  } catch (error) {
    console.error('❌ Migration error:', error);
    return { error };
  } finally {
    console.log('🔄 === DATA MIGRATION END ===');
  }
};

// テストデータ作成
export const createTestData = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user authenticated');
    return;
  }

  console.log('🧪 Creating test data for current user...');

  const testBudget = {
    user_id: user.uid,
    amount: 100000,
    transactions: [
      {
        amount: 2000,
        date: new Date().toISOString(),
        remainingBalance: 98000,
        jenre: '食費'
      },
      {
        amount: 1500,
        date: new Date(Date.now() - 86400000).toISOString(), // 1日前
        remainingBalance: 96500,
        jenre: '交通費'
      }
    ],
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    test_data: true
  };

  try {
    const newDocRef = doc(collection(db, 'budget_book'));
    await setDoc(newDocRef, testBudget);
    
    console.log('✅ Test data created:', newDocRef.id);
    return newDocRef.id;
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    return { error };
  }
};