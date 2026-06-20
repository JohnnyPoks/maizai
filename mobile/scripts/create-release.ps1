# Build the APK via WSL and publish a GitHub release with it as a downloadable asset.
# Prerequisites: gh CLI installed and authenticated (gh auth login).
# Run from the mobile/ directory: npm run release:create

param(
    [ValidateSet("patch","minor","major")]
    [string]$Bump = "patch"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- 1. Check prerequisites ---------------------------------------------------
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) not found. Install from https://cli.github.com/"
    exit 1
}

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

# -- 2. Read current version from package.json --------------------------------
$pkgPath = Join-Path $PSScriptRoot "..\package.json"
$pkg = Get-Content $pkgPath | ConvertFrom-Json
$current = [version]$pkg.version
switch ($Bump) {
    "patch" { $next = [version]"$($current.Major).$($current.Minor).$($current.Build + 1)" }
    "minor" { $next = [version]"$($current.Major).$($current.Minor + 1).0" }
    "major" { $next = [version]"$($current.Major + 1).0.0" }
}
$tag = "v$next"
Write-Host "Releasing $tag (was $current)" -ForegroundColor Cyan

# -- 3. Bump version in package.json ------------------------------------------
$pkg.version = "$next"
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
Write-Host "Updated package.json version to $next" -ForegroundColor Green

# -- 4. Build APK via WSL -----------------------------------------------------
Write-Host "Building APK via WSL..." -ForegroundColor Cyan
wsl -d Ubuntu -u root -- bash /mnt/d/Projects/Personal/maizai/mobile/scripts/build-android-wsl.sh
if ($LASTEXITCODE -ne 0) { Write-Error "WSL build failed."; exit 1 }

$apkSrc = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest = Join-Path $PSScriptRoot "..\build-output\maizai-$tag.apk"
New-Item -ItemType Directory -Force (Split-Path $apkDest) | Out-Null
Copy-Item $apkSrc $apkDest -Force
Write-Host "APK copied to $apkDest" -ForegroundColor Green

# -- 5. Commit version bump, tag, push ----------------------------------------
Push-Location (Join-Path $PSScriptRoot "..\..")
git add mobile/package.json
git commit -m "chore(release): bump version to $tag"
git tag $tag
git push origin main
git push origin $tag
Pop-Location
Write-Host "Pushed tag $tag" -ForegroundColor Green

# -- 6. Create GitHub release with APK ----------------------------------------
gh release create $tag $apkDest `
    --title "MaizAI $tag" `
    --notes "Android APK for MaizAI $tag. Install on any Android 7.0+ device." `
    --repo JohnnyPoks/maizai
Write-Host "GitHub release $tag created with APK asset." -ForegroundColor Green
Write-Host "Download URL will be available at: https://github.com/JohnnyPoks/maizai/releases/latest" -ForegroundColor Cyan
