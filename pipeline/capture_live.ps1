$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outPng = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232\moonix-live-website.png"

& $chrome --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=6000 --screenshot=$outPng "http://localhost:5173/"
Start-Sleep -Seconds 2
Write-Host "Screenshot created:" (Test-Path $outPng)
if (Test-Path $outPng) {
    Write-Host "Size:" (Get-Item $outPng).Length
}

