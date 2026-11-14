"""
MOONIX Ephemeris Generation Engine
==================================
Generates high-precision topocentric hourly ephemeris datasets for lunar landing
sites using NASA NAIF SPICE kernels (DE440 planetary ephemeris, DE421 lunar orientation).
Output conforms to the MOONIX SiteEphemeris JSON schema.
"""

import json
import math
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
import spiceypy as sp

ROOT_DIR = Path(__file__).resolve().parent.parent
KERNEL_DIR = Path(__file__).resolve().parent / "kernels"
PUBLIC_EPH_DIR = ROOT_DIR / "frontend" / "public" / "data" / "ephemeris"
DIST_EPH_DIR = ROOT_DIR / "frontend" / "dist" / "data" / "ephemeris"

PUBLIC_EPH_DIR.mkdir(parents=True, exist_ok=True)
DIST_EPH_DIR.mkdir(parents=True, exist_ok=True)

# 1. Furnish SPICE kernels
KERNELS = [
    KERNEL_DIR / "naif0012.tls",
    KERNEL_DIR / "pck00011.tpc",
    KERNEL_DIR / "moon_080317.tf",
    KERNEL_DIR / "moon_assoc_me.tf",
    KERNEL_DIR / "moon_pa_de421_1900-2050.bpc",
    KERNEL_DIR / "de440s.bsp",
]

for k in KERNELS:
    if not k.exists():
        print(f"Error: Missing required kernel: {k}")
        sys.exit(1)
    sp.furnsh(str(k))

# Lunar shape constants from PCK
radii = sp.bodvrd("MOON", "RADII", 3)[1]
r_equat = radii[0]
r_polar = radii[2]
f = (r_equat - r_polar) / r_equat

# 4 Initial Target Sites for M2
TARGET_SITES = [
    {
        "id": "shackleton-rim",
        "name": "Shackleton Rim",
        "lat": -89.54,
        "lon": 0.0,
        "alt_km": 0.002,
    },
    {
        "id": "malapert-massif",
        "name": "Malapert Massif",
        "lat": -86.0,
        "lon": 0.0,
        "alt_km": 0.002,
    },
    {
        "id": "nobile-rim",
        "name": "Nobile Rim",
        "lat": -85.3,
        "lon": 32.5,
        "alt_km": 0.002,
    },
    {
        "id": "apollo-11",
        "name": "Apollo 11 (Tranquility Base)",
        "lat": 0.674,
        "lon": 23.473,
        "alt_km": 0.002,
    },
]

def generate_site_ephemeris(site, start_utc, end_utc, step_seconds=3600):
    site_id = site["id"]
    lat_deg = site["lat"]
    lon_deg = site["lon"]
    alt_km = site["alt_km"]
    
    print(f"\nComputing SPICE topocentric ephemeris for: {site['name']} ({site_id})")
    print(f"  Coordinates: Lat={lat_deg:.4f}°, Lon={lon_deg:.4f}°, Alt={alt_km*1000:.1f} m")
    print(f"  Range: {start_utc} to {end_utc} (step = {step_seconds}s)")
    
    # Observer position in MOON_ME frame (fixed)
    radii_arr = sp.bodvrd("MOON", "RADII", 3)[1]
    re = radii_arr[0]
    rp = radii_arr[2]
    flat = (re - rp) / re
    obs_pos_me = sp.georec(lon_deg * sp.rpd(), lat_deg * sp.rpd(), alt_km, re, flat)
    normal_me = sp.surfnm(re, re, rp, obs_pos_me)
    
    z_axis = [0.0, 0.0, 1.0]
    proj = sp.vdot(z_axis, normal_me)
    north_me = sp.vhat(sp.vsub(z_axis, sp.vscl(proj, normal_me)))
    east_me = sp.ucrss(north_me, normal_me)
    
    start_dt = datetime.strptime(start_utc, "%Y-%m-%dT%H:%M:%SZ")
    end_dt = datetime.strptime(end_utc, "%Y-%m-%dT%H:%M:%SZ")
    total_seconds = int((end_dt - start_dt).total_seconds())
    num_steps = total_seconds // step_seconds + 1
    
    timestamps = []
    data = []
    
    t0 = time.time()
    for i in range(num_steps):
        cur_dt = start_dt + timedelta(seconds=i * step_seconds)
        iso_str = cur_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        et = sp.str2et(iso_str)
        
        # Sun vector
        sun_pos_moon, _ = sp.spkpos("SUN", et, "MOON_ME", "LT+S", "MOON")
        r_sun_topo = sp.vsub(sun_pos_moon, obs_pos_me)
        r_sun_hat = sp.vhat(r_sun_topo)
        
        sun_e = sp.vdot(r_sun_hat, east_me)
        sun_n = sp.vdot(r_sun_hat, north_me)
        sun_u = sp.vdot(r_sun_hat, normal_me)
        
        sun_el = math.degrees(math.asin(max(-1.0, min(1.0, sun_u))))
        sun_az = math.degrees(math.atan2(sun_e, sun_n)) % 360.0
        
        # Earth vector
        earth_pos_moon, _ = sp.spkpos("EARTH", et, "MOON_ME", "LT+S", "MOON")
        r_earth_topo = sp.vsub(earth_pos_moon, obs_pos_me)
        r_earth_hat = sp.vhat(r_earth_topo)
        
        earth_e = sp.vdot(r_earth_hat, east_me)
        earth_n = sp.vdot(r_earth_hat, north_me)
        earth_u = sp.vdot(r_earth_hat, normal_me)
        
        earth_el = math.degrees(math.asin(max(-1.0, min(1.0, earth_u))))
        earth_az = math.degrees(math.atan2(earth_e, earth_n)) % 360.0
        
        timestamps.append(iso_str)
        data.append([
            round(sun_az, 2),
            round(sun_el, 2),
            round(earth_az, 2),
            round(earth_el, 2),
        ])
        
    duration = time.time() - t0
    print(f"  Calculated {len(data)} hourly observations in {duration:.2f} seconds ({len(data)/duration:.0f} pts/sec).")
    
    ephemeris_obj = {
        "siteId": site_id,
        "source": "SPICE",
        "startTime": timestamps[0],
        "endTime": timestamps[-1],
        "stepSeconds": step_seconds,
        "quality": "nominal",
        "count": len(data),
        "frame": "MOON_ME",
        "kernelsUsed": [
            "naif0012.tls",
            "pck00011.tpc",
            "moon_080317.tf",
            "moon_assoc_me.tf",
            "moon_pa_de421_1900-2050.bpc",
            "de440s.bsp",
        ],
        "aberrationCorrection": "LT+S (Light-Time and Stellar Aberration)",
        "generated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "data": data,
        "timestamps": timestamps,
    }
    
    # Save to public and dist
    pub_file = PUBLIC_EPH_DIR / f"{site_id}.json"
    dist_file = DIST_EPH_DIR / f"{site_id}.json"
    
    content = json.dumps(ephemeris_obj)
    with open(pub_file, "w", encoding="utf-8") as f:
        f.write(content)
    with open(dist_file, "w", encoding="utf-8") as f:
        f.write(content)
        
    file_size_kb = pub_file.stat().st_size / 1024
    print(f"  Wrote: {pub_file} ({file_size_kb:.1f} KB)")
    return ephemeris_obj

def update_manifest(generated_sites, start_utc, end_utc):
    manifest_path = ROOT_DIR / "frontend" / "public" / "data" / "manifest.json"
    dist_manifest_path = ROOT_DIR / "frontend" / "dist" / "data" / "manifest.json"
    
    manifest_data = {
        "version": "2.0.0",
        "generated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "timeRange": {
            "start": start_utc,
            "end": end_utc,
        },
        "stepSeconds": 3600,
        "coordinateFrame": "MOON_ME",
        "aberration": "LT+S",
        "sites": []
    }
    
    for s in generated_sites:
        manifest_data["sites"].append({
            "siteId": s["id"],
            "name": s["name"],
            "ephemerisFile": f"/data/ephemeris/{s['id']}.json",
            "horizonFile": None,
            "source": "SPICE",
            "quality": "nominal",
        })
        
    for p in [manifest_path, dist_manifest_path]:
        with open(p, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)
            
    print(f"\nUpdated data manifest at: {manifest_path}")

def main():
    # Covers the 30-day primary mission window (2027-03-01 +/- 30 days) plus buffer:
    # 2027-01-01 to 2027-06-30 (180 days = ~4,320 points per site, ~300 KB per site)
    # This delivers fast downloads (< 350 KB uncompressed, ~60 KB gzipped) while fully covering
    # the 30-day mission timeline and date slip testing.
    START_UTC = "2027-01-01T00:00:00Z"
    END_UTC = "2027-06-30T23:00:00Z"
    
    print("=" * 80)
    print("MOONIX M2 Production SPICE Ephemeris Generator")
    print("=" * 80)
    
    for site in TARGET_SITES:
        generate_site_ephemeris(site, START_UTC, END_UTC)
        
    update_manifest(TARGET_SITES, START_UTC, END_UTC)
    
    sp.kclear()
    print("\n[SUCCESS] M2 Ephemeris Generation Complete for all 4 sites.")

if __name__ == "__main__":
    main()
