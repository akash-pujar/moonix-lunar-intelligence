import json
import math
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
import requests
import spiceypy as sp

KERNEL_DIR = Path("pipeline/kernels")
KERNELS = [
    KERNEL_DIR / "naif0012.tls",
    KERNEL_DIR / "pck00011.tpc",
    KERNEL_DIR / "moon_080317.tf",
    KERNEL_DIR / "moon_assoc_me.tf",
    KERNEL_DIR / "moon_pa_de421_1900-2050.bpc",
    KERNEL_DIR / "de440s.bsp",
]
for k in KERNELS:
    sp.furnsh(str(k))

radii = sp.bodvrd("MOON", "RADII", 3)[1]
re, rp = radii[0], radii[2]
f = (re - rp) / re

TEST_CASES = [
    {
        "case_id": 1,
        "site_name": "Shackleton Rim",
        "lat": -89.54,
        "lon": 0.0,
        "alt_km": 0.002,
        "utc": "2027-03-01 12:00",
        "description": "South Pole extreme latitude, Artemis candidate region",
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
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    dt = datetime.strptime(utc_str, "%Y-%m-%d %H:%M")
    t_start = dt.strftime("%Y-%m-%d %H:%M")
    t_stop = (dt + timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M")
    
    params = {
        "format": "json",
        "COMMAND": command,
        "CENTER": "coord@301",
        "COORD_TYPE": "GEODETIC",
        "SITE_COORD": f"{site_coord[0]},{site_coord[1]},{site_coord[2]}",
        "START_TIME": t_start,
        "STOP_TIME": t_stop,
        "STEP_SIZE": "1h",
        "QUANTITIES": "4",
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
                    az = float(parts[-2])
                    el = float(parts[-1])
                    return az, el
        except Exception as e:
            time.sleep(2)
    raise RuntimeError(f"Horizons query failed for {command} at {utc_str}")

def compute_spice_both_methods(lat_deg, lon_deg, alt_km, utc_str):
    et = sp.str2et(utc_str.replace(" ", "T"))
    obs_pos_me = sp.georec(lon_deg * sp.rpd(), lat_deg * sp.rpd(), alt_km, re, f)
    normal_me = sp.surfnm(re, re, rp, obs_pos_me)
    z_axis = [0.0, 0.0, 1.0]
    proj = sp.vdot(z_axis, normal_me)
    north_me = sp.vhat(sp.vsub(z_axis, sp.vscl(proj, normal_me)))
    east_me = sp.ucrss(north_me, normal_me)
    
    def topo_from_vector(v):
        r_hat = sp.vhat(v)
        e = sp.vdot(r_hat, east_me)
        n = sp.vdot(r_hat, north_me)
        u = sp.vdot(r_hat, normal_me)
        el = math.degrees(math.asin(max(-1.0, min(1.0, u))))
        az = math.degrees(math.atan2(e, n)) % 360.0
        return az, el

    # Method 1: spkpos center + subtract obs_pos
    sun_pos1, _ = sp.spkpos("SUN", et, "MOON_ME", "LT+S", "MOON")
    earth_pos1, _ = sp.spkpos("EARTH", et, "MOON_ME", "LT+S", "MOON")
    s_az1, s_el1 = topo_from_vector(sp.vsub(sun_pos1, obs_pos_me))
    e_az1, e_el1 = topo_from_vector(sp.vsub(earth_pos1, obs_pos_me))

    # Method 2: spkcpo topocentric observer
    sun_state2, _ = sp.spkcpo("SUN", et, "MOON_ME", "OBSERVER", "LT+S", obs_pos_me, "MOON", "MOON_ME")
    earth_state2, _ = sp.spkcpo("EARTH", et, "MOON_ME", "OBSERVER", "LT+S", obs_pos_me, "MOON", "MOON_ME")
    s_az2, s_el2 = topo_from_vector(sun_state2[:3])
    e_az2, e_el2 = topo_from_vector(earth_state2[:3])

    return (s_az1, s_el1, e_az1, e_el1), (s_az2, s_el2, e_az2, e_el2)

def az_diff(a1, a2):
    diff = abs(a1 - a2) % 360.0
    return diff if diff <= 180.0 else 360.0 - diff

print("=" * 90)
print("INDEPENDENT REPRODUCTION OF 4 VALIDATION CASES")
print("=" * 90)

detailed_results = []
all_deltas_m1 = []
all_deltas_m2 = []

for tc in TEST_CASES:
    lat, lon, alt, utc = tc["lat"], tc["lon"], tc["alt_km"], tc["utc"]
    print(f"\n--- Case {tc['case_id']}: {tc['site_name']} ({utc} UTC) ---")
    
    (s_az1, s_el1, e_az1, e_el1), (s_az2, s_el2, e_az2, e_el2) = compute_spice_both_methods(lat, lon, alt, utc)
    
    time.sleep(1.0)
    hz_sun_az, hz_sun_el = query_horizons("10", (lon, lat, alt), utc)
    time.sleep(1.0)
    hz_earth_az, hz_earth_el = query_horizons("399", (lon, lat, alt), utc)
    
    # Deltas for M1
    d_sun_az1 = az_diff(s_az1, hz_sun_az)
    d_sun_el1 = abs(s_el1 - hz_sun_el)
    d_earth_az1 = az_diff(e_az1, hz_earth_az)
    d_earth_el1 = abs(e_el1 - hz_earth_el)
    all_deltas_m1.extend([d_sun_az1, d_sun_el1, d_earth_az1, d_earth_el1])

    # Deltas for M2 (spkcpo)
    d_sun_az2 = az_diff(s_az2, hz_sun_az)
    d_sun_el2 = abs(s_el2 - hz_sun_el)
    d_earth_az2 = az_diff(e_az2, hz_earth_az)
    d_earth_el2 = abs(e_el2 - hz_earth_el)
    all_deltas_m2.extend([d_sun_az2, d_sun_el2, d_earth_az2, d_earth_el2])
    
    print(f"Sun Azimuth:   SPICE_m1={s_az1:10.5f}° | SPICE_m2={s_az2:10.5f}° | Horizons={hz_sun_az:10.4f}° | Δ1={d_sun_az1:.5f}° | Δ2={d_sun_az2:.5f}°")
    print(f"Sun Elev:      SPICE_m1={s_el1:10.5f}° | SPICE_m2={s_el2:10.5f}° | Horizons={hz_sun_el:10.4f}° | Δ1={d_sun_el1:.5f}° | Δ2={d_sun_el2:.5f}°")
    print(f"Earth Azimuth: SPICE_m1={e_az1:10.5f}° | SPICE_m2={e_az2:10.5f}° | Horizons={hz_earth_az:10.4f}° | Δ1={d_earth_az1:.5f}° | Δ2={d_earth_az2:.5f}°")
    print(f"Earth Elev:    SPICE_m1={e_el1:10.5f}° | SPICE_m2={e_el2:10.5f}° | Horizons={hz_earth_el:10.4f}° | Δ1={d_earth_el1:.5f}° | Δ2={d_earth_el2:.5f}°")
    
    detailed_results.append({
        "case_id": tc["case_id"],
        "site": tc["site_name"],
        "utc": utc,
        "spice_m1": {"sun_az": s_az1, "sun_el": s_el1, "earth_az": e_az1, "earth_el": e_el1},
        "spice_m2": {"sun_az": s_az2, "sun_el": s_el2, "earth_az": e_az2, "earth_el": e_el2},
        "horizons": {"sun_az": hz_sun_az, "sun_el": hz_sun_el, "earth_az": hz_earth_az, "earth_el": hz_earth_el},
        "deltas_m1": {"sun_az": d_sun_az1, "sun_el": d_sun_el1, "earth_az": d_earth_az1, "earth_el": d_earth_el1},
        "deltas_m2": {"sun_az": d_sun_az2, "sun_el": d_sun_el2, "earth_az": d_earth_az2, "earth_el": d_earth_el2},
    })

print("\n" + "=" * 90)
print(f"METHOD 1 (spkpos MOON + vector subtraction):")
print(f"  MAE:     {sum(all_deltas_m1)/len(all_deltas_m1):.6f}° ({sum(all_deltas_m1)/len(all_deltas_m1)*3600:.3f} arcsec)")
print(f"  Max Err: {max(all_deltas_m1):.6f}° ({max(all_deltas_m1)*3600:.3f} arcsec)")
print(f"METHOD 2 (spkcpo topocentric LT+S):")
print(f"  MAE:     {sum(all_deltas_m2)/len(all_deltas_m2):.6f}° ({sum(all_deltas_m2)/len(all_deltas_m2)*3600:.3f} arcsec)")
print(f"  Max Err: {max(all_deltas_m2):.6f}° ({max(all_deltas_m2)*3600:.3f} arcsec)")
print("=" * 90)

with open("pipeline/audit_validation_reproduced.json", "w") as f:
    json.dump({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "summary_m1": {
            "mae_deg": sum(all_deltas_m1)/len(all_deltas_m1),
            "max_err_deg": max(all_deltas_m1),
        },
        "summary_m2": {
            "mae_deg": sum(all_deltas_m2)/len(all_deltas_m2),
            "max_err_deg": max(all_deltas_m2),
        },
        "cases": detailed_results,
    }, f, indent=2)

sp.kclear()

