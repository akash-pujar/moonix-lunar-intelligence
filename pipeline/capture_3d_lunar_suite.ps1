# capture_3d_lunar_suite.ps1 — Capture all refined 3D Moon and section screenshots with virtual time budget
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artDir = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232"
$baseUrl = "http://localhost:5173"

Write-Host "Verifying dev server connectivity on $baseUrl..."
try {
    $res = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Dev server responded: $($res.StatusCode)"
} catch {
    Write-Host "Warning: dev server check failed: $_"
}

# 1. Desktop Hero (Shackleton default)
Write-Host "Capturing 1. 3d-hero-desktop..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=5000 --screenshot="$artDir\3d-hero-desktop.png" "$baseUrl/?site=shackleton-rim"
Start-Sleep -Milliseconds 800

# 2. 3D Moon with Shackleton Selected
Write-Host "Capturing 2. 3d-moon-shackleton..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=5000 --screenshot="$artDir\3d-moon-shackleton.png" "$baseUrl/?site=shackleton-rim"
Start-Sleep -Milliseconds 800

# 3. 3D Moon with Malapert Selected
Write-Host "Capturing 3. 3d-moon-malapert..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=5000 --screenshot="$artDir\3d-moon-malapert.png" "$baseUrl/?site=malapert-massif"
Start-Sleep -Milliseconds 800

# 4. 3D Moon with Nobile Selected
Write-Host "Capturing 4. 3d-moon-nobile..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=5000 --screenshot="$artDir\3d-moon-nobile.png" "$baseUrl/?site=nobile-rim"
Start-Sleep -Milliseconds 800

# 5. 3D Moon with Apollo 11 Selected
Write-Host "Capturing 5. 3d-moon-apollo11..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=5000 --screenshot="$artDir\3d-moon-apollo11.png" "$baseUrl/?site=apollo-11"
Start-Sleep -Milliseconds 800

# 6. Capabilities Section
Write-Host "Capturing 6. capabilities-section..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=5000 --screenshot="$artDir\capabilities-section.png" "$baseUrl/#capabilities"
Start-Sleep -Milliseconds 800

# 7. Technology Section
Write-Host "Capturing 7. technology-section..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=5000 --screenshot="$artDir\technology-section.png" "$baseUrl/#technology"
Start-Sleep -Milliseconds 800

# 8. Existing Mission Dashboard at /app?site=shackleton-rim
Write-Host "Capturing 8. dashboard-site-shackleton..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=6000 --screenshot="$artDir\dashboard-site-shackleton.png" "$baseUrl/app?site=shackleton-rim"
Start-Sleep -Milliseconds 800

# 9. Mobile Landing Page Viewport
Write-Host "Capturing 9. landing-mobile-390..."
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=390,844 --virtual-time-budget=5000 --screenshot="$artDir\landing-mobile-390.png" "$baseUrl/?site=shackleton-rim"
Start-Sleep -Milliseconds 800

Write-Host "=== 3D SCREENSHOT SUITE COMPLETED ==="
$files = @(
    "3d-hero-desktop.png",
    "3d-moon-shackleton.png",
    "3d-moon-malapert.png",
    "3d-moon-nobile.png",
    "3d-moon-apollo11.png",
    "capabilities-section.png",
    "technology-section.png",
    "dashboard-site-shackleton.png",
    "landing-mobile-390.png"
)
foreach ($f in $files) {
    $p = "$artDir\$f"
    if (Test-Path $p) {
        Write-Host "$f : OK ($((Get-Item $p).Length) bytes)"
    } else {
        Write-Host "$f : MISSING"
    }
}
