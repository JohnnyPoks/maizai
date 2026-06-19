#!/usr/bin/env node
/**
 * NDK 27 c++_shared fix
 *
 * NDK 27 changed libc++_shared.so ABI — packages compiled with NDK 27 headers
 * must explicitly link c++_shared instead of relying on it being transitively
 * available through libreactnative.so. This script patches the affected packages
 * after every `npm install`.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const nm = path.resolve(__dirname, '..', 'node_modules');

function applyFix(relPath, search, replacement) {
  const fullPath = path.join(nm, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  skip (not found): ${relPath}`);
    return;
  }
  // Normalize line endings so the script works on Windows and Linux
  let content = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
  if (content.includes('c++_shared')) {
    console.log(`  skip (already patched): ${relPath}`);
    return;
  }
  if (!content.includes(search)) {
    console.warn(`  WARN anchor not found in: ${relPath}`);
    return;
  }
  fs.writeFileSync(fullPath, content.replace(search, replacement), 'utf8');
  console.log(`  patched: ${relPath}`);
}

console.log('[ndk27-fix] Applying c++_shared patches for NDK 27...');

applyFix(
  'react-native-screens/android/CMakeLists.txt',
  '    fbjni::fbjni\n    android\n)',
  '    fbjni::fbjni\n    android\n    c++_shared\n)'
);

applyFix(
  'react-native-nitro-modules/android/CMakeLists.txt',
  '        ReactAndroid::jsi                         # <-- RN: JSI\n)',
  '        ReactAndroid::jsi                         # <-- RN: JSI\n        c++_shared\n)'
);

// worklets@0.8.3 puts all libs on two lines (multi-arg style)
applyFix(
  'react-native-worklets/android/CMakeLists.txt',
  'target_link_libraries(worklets android log ReactAndroid::reactnative ReactAndroid::jsi\n                      fbjni::fbjni)',
  'target_link_libraries(worklets android log ReactAndroid::reactnative ReactAndroid::jsi\n                      fbjni::fbjni c++_shared)'
);

// reanimated@4.3.1 does not ship c++_shared — add it before worklets
applyFix(
  'react-native-reanimated/android/CMakeLists.txt',
  '  android\n  react-native-worklets::worklets)',
  '  android\n  c++_shared\n  react-native-worklets::worklets)'
);

applyFix(
  'expo-modules-core/android/cmake/main.cmake',
  '  ${LOG_LIB}\n  android\n  ${JSEXECUTOR_LIB}',
  '  ${LOG_LIB}\n  android\n  c++_shared\n  ${JSEXECUTOR_LIB}'
);

applyFix(
  'react-native-fast-tflite/android/CMakeLists.txt',
  '        android\n        ${TFLITE}',
  '        android\n        c++_shared\n        ${TFLITE}'
);

applyFix(
  'react-native-gesture-handler/android/src/main/jni/CMakeLists.txt',
  '  ReactAndroid::jsi\n  fbjni::fbjni\n)',
  '  ReactAndroid::jsi\n  fbjni::fbjni\n  c++_shared\n)'
);

console.log('[ndk27-fix] Done.');
