# capture_dashboard_suite.ps1 — Capture high-resolution mission control dashboard screenshots with process wait
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artDir = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232"
$baseUrl = "http://localhost:5173"

function Take-Screenshot($name, $url, $width, $height) {
    Write-Host "Capturing $name ($width x $height)..."
    $outPath = "$artDir\$name"
    $args = @(
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=$width,$height",
        "--virtual-time-budget=6000",
        "--screenshot=$outPath",
        $url
    )
    $proc = Start-Process -FilePath $chrome -ArgumentList $args -PassThru -Wait
    Start-Sleep -Milliseconds 600
    if (Test-Path $outPath) {
        $len = (Get-Item $outPath).Length
        Write-Host "Saved: $name ($len bytes)"
    } else {
        Write-Host "Failed to save: $name"
    }
}

# 1. Desktop Mission Control Dashboard (1920x1080 full aerospace view - Planner Mode)
Take-Screenshot "dashboard-mission-control-desktop.png" "$baseUrl/app?site=shackleton-rim&mode=planner" 1920 1080

# 2. Explorer Mode with 3D Lunar Globe (1440x1100)
Take-Screenshot "dashboard-explorer-mode.png" "$baseUrl/app?site=shackleton-rim&mode=explorer" 1440 1100

# 3. Desktop Standard 1440x1100 Shackleton Rim
Take-Screenshot "dashboard-site-shackleton.png" "$baseUrl/app?site=shackleton-rim&mode=planner" 1440 1100

# 4. Desktop Malapert Massif (SPICE Verified)
Take-Screenshot "dashboard-site-malapert.png" "$baseUrl/app?site=malapert-massif&mode=planner" 1440 1100

# 5. Mobile Viewport (390x844 iPhone standard)
Take-Screenshot "dashboard-mobile-390.png" "$baseUrl/app?site=shackleton-rim&mode=planner" 390 844

# 6. Tablet Viewport (768x1024 iPad standard)
Take-Screenshot "dashboard-tablet-768.png" "$baseUrl/app?site=shackleton-rim&mode=planner" 768 1024

Write-Host "=== DASHBOARD SCREENSHOT SUITE COMPLETED ==="
