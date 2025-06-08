# Supabase セットアップ手順

## 1. Supabaseダッシュボードにアクセス
https://supabase.com/dashboard

## 2. プロジェクトを選択

## 3. SQL Editorを開く
左側のメニューから「SQL Editor」を選択

## 4. テーブルを作成
`create_table.sql`の内容をコピーして、SQL Editorで実行

## 5. 実行結果を確認
- 緑色のチェックマークが表示されれば成功
- エラーが表示された場合は、エラーメッセージを確認

## 6. Table Editorで確認
- 左側のメニューから「Table Editor」を選択
- `budget_book`テーブルが表示されることを確認
- カラムが正しく作成されていることを確認：
  - id (uuid)
  - user_id (uuid)
  - amount (numeric)
  - transactions (jsonb)
  - created_at (timestamptz)
  - updated_at (timestamptz)

## 7. Authentication → Policiesで確認
- `budget_book`テーブルのRLSが有効になっていることを確認
- ポリシー「Enable all for users based on user_id」が存在することを確認

## トラブルシューティング

### エラー: "relation "auth.users" does not exist"
→ Supabaseの認証機能が有効になっていません。Authentication設定を確認してください。

### エラー: "permission denied for schema public"
→ データベースの権限に問題があります。Supabaseサポートに連絡してください。

### エラー: "duplicate key value violates unique constraint"
→ テーブルが既に存在します。`create_table.sql`の最初のコメントを外してテーブルを削除してから再作成してください。