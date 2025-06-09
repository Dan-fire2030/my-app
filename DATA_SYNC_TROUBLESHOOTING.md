# データ同期トラブルシューティングガイド

## 問題
PCでGoogle認証でログインしたデータが、iPhoneで同じGoogleアカウントでログインしても同期されない。

## 原因と解決策

### 1. **認証状態の確認強化**
- `firebaseFunctions.ts`にデバッグログを追加
- 各関数でユーザーID、メールアドレス、表示名をログ出力
- 認証エラー時の詳細なエラーメッセージ

### 2. **Firestoreのセキュリティルール**
```javascript
// 読み取り：自分のデータのみ
allow read: if request.auth != null && 
  request.auth.uid == resource.data.user_id;
```
- ユーザーは自分のデータのみアクセス可能
- user_idフィールドが認証ユーザーのUIDと一致する必要がある

### 3. **デバッグ手順**

#### PCとiPhoneの両方で確認：
1. ブラウザの開発者ツール（コンソール）を開く
2. ログイン時に以下を確認：
   ```
   Firebase Auth: State changed: {hasUser: true, email: "xxx@gmail.com", uid: "xxx"}
   fetchInitialData: Starting for user: {uid: "xxx", email: "xxx@gmail.com"}
   getLatestBudget: Fetching for user: {uid: "xxx", email: "xxx@gmail.com"}
   ```

3. **同じUIDが表示されているか確認**
   - 異なるUIDの場合：異なるGoogleアカウントでログインしている
   - 同じUIDの場合：データ取得の問題

### 4. **よくある問題と解決方法**

#### A. Firestoreデータベースが未作成
```bash
# Firebase Consoleで確認
1. https://console.firebase.google.com/
2. プロジェクトを選択
3. Firestore Databaseを有効化
```

#### B. 複合インデックスが未作成
エラーメッセージ：`failed-precondition`
```bash
npx firebase deploy --only firestore:indexes
```

#### C. セキュリティルールが未適用
```bash
npx firebase deploy --only firestore:rules
```

#### D. 異なるGoogleアカウント
- 同じメールアドレスでも、個人用とG Suite/Workspaceアカウントは別
- ログイン時に正しいアカウントを選択

### 5. **データ移行が必要な場合**

古いユーザーIDのデータを新しいユーザーIDに移行：
```javascript
// Firebase Consoleのコンソールで実行
const oldUserId = "old-user-id";
const newUserId = "new-user-id";

// 古いデータを取得
const oldData = await db.collection('budget_book')
  .where('user_id', '==', oldUserId)
  .get();

// 新しいユーザーIDで保存
oldData.forEach(async (doc) => {
  const data = doc.data();
  data.user_id = newUserId;
  await db.collection('budget_book').add(data);
});
```

### 6. **推奨される追加実装**

#### オフライン対応
```javascript
// firebase.tsに追加
import { enableIndexedDbPersistence } from 'firebase/firestore';

// オフライン永続化を有効化
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // 複数タブが開いている場合
  } else if (err.code == 'unimplemented') {
    // ブラウザが非対応
  }
});
```

これにより、オフラインでもデータが利用可能になり、オンライン復帰時に自動同期されます。