# Firestore データベース セットアップガイド

## エラーの原因
`Project 'budget-book-app-c3520' or database '(default)' does not exist` というエラーは、Firestoreデータベースがまだ作成されていないことを示しています。

## 解決手順

### 1. Firebase コンソールでFirestoreを有効化

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `budget-book-app-c3520` を選択
3. 左側のメニューから「Firestore Database」を選択
4. 「データベースを作成」ボタンをクリック

### 2. データベースの初期設定

1. **セキュリティルールの選択**:
   - 「本番環境モード」を選択（後でルールを設定するため）
   
2. **ロケーションの選択**:
   - `asia-northeast1` (東京) または最寄りのリージョンを選択
   - ⚠️ 一度選択すると変更できません

### 3. データベース作成の確認

データベースが作成されたら、Firebase コンソールで：
- Firestoreダッシュボードが表示される
- コレクションの作成が可能になる

### 4. CLIでのデプロイ再実行

データベース作成後、以下のコマンドを再実行：

```bash
# インデックスのデプロイ
npx firebase deploy --only firestore:indexes

# セキュリティルールのデプロイ
npx firebase deploy --only firestore:rules
```

## トラブルシューティング

### プロジェクトが見つからない場合
1. Firebase CLIで正しいアカウントにログインしているか確認:
   ```bash
   npx firebase login:list
   ```

2. プロジェクトリストを確認:
   ```bash
   npx firebase projects:list
   ```

### 権限エラーの場合
プロジェクトのオーナーまたは編集者権限があることを確認してください。

## 注意事項

- Firestoreは初回アクセス時に自動的にデータベースを作成しません
- Firebase ConsoleでFirestoreを明示的に有効化する必要があります
- データベースのロケーションは後から変更できません