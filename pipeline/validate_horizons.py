"""
MOONIX Ephemeris Validation Engine
==================================
Compares SPICE topocentric azimuth/elevation against NASA/JPL Horizons API
for multiple independent lunar sites and dates.
"""

import json
import math
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
import requests
import spiceypy as sp

KERNEL_DIR = Path(__file__).resolve().parent / "kernels"
ROOT_DIR = Path(__file__).resolve().parent.parent

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
        print(f"Missing kernel: {k}")
        sys.exit(1)
    sp.furnsh(str(k))

# Get Moon shape
radii = sp.bodvrd("MOON", "RADII", 3)[1]
r_equat = radii[0]
r_polar = radii[2]
f = (r_equat - r_polar) / r_equat

# Validation test cases across different sites, regions, and dates
TEST_CASES = [
    {
        "case_id": 1,
        "site_name": "Shackleton Rim",
        "lat": -89.54,
        "lon": 0.0,
        "alt_km": 0.002,
        "utc": "2027-03-01 12:00",
        "description": "South Pole extreme latitude, Artemis III candidate region",
    },
    {
        "case_id": 2,
        "site_name": "Malapert Massif",
        "lat": -86.00,
        "lon": 0.0,
        "alt_km": 0.002,
        "utc": "2027-07-15 00:00",
        "description": "South Pole mountain candidate, mid-year illumination",
    },
    {
        "case_id": 3,
        "site_name": "Nobile Rim",
        "lat": -85.30,
        "lon": 32.50,
        "alt_km": 0.002,
        "utc": "2027-11-20 18:00",
        "description": "South Pole eastern longitude, VIPER/CLPS region",
    },
    {
        "case_id": 4,
        "site_name": "Apollo 11 (Tranquility Base)",
        "lat": 0.674,
        "lon": 23.473,
        "alt_km": 0.002,
        "utc": "2027-04-10 06:00",
        "description": "Equatorial historic site, wide diurnal elevation swing",
    },
]

def query_horizons(command, site_coord, utc_str):
    """Query JPL Horizons API for apparent Azimuth and Elevation."""
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    
    dt = datetime.strptime(utc_str, "%Y-%m-%d %H:%M")
    t_start = dt.strftime("%Y-%m-%d %H:%M")
    t_stop = (dt + timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M")
    
    params = {
        "format": "json",
        "COMMAND": command,
        "CENTER": "coord@301",
        "COORD_TYPE": "GEODETIC",
        "SITE_COORD": f"{site_coord[0]},{site_coord[1]},{site_coord[2]}", # lon, lat, alt
        "START_TIME": t_start,
        "STOP_TIME": t_stop,
        "STEP_SIZE": "1h",
        "QUANTITIES": "4", # Apparent azimuth and elevation
    }
    
    for attempt in range(3):
        try:
            r = requests.get(url, params=params, timeout=20)
            data = r.json()
            res = data.get("result", "")
            if "$$SOE" in res and "$$EOE" in res:
                table = res.split("$$SOE")[1].split("$$EOE")[0].strip()
                lines = [line.strip() for line in table.split("\n") if line.strip()]
                if lines:
                    parts = lines[0].split()
                    # Line format: date, time, azimuth, elevation
                    az = float(parts[-2])
                    el = float(parts[-1])
                    return az, el
            print(f"Horizons parsing warning on attempt {attempt+1}: {res[-300:]}")
        except Exception as e:
            print(f"Horizons query attempt {attempt+1} failed: {e}")
            time.sleep(2)
            
    raise RuntimeError(f"Failed to get Horizons data for command={command} at {utc_str}")

def compute_spice(lat_deg, lon_deg, alt_km, utc_str):
    """Compute topocentric Sun and Earth (Az, El) using SPICE."""
    et = sp.str2et(utc_str.replace(" ", "T"))
    
    obs_pos_me = sp.georec(lon_deg * sp.rpd(), lat_deg * sp.rpd(), alt_km, r_equat, f)
    normal_me = sp.surfnm(r_equat, r_equat, r_polar, obs_pos_me)
    
    z_axis = [0.0, 0.0, 1.0]
    proj = sp.vdot(z_axis, normal_me)
    north_me = sp.vhat(sp.vsub(z_axis, sp.vscl(proj, normal_me)))
    east_me = sp.ucrss(north_me, normal_me)
    
    def get_body(target):
        pos_target_moon, _ = sp.spkpos(target, et, "MOON_ME", "LT+S", "MOON")
        r_topo = sp.vsub(pos_target_moon, obs_pos_me)
        r_hat = sp.vhat(r_topo)
        
        e_comp = sp.vdot(r_hat, east_me)
        n_comp = sp.vdot(r_hat, north_me)
        u_comp = sp.vdot(r_hat, normal_me)
        
        el_deg = math.degrees(math.asin(max(-1.0, min(1.0, u_comp))))
        az_deg = math.degrees(math.atan2(e_comp, n_comp)) % 360.0
        return az_deg, el_deg
        
    sun_az, sun_el = get_body("SUN")
    earth_az, earth_el = get_body("EARTH")
    return sun_az, sun_el, earth_az, earth_el

def run_validation():
    print("=" * 80)
    print("MOONIX SPICE vs NASA/JPL Horizons Scientific Validation")
    print("=" * 80)
    
    results = []
    all_deltas = []
    
    for tc in TEST_CASES:
        site_name = tc["site_name"]
        lat = tc["lat"]
        lon = tc["lon"]
        alt = tc["alt_km"]
        utc = tc["utc"]
        
        print(f"\nEvaluating Case {tc['case_id']}: {site_name} at {utc} UTC")
        print(f"  Coordinates: Lat={lat:.3f}°, Lon={lon:.3f}°, Alt={alt*1000:.0f}m")
        print(f"  Description: {tc['description']}")
        
        # SPICE calculation
        sp_sun_az, sp_sun_el, sp_earth_az, sp_earth_el = compute_spice(lat, lon, alt, utc)
        
        # Horizons calculation
        time.sleep(1.0) # Rate limit
        hz_sun_az, hz_sun_el = query_horizons("10", (lon, lat, alt), utc)
        time.sleep(1.0)
        hz_earth_az, hz_earth_el = query_horizons("399", (lon, lat, alt), utc)
        
        # Calculate angular deltas
        def az_diff(a1, a2):
            diff = abs(a1 - a2) % 360.0
            return diff if diff <= 180.0 else 360.0 - diff

        d_sun_az = az_diff(sp_sun_az, hz_sun_az)
        d_sun_el = abs(sp_sun_el - hz_sun_el)
        d_earth_az = az_diff(sp_earth_az, hz_earth_az)
        d_earth_el = abs(sp_earth_el - hz_earth_el)
        
        all_deltas.extend([d_sun_az, d_sun_el, d_earth_az, d_earth_el])
        
        status = "PASS" if max(d_sun_az, d_sun_el, d_earth_az, d_earth_el) < 0.1 else "FAIL"
        
        print(f"  Sun Azimuth:   SPICE={sp_sun_az:8.4f}° | Horizons={hz_sun_az:8.4f}° | Delta={d_sun_az:.4f}°")
        print(f"  Sun Elevation: SPICE={sp_sun_el:8.4f}° | Horizons={hz_sun_el:8.4f}° | Delta={d_sun_el:.4f}°")
        print(f"  Earth Azimuth: SPICE={sp_earth_az:8.4f}° | Horizons={hz_earth_az:8.4f}° | Delta={d_earth_az:.4f}°")
        print(f"  Earth Elev:    SPICE={sp_earth_el:8.4f}° | Horizons={hz_earth_el:8.4f}° | Delta={d_earth_el:.4f}°")
        print(f"  Status: [{status}] (threshold: < 0.1000°)")
        
        results.append({
            "case_id": tc["case_id"],
            "site": site_name,
            "utc": utc,
            "lat": lat,
            "lon": lon,
            "spice": {
                "sun_az": round(sp_sun_az, 4),
                "sun_el": round(sp_sun_el, 4),
                "earth_az": round(sp_earth_az, 4),
                "earth_el": round(sp_earth_el, 4),
            },
            "horizons": {
                "sun_az": round(hz_sun_az, 4),
                "sun_el": round(hz_sun_el, 4),
                "earth_az": round(hz_earth_az, 4),
                "earth_el": round(hz_earth_el, 4),
            },
            "deltas": {
                "sun_az": round(d_sun_az, 4),
                "sun_el": round(d_sun_el, 4),
                "earth_az": round(d_earth_az, 4),
                "earth_el": round(d_earth_el, 4),
            },
            "status": status,
        })

    mae = sum(all_deltas) / len(all_deltas)
    max_err = max(all_deltas)
    pass_count = sum(1 for r in results if r["status"] == "PASS")
    
    print("\n" + "=" * 80)
    print(f"AGGREGATE VALIDATION SUMMARY:")
    print(f"  Total Test Cases:    {len(results)}")
    print(f"  Pass Rate:           {pass_count}/{len(results)} ({pass_count/len(results)*100:.1f}%)")
    print(f"  Mean Absolute Error: {mae:.5f}°")
    print(f"  Max Absolute Error:  {max_err:.5f}°")
    print("=" * 80)
    
    val_json_path = ROOT_DIR / "pipeline" / "validation_results.json"
    with open(val_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "validation_epoch": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "mean_absolute_error_deg": round(mae, 5),
            "max_absolute_error_deg": round(max_err, 5),
            "pass_count": pass_count,
            "total_cases": len(results),
            "cases": results,
        }, f, indent=2)
    print(f"Validation report saved to: {val_json_path}")
    
    sp.kclear()
    return results

if __name__ == "__main__":
    run_validation()
