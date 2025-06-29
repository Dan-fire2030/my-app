# 高級資産トラッカー - Android版

## 📱 Google Play リリース準備完了

### ✅ 生成されたファイル
- **デバッグ版**: `android/app/build/outputs/apk/debug/app-debug.apk` (4.2MB)
- **リリース版**: `android/app/build/outputs/apk/release/app-release-unsigned.apk` (3.3MB)

## 🚀 ビルドコマンド

### Java環境設定
```bash
# ~/.zshrcに以下が追加済み
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
```

### ビルド実行
```bash
# デバッグ版ビルド
./build-android.sh

# リリース版ビルド
./build-release.sh

# 手動ビルド（環境変数設定済みの場合）
cd android
./gradlew assembleDebug    # デバッグ版
./gradlew assembleRelease  # リリース版
```

## 📋 アプリ情報
- **アプリ名**: 高級資産トラッカー
- **パッケージID**: com.luxurywealth.tracker
- **最小SDK**: 23 (Android 6.0)
- **ターゲットSDK**: 34 (Android 14)
- **Java**: 17

## 🎯 Google Play Store 準備

### 1. APKの署名
Google Playにアップロードする前に、リリースAPKに署名が必要です：

```bash
# キーストア生成（初回のみ）
keytool -genkey -v -keystore release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# APKに署名
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore app-release-unsigned.apk my-key-alias

# zipalign（最適化）
zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
```

### 2. 必要な情報
- プライバシーポリシーURL
- アプリの説明文（日本語・英語）
- スクリーンショット（複数サイズ）
- アプリアイコン（各解像度）✅ 設定済み

## 🔧 開発用コマンド

```bash
# ソースコード更新後の同期
npm run build
npx cap sync

# Android Studioで開く
npm run android:open

# エミュレータで実行
npm run android:run
```

## 📱 モバイル最適化済み機能
- ✅ レスポンシブデザイン
- ✅ タッチフレンドリーUI（最小56pxボタン）
- ✅ ダークテーマステータスバー
- ✅ 高DPI対応アイコン
- ✅ スプラッシュスクリーン

アプリはGoogle Playストアにアップロード可能な状態です！