#!/bin/bash

# Java and Android environment setup
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "📱 エミュレータの確認..."
adb devices

echo ""
echo "🔍 APKファイルの確認..."
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APKファイルが見つかりました"
    ls -lh android/app/build/outputs/apk/debug/app-debug.apk
else
    echo "❌ APKファイルが見つかりません。まずビルドしてください："
    echo "  ./build-android.sh"
    exit 1
fi

echo ""
echo "📲 APKをエミュレータにインストール中..."
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "🎉 インストール完了！"
echo "エミュレータで「高級資産トラッカー」アプリを探して起動してください。"