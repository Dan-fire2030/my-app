# Google認証 503エラー修正手順

## 問題
Vercelでデプロイ後、Google認証が `localhost:3000` にリダイレクトして503エラーが発生

## 修正手順

### 1. Google Cloud Consoleの設定確認

1. **Google Cloud Console**にアクセス
   ```
   https://console.cloud.google.com/
   ```

2. **APIとサービス** → **認証情報**を選択

3. **OAuth 2.0 クライアントID**の設定を確認

4. **承認済みリダイレクトURI**に以下を追加：
   ```
   https://budget-book-ebon.vercel.app.vercel.app/
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   
   **重要**: `your-vercel-app-name`を実際のVercelアプリ名に、`your-project-id`を実際のSupabaseプロジェクトIDに置き換えてください。

### 2. Supabaseの設定確認

1. **Supabaseダッシュボード**にアクセス
   ```
   https://supabase.com/dashboard
   ```

2. **Authentication** → **Providers** → **Google**

3. **Site URL**を確認：
   ```
   https://your-vercel-app-name.vercel.app
   ```

4. **Redirect URLs**に以下を追加：
   ```
   https://your-vercel-app-name.vercel.app/**
   ```

### 3. 環境変数の確認

Vercelの環境変数が正しく設定されているか確認：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## トラブルシューティング

### エラー: "redirect_uri_mismatch"
→ Google Cloud ConsoleのリダイレクトURIが正しく設定されていません

### エラー: "invalid_request" 
→ SupabaseのSite URLまたはRedirect URLsが正しく設定されていません

### エラー: 503 Service Unavailable
→ 認証後のリダイレクト先が間違っています（通常はlocalhost）