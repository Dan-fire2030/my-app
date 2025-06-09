# データ同期デバッグ手順

## 1. デバッグ情報の確認

### PCとiPhoneの両方で以下を実行：

1. **ブラウザのコンソールを開く**
   - PC: F12キーまたは右クリック→「検証」
   - iPhone: Safari → 設定 → 詳細 → Webインスペクタをオン → Mac経由でデバッグ

2. **ログイン後に表示される情報を確認**

```
========== AUTH DEBUG START ==========
🟢 Debug Auth: Current user state
  uid: "xxxxxxxx"  ← このIDが重要！
  email: "your-email@gmail.com"
  displayName: "Your Name"
  providers: [{providerId: "google.com"}]

🟢 Debug Token:
  hasToken: true
  claims: {...}

🟢 Debug Storage:
  keys: ["firebase:authUser:..."]
========== AUTH DEBUG END ==========
```

3. **重要な確認ポイント**
   - PCとiPhoneで同じ`uid`が表示されているか？
   - `email`は完全に一致しているか？
   - `providerId`は両方とも`google.com`か？

## 2. よくある問題と解決方法

### A. 異なるUIDが表示される場合

**原因**: 異なるGoogleアカウントでログインしている

**解決方法**:
1. 両方のデバイスでログアウト
2. 同じGoogleアカウントで再ログイン
3. Gmailアプリで確認：設定→アカウント管理

### B. データが表示されない（同じUID）

**原因**: Firestoreの同期遅延またはキャッシュ問題

**解決方法**:
1. アプリを完全にリロード
   - PC: Ctrl+Shift+R (Mac: Cmd+Shift+R)
   - iPhone: Safari → タブを閉じて再度開く

2. キャッシュクリア
   - iPhone: 設定 → Safari → 履歴とWebサイトデータを消去

### C. "User not authenticated"エラー

**原因**: 認証トークンの期限切れ

**解決方法**:
1. ログアウトして再ログイン
2. Firebaseコンソールで認証設定を確認

## 3. Firebaseコンソールでの確認

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. Authentication → Usersタブ
   - 登録されているユーザーのUIDを確認
   - 最終ログイン時刻を確認

3. Firestore Database → データタブ
   - `budget_book`コレクションを開く
   - 各ドキュメントの`user_id`フィールドを確認
   - データが存在するか確認

## 4. 手動デバッグコマンド

ブラウザのコンソールで実行：

```javascript
// 現在のユーザー情報を表示
firebase.auth().currentUser

// Firestoreのデータを直接確認
const db = firebase.firestore();
const user = firebase.auth().currentUser;
if (user) {
  db.collection('budget_book')
    .where('user_id', '==', user.uid)
    .get()
    .then(snapshot => {
      console.log('Documents found:', snapshot.size);
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    });
}
```

## 5. それでも解決しない場合

1. **ネットワーク環境を確認**
   - VPNを使用している場合は無効化
   - 別のWi-Fiネットワークで試す

2. **ブラウザの違いを確認**
   - PC: Chrome/Edge/Firefox
   - iPhone: Safari/Chrome

3. **PWAのキャッシュ問題**
   - iPhoneのホーム画面に追加している場合
   - アプリを削除して再インストール

## 6. ログの送信

問題が解決しない場合、以下の情報を収集：

1. PCのコンソールログ全体をコピー
2. iPhoneのコンソールログ全体をコピー
3. Firebase Console → Authenticationのスクリーンショット
4. Firebase Console → Firestoreのスクリーンショット

これらの情報があれば、問題の原因を特定しやすくなります。