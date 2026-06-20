# Stream crash and error logs from a connected Android device for MaizAI.
# Run from the mobile/ directory: npm run logs:crash
# Press Ctrl+C to stop.

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    Write-Error "ADB not found at $adb. Ensure Android SDK platform-tools are installed."
    exit 1
}

$devices = & $adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" }
if (-not $devices) {
    Write-Error "No Android device connected. Enable USB debugging and connect your phone."
    exit 1
}

Write-Host "Streaming crash logs for cm.maizai.app. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host "Filters: AndroidRuntime (JVM crashes), ReactNativeJS (JS errors), FATAL" -ForegroundColor DarkGray
Write-Host "---" -ForegroundColor DarkGray

# Clear old logs then stream fresh ones
& $adb logcat -c
& $adb logcat -v time AndroidRuntime:E ReactNativeJS:E FATAL:V *:S
