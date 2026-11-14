$proc = Start-Process -FilePath "node.exe" -ArgumentList "D:\Moonix\frontend\node_modules\vite\bin\vite.js", "preview", "--port", "4173", "--host", "127.0.0.1" -WorkingDirectory "D:\Moonix\frontend" -PassThru
Start-Sleep -Seconds 3

try {
    $res1 = Invoke-WebRequest -Uri "http://127.0.0.1:4173/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Landing root status:" $res1.StatusCode "Length:" $res1.Content.Length
    $res2 = Invoke-WebRequest -Uri "http://127.0.0.1:4173/app?site=shackleton-rim" -UseBasicParsing -TimeoutSec 5
    Write-Host "App status:" $res2.StatusCode "Length:" $res2.Content.Length
} catch {
    Write-Host "HTTP error:" $_
}

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artDir = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232"

# 1. Desktop Hero (Shackleton default)
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=6000 --screenshot="$artDir\3d-hero-desktop.png" "http://127.0.0.1:4173/?site=shackleton-rim"
Start-Sleep -Seconds 1

# 2. 3D Moon with Shackleton Selected
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=6000 --screenshot="$artDir\3d-moon-shackleton.png" "http://127.0.0.1:4173/?site=shackleton-rim"
Start-Sleep -Seconds 1

# 3. 3D Moon with Malapert Selected
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=6000 --screenshot="$artDir\3d-moon-malapert.png" "http://127.0.0.1:4173/?site=malapert-massif"
Start-Sleep -Seconds 1

# 4. 3D Moon with Nobile Selected
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=6000 --screenshot="$artDir\3d-moon-nobile.png" "http://127.0.0.1:4173/?site=nobile-rim"
Start-Sleep -Seconds 1

# 5. 3D Moon with Apollo 11 Selected
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=6000 --screenshot="$artDir\3d-moon-apollo11.png" "http://127.0.0.1:4173/?site=apollo-11"
Start-Sleep -Seconds 1

# 6. Capabilities Section
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=5000 --screenshot="$artDir\capabilities-section.png" "http://127.0.0.1:4173/#capabilities"
Start-Sleep -Seconds 1

# 7. Technology Section
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=5000 --screenshot="$artDir\technology-section.png" "http://127.0.0.1:4173/#technology"
Start-Sleep -Seconds 1

# 8. Existing Mission Dashboard at /app?site=shackleton-rim
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=6000 --screenshot="$artDir\dashboard-site-shackleton.png" "http://127.0.0.1:4173/app?site=shackleton-rim"
Start-Sleep -Seconds 1

# 9. Mobile Landing Page
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=390,844 --virtual-time-budget=5000 --screenshot="$artDir\landing-mobile-390.png" "http://127.0.0.1:4173/"
Start-Sleep -Seconds 1

Stop-Process -Id $proc.Id -Force

Write-Host "=== 3D SCREENSHOT SUITE VERIFICATION ==="
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
