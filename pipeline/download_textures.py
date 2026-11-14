import urllib.request
from pathlib import Path

TEXTURE_DIR = Path("frontend/public/textures")
TEXTURE_DIR.mkdir(parents=True, exist_ok=True)

urls = [
    ("https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_1k.jpg", TEXTURE_DIR / "moon_albedo.jpg"),
]

for url, target in urls:
    print(f"Downloading authentic NASA SVS texture: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=30) as resp, open(target, 'wb') as f:
            f.write(resp.read())
        print(f"Saved: {target} ({target.stat().st_size / 1024:.1f} KB)")
    except Exception as e:
        print(f"Download failed for {url}: {e}")

