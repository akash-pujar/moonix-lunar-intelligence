$proc = Start-Process -FilePath "node.exe" -ArgumentList "D:\Moonix\frontend\node_modules\vite\bin\vite.js", "preview", "--port", "4173", "--host", "127.0.0.1" -WorkingDirectory "D:\Moonix\frontend" -PassThru
Start-Sleep -Seconds 3

try {
    $res1 = Invoke-WebRequest -Uri "http://127.0.0.1:4173/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Landing root status:" $res1.StatusCode "Length:" $res1.Content.Length
    $res2 = Invoke-WebRequest -Uri "http://127.0.0.1:4173/app" -UseBasicParsing -TimeoutSec 5
    Write-Host "App status:" $res2.StatusCode "Length:" $res2.Content.Length
} catch {
    Write-Host "HTTP error:" $_
}

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artDir = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232"

# 1. Landing Hero
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=5000 --screenshot="$artDir\landing-hero.png" "http://127.0.0.1:4173/"
Start-Sleep -Seconds 1

# 2. Capabilities Section
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1050 --virtual-time-budget=5000 --screenshot="$artDir\landing-capabilities.png" "http://127.0.0.1:4173/#capabilities"
Start-Sleep -Seconds 1

# 3. Technology Section
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1050 --virtual-time-budget=5000 --screenshot="$artDir\landing-technology.png" "http://127.0.0.1:4173/#technology"
Start-Sleep -Seconds 1

# 4. Existing Dashboard at /app
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=6000 --screenshot="$artDir\dashboard-app.png" "http://127.0.0.1:4173/app"
Start-Sleep -Seconds 1

# 5. Mobile Landing Page
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=390,844 --virtual-time-budget=5000 --screenshot="$artDir\landing-mobile.png" "http://127.0.0.1:4173/"
Start-Sleep -Seconds 1

Stop-Process -Id $proc.Id -Force

Write-Host "=== SCREENSHOT VERIFICATION ==="
$shots = @("landing-hero.png", "landing-capabilities.png", "landing-technology.png", "dashboard-app.png", "landing-mobile.png")
foreach ($s in $shots) {
    $p = "$artDir\$s"
    if (Test-Path $p) {
        Write-Host "$s : OK ($((Get-Item $p).Length) bytes)"
    } else {
        Write-Host "$s : MISSING"
    }
}

