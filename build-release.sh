#!/bin/bash

# Java and Android environment setup
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "Building release APK for Google Play..."
cd android

# Build release APK
./gradlew assembleRelease

echo "Release APK location:"
find . -name "*release*.apk" -type f

echo "APK file sizes:"
ls -lh ./app/build/outputs/apk/*/*.apk