"""
MOONIX SPICE Kernel Downloader
==============================
Downloads authenticated NAIF SPICE kernels required for lunar topocentric
ephemeris generation. Computes SHA-256 checksums and writes a kernel manifest.
"""

import hashlib
import os
import sys
import urllib.request
from pathlib import Path

KERNEL_DIR = Path(__file__).resolve().parent / "kernels"
KERNEL_DIR.mkdir(parents=True, exist_ok=True)

# Canonical NAIF repository URLs
NAIF_BASE = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels"

KERNELS = [
    {
        "filename": "naif0012.tls",
        "url": f"{NAIF_BASE}/lsk/naif0012.tls",
        "desc": "Leapseconds kernel (UTC <-> TDB conversion)",
    },
    {
        "filename": "pck00011.tpc",
        "url": f"{NAIF_BASE}/pck/pck00011.tpc",
        "desc": "Planetary constants kernel (radii and gravitational parameters)",
    },
    {
        "filename": "moon_080317.tf",
        "url": f"{NAIF_BASE}/fk/satellites/moon_080317.tf",
        "desc": "Lunar frames definition kernel (defines MOON_ME and MOON_PA)",
    },
    {
        "filename": "moon_assoc_me.tf",
        "url": f"{NAIF_BASE}/fk/satellites/moon_assoc_me.tf",
        "desc": "Lunar frame association kernel (links Moon body 301 to MOON_ME)",
    },
    {
        "filename": "moon_pa_de440_200625.bpc",
        "url": f"{NAIF_BASE}/pck/moon_pa_de440_200625.bpc",
        "desc": "High-precision lunar orientation binary PCK (DE440-based libration)",
    },
    {
        "filename": "de440s.bsp",
        "url": f"{NAIF_BASE}/spk/planets/de440s.bsp",
        "desc": "DE440 small planetary ephemeris (Sun, Earth, Moon 1950-2050)",
    },
]

def sha256_file(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def download_kernels():
    manifest = []
    print(f"Downloading SPICE kernels to: {KERNEL_DIR}")
    
    for item in KERNELS:
        target = KERNEL_DIR / item["filename"]
        if target.exists() and target.stat().st_size > 0:
            print(f"  [EXISTS] {item['filename']} ({target.stat().st_size / 1024:.1f} KB)")
        else:
            print(f"  [DOWNLOADING] {item['filename']} from {item['url']} ...")
            try:
                urllib.request.urlretrieve(item["url"], target)
                print(f"  [DONE] {item['filename']} ({target.stat().st_size / 1024:.1f} KB)")
            except Exception as e:
                print(f"  [ERROR] Failed to download {item['filename']}: {e}")
                sys.exit(1)
        
        checksum = sha256_file(target)
        manifest.append({
            "filename": item["filename"],
            "description": item["desc"],
            "size_bytes": target.stat().st_size,
            "sha256": checksum,
            "source": item["url"],
        })

    # Write manifest
    import json
    manifest_path = KERNEL_DIR / "kernel_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Kernel manifest written to {manifest_path}")

if __name__ == "__main__":
    download_kernels()

