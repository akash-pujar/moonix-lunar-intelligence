$proc = Start-Process -FilePath "node.exe" -ArgumentList "D:\Moonix\frontend\node_modules\vite\bin\vite.js", "preview", "--port", "4173", "--host", "127.0.0.1" -WorkingDirectory "D:\Moonix\frontend" -PassThru
Start-Sleep -Seconds 3

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artDir = "C:\Users\akash\.gemini\antigravity\brain\9dd44fba-6ccf-4f1a-86f2-eab38f471232"

& $chrome --headless=new --disable-gpu --no-sandbox --window-size=390,844 --virtual-time-budget=5000 --screenshot="$artDir\landing-mobile-390.png" "http://127.0.0.1:4173/"
Start-Sleep -Seconds 2

Stop-Process -Id $proc.Id -Force
Write-Host "Mobile capture status:" (Test-Path "$artDir\landing-mobile-390.png")
if (Test-Path "$artDir\landing-mobile-390.png") {
    Write-Host "Mobile size:" (Get-Item "$artDir\landing-mobile-390.png").Length
}
