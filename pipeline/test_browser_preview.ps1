$proc = Start-Process -FilePath "node.exe" -ArgumentList "D:\Moonix\frontend\node_modules\vite\bin\vite.js", "preview", "--port", "4173", "--host", "127.0.0.1" -WorkingDirectory "D:\Moonix\frontend" -PassThru
Start-Sleep -Seconds 3

try {
    $manifestRes = Invoke-WebRequest -Uri "http://127.0.0.1:4173/data/manifest.json" -UseBasicParsing -TimeoutSec 5
    Write-Host "Manifest HTTP Status:" $manifestRes.StatusCode "Length:" $manifestRes.Content.Length
    
    $ephRes = Invoke-WebRequest -Uri "http://127.0.0.1:4173/data/ephemeris/shackleton-rim.json" -UseBasicParsing -TimeoutSec 5
    Write-Host "Shackleton Ephemeris HTTP Status:" $ephRes.StatusCode "Length:" $ephRes.Content.Length
} catch {
    Write-Host "HTTP Load Error:" $_
}

& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --virtual-time-budget=6000 --screenshot="D:\Moonix\audit-m2-dashboard.png" "http://127.0.0.1:4173"
Start-Sleep -Seconds 2

Stop-Process -Id $proc.Id -Force
Write-Host "Screenshot captured:" (Test-Path "D:\Moonix\audit-m2-dashboard.png")
if (Test-Path "D:\Moonix\audit-m2-dashboard.png") {
    Write-Host "Screenshot Size:" (Get-Item "D:\Moonix\audit-m2-dashboard.png").Length
}

