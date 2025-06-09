# Firestore権限エラーの修正手順

## エラーの詳細
```
FirebaseError: Missing or insufficient permissions.
```

このエラーは、Firestoreのセキュリティルールが厳しすぎて、認証済みユーザーでもデータを読み取れない状態です。

## 修正手順

### 1. Firebaseコンソールでルールを更新（手動実行が必要）

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `budget-book-app-c3520` を選択
3. 左側メニューから「Firestore Database」をクリック
4. 「ルール」タブをクリック
5. 以下のルールをコピー＆ペースト：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // budget_bookコレクションのルール
    match /budget_book/{document} {
      // 認証されたユーザーのみアクセス可能
      // 読み取り：認証済みユーザーは全てのドキュメントを読み取り可能（デバッグ用）
      allow read: if request.auth != null;
      
      // 書き込み：自分のuser_idのドキュメントのみ
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
      
      // 作成時は自分のuser_idが必須
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
      
      // 更新は自分のデータのみ
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      
      // 削除は自分のデータのみ
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
  }
}
```

6. 「公開」ボタンをクリック

### 2. または、Firebase CLIを使用（認証が必要）

```bash
# Firebaseにログイン
npx firebase login

# ルールをデプロイ
npx firebase deploy --only firestore:rules
```

### 3. ルール変更の説明

**変更前（問題のあるルール）:**
```javascript
allow read: if request.auth != null && 
  request.auth.uid == resource.data.user_id;
```

**変更後（修正されたルール）:**
```javascript
allow read: if request.auth != null;
```

**変更理由:**
- 元のルールは「自分のuser_idのドキュメントのみ読み取り可能」
- しかし、ドキュメント検索時に、まずドキュメントを読み取らないとuser_idが分からない
- そのため「Missing or insufficient permissions」エラーが発生
- 修正後は「認証済みなら全て読み取り可能」に変更（デバッグ用）

### 4. セキュリティ向上版（後で適用推奨）

デバッグが完了したら、以下のより安全なルールに変更：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /budget_book/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

### 5. 確認方法

ルール更新後、アプリをリロードして：
1. ログイン
2. コンソールで「Debug: Total documents in budget_book: X」が表示される
3. 「Missing or insufficient permissions」エラーが解消される

## 注意事項

- 現在のルールは**デバッグ用**で、認証済みユーザーは全てのデータを読み取り可能
- 本番運用時は、より厳格なルールに変更する必要がある
- ルール変更は即座に反映される（アプリのリデプロイは不要）