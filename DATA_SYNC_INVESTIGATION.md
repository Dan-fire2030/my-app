# データ同期調査手順

## 現在の状況
- エラーは解消されている
- 認証は成功している（UID: upBY6ndQ4Hh1WQhGZAW66BphuT93）
- しかしデータが同期されていない

## 調査手順

### 1. デバッグパネルの使用
アプリの右下に「🐛 Debug」ボタンが追加されました。

**PCとiPhoneの両方で以下を確認：**

1. **Authentication セクション**
   - 同じUIDが表示されているか？
   - 同じEmailが表示されているか？
   - Provider が `google.com` になっているか？

2. **Firestore Data セクション**
   - Documents の数を確認
   - PCで作成したデータがiPhoneで表示されるか？

### 2. 手動データチェック
デバッグパネルの「🔍 Manual Data Check」ボタンをクリック：
- 現在のユーザーのデータを全て表示
- データがない場合はテストデータを自動作成

### 3. コンソールログの確認
ブラウザのコンソールで以下を確認：

```
Debug: Total documents in budget_book: X
Debug: Document [ID] {user_id: "...", matches_current_user: true/false}
```

### 4. よくあるケース

#### ケース1: 異なるGoogleアカウント
**症状**: 異なるUIDが表示される
**解決**: 両方のデバイスで同じGoogleアカウントでログイン

#### ケース2: Firestoreにデータが存在しない
**症状**: Documents: 0 と表示される
**解決**: Manual Data Check でテストデータを作成

#### ケース3: セキュリティルールの問題
**症状**: Permission denied エラー
**解決**: Firebase Console でセキュリティルールを確認

#### ケース4: 異なるブラウザプロファイル
**症状**: 同じメールでも異なるUID
**解決**: 
- Chrome: 同じプロファイルを使用
- Safari: プライベートブラウジングを無効化

### 5. Firebaseコンソールでの確認
1. [Firebase Console](https://console.firebase.google.com/)
2. Authentication → Users → ユーザー数を確認
3. Firestore Database → データの確認

### 6. デバッグ情報の共有
「📋 Copy Debug Info」で情報をコピーして、問題の詳細を確認できます。

## トラブルシューティング

### データが見つからない場合
```javascript
// ブラウザコンソールで実行
const user = firebase.auth().currentUser;
console.log('Current user:', user.uid);

// 手動でデータを検索
const db = firebase.firestore();
db.collection('budget_book').get().then(snapshot => {
  console.log('All documents:');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, data.user_id, data.amount);
  });
});
```

### セキュリティルールの確認
Firebase Console → Firestore → ルール：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /budget_book/{document} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

## 次のステップ
1. デバッグパネルで情報を確認
2. PCとiPhoneの情報を比較
3. 問題のケースを特定
4. 適切な解決策を実行