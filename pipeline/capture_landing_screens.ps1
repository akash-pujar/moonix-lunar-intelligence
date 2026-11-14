$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artDir = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232"

# 1. Landing Hero (Desktop 1440x950)
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,950 --virtual-time-budget=4000 --screenshot="$artDir\landing-hero.png" "http://localhost:5173/"
Start-Sleep -Seconds 1

# 2. Existing Dashboard at /app (Desktop 1440x1100)
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=5000 --screenshot="$artDir\dashboard-app.png" "http://localhost:5173/app"
Start-Sleep -Seconds 1

# 3. Mobile Landing Page (Mobile 390x844)
& $chrome --headless=new --disable-gpu --no-sandbox --window-size=390,844 --virtual-time-budget=4000 --screenshot="$artDir\landing-mobile.png" "http://localhost:5173/"
Start-Sleep -Seconds 1

Write-Host "Hero size:" (Get-Item "$artDir\landing-hero.png").Length
Write-Host "Dashboard size:" (Get-Item "$artDir\dashboard-app.png").Length
Write-Host "Mobile size:" (Get-Item "$artDir\landing-mobile.png").Length
