import urllib.request
from pathlib import Path

TEXTURE_DIR = Path("frontend/public/textures")
candidate_urls = [
    "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit_1k.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_4_8bit_1k.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_64_uint_1k.jpg",
]

for url in candidate_urls:
    try:
        target = TEXTURE_DIR / "moon_bump.jpg"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=20) as resp, open(target, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded bump map from {url} ({target.stat().st_size / 1024:.1f} KB)")
        break
    except Exception as e:
        print(f"Failed {url}: {e}")
