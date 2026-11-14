$proc = Start-Process -FilePath "node.exe" -ArgumentList "D:\Moonix\frontend\node_modules\vite\bin\vite.js", "preview", "--port", "4173", "--host", "127.0.0.1" -WorkingDirectory "D:\Moonix\frontend" -PassThru
Start-Sleep -Seconds 3

try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:4173" -UseBasicParsing -TimeoutSec 5
    Write-Host "HTTP Status:" $res.StatusCode
} catch {
    Write-Host "HTTP Error:" $_
}

& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --no-sandbox --window-size=1440,1100 --screenshot="D:\Moonix\m2-dashboard.png" "http://127.0.0.1:4173"
Start-Sleep -Seconds 2

Stop-Process -Id $proc.Id -Force
Write-Host "File exists:" (Test-Path "D:\Moonix\m2-dashboard.png")
if (Test-Path "D:\Moonix\m2-dashboard.png") {
    Write-Host "File size:" (Get-Item "D:\Moonix\m2-dashboard.png").Length
}
