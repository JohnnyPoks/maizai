# Install the locally-built debug APK to a connected Android device via ADB.
# Run from the mobile/ directory: npm run install:device

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    Write-Error "ADB not found at $adb. Ensure Android SDK platform-tools are installed."
    exit 1
}

$apk = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) {
    Write-Error "APK not found at $apk. Run 'npm run build:apk' first."
    exit 1
}

$devices = & $adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" }
if (-not $devices) {
    Write-Error "No Android device connected. Enable USB debugging and connect your phone."
    exit 1
}

Write-Host "Installing $(Split-Path $apk -Leaf) to device..." -ForegroundColor Cyan
& $adb install -r $apk
if ($LASTEXITCODE -eq 0) {
    Write-Host "Installed successfully. Launching app..." -ForegroundColor Green
    & $adb shell am start -n "cm.maizai.app/com.facebook.react.defaults.DefaultReactActivity" 2>$null
    if ($LASTEXITCODE -ne 0) {
        & $adb shell monkey -p cm.maizai.app -c android.intent.category.LAUNCHER 1 2>$null
    }
} else {
    Write-Error "Installation failed."
    exit 1
}
