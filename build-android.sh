#!/bin/bash

# Java and Android environment setup
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "Java version:"
java -version

echo "Building Android app..."
cd android

# Stop any existing Gradle daemon
./gradlew --stop

# Build debug APK
./gradlew assembleDebug

echo "APK location:"
find . -name "*.apk" -type f