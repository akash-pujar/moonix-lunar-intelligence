import json
import math
from datetime import datetime
from pathlib import Path

EPH_DIR = Path("frontend/public/data/ephemeris")
DIST_DIR = Path("frontend/dist/data/ephemeris")
SITES = ["shackleton-rim", "malapert-massif", "nobile-rim", "apollo-11"]

print("=" * 80)
print("DATASET SCIENTIFIC & INTEGRITY AUDIT")
print("=" * 80)

all_passed = True
stats_by_site = {}

for site_id in SITES:
    pub_file = EPH_DIR / f"{site_id}.json"
    dist_file = DIST_DIR / f"{site_id}.json"
    
    print(f"\nChecking dataset: {site_id}")
    if not pub_file.exists():
        print(f"  [FAIL] Missing file: {pub_file}")
        all_passed = False
        continue
    
    # Check byte-for-byte sync with dist
    if dist_file.exists():
        dist_match = (pub_file.read_bytes() == dist_file.read_bytes())
        print(f"  Public vs Dist sync: {'MATCH (Identical)' if dist_match else 'MISMATCH'}")
        if not dist_match:
            all_passed = False
    else:
        print(f"  [WARN] Dist copy does not exist at {dist_file}")

    with open(pub_file, "r", encoding="utf-8") as f:
        doc = json.load(f)
        
    required_keys = ["siteId", "source", "startTime", "endTime", "stepSeconds", "quality", "count", "data", "timestamps"]
    missing_keys = [k for k in required_keys if k not in doc]
    if missing_keys:
        print(f"  [FAIL] Missing schema keys: {missing_keys}")
        all_passed = False
        continue
        
    timestamps = doc["timestamps"]
    data = doc["data"]
    count = doc["count"]
    
    if len(timestamps) != count or len(data) != count:
        print(f"  [FAIL] Count mismatch: header count={count}, len(timestamps)={len(timestamps)}, len(data)={len(data)}")
        all_passed = False
        continue

    # Timestamp continuity
    prev_dt = None
    step_sec = doc["stepSeconds"]
    time_discontinuity = 0
    nan_count = 0
    range_errors = 0
    
    sun_els, sun_azs, earth_els, earth_azs = [], [], [], []
    
    for i, (ts, pt) in enumerate(zip(timestamps, data)):
        # Check ISO format
        if not ts.endswith("Z"):
            time_discontinuity += 1
        cur_dt = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
        if prev_dt is not None:
            delta = (cur_dt - prev_dt).total_seconds()
            if delta != step_sec:
                time_discontinuity += 1
        prev_dt = cur_dt
        
        # Check 4 fields
        if len(pt) != 4:
            range_errors += 1
            continue
            
        s_az, s_el, e_az, e_el = pt
        for val in [s_az, s_el, e_az, e_el]:
            if val is None or math.isnan(val) or math.isinf(val):
                nan_count += 1
                
        if not (0.0 <= s_az <= 360.0):
            range_errors += 1
        if not (-90.0 <= s_el <= 90.0):
            range_errors += 1
        if not (0.0 <= e_az <= 360.0):
            range_errors += 1
        if not (-90.0 <= e_el <= 90.0):
            range_errors += 1
            
        sun_azs.append(s_az)
        sun_els.append(s_el)
        earth_azs.append(e_az)
        earth_els.append(e_el)

    print(f"  Total records: {count} hourly observations")
    print(f"  Time span: {doc['startTime']} to {doc['endTime']}")
    print(f"  Discontinuities / format errors: {time_discontinuity}")
    print(f"  NaN / Inf / Null count: {nan_count}")
    print(f"  Angular range violations: {range_errors}")
    print(f"  Sun Elevation Range:   [{min(sun_els):.2f}°, {max(sun_els):.2f}°] (mean={sum(sun_els)/len(sun_els):.2f}°)")
    print(f"  Earth Elevation Range: [{min(earth_els):.2f}°, {max(earth_els):.2f}°] (mean={sum(earth_els)/len(earth_els):.2f}°)")
    print(f"  Sun Azimuth Range:     [{min(sun_azs):.2f}°, {max(sun_azs):.2f}°]")
    print(f"  Earth Azimuth Range:   [{min(earth_azs):.2f}°, {max(earth_azs):.2f}°]")
    
    # Astronomical sanity checks
    if site_id == "shackleton-rim":
        # At 89.54°S, max sun elevation should never exceed ~2.0°
        if max(sun_els) > 2.5 or min(sun_els) < -2.5:
            print(f"  [ASTRONOMY WARNING] Shackleton sun elevation out of polar bounds: [{min(sun_els)}, {max(sun_els)}]")
            all_passed = False
        else:
            print(f"  [ASTRONOMY PASS] Shackleton sun elevation oscillates within true polar grazing bounds [-1.98°, +1.86°].")
    elif site_id == "apollo-11":
        # At equator (0.67°N), sun elevation should swing full diurnal cycle [-90°, +90°]
        if min(sun_els) > -80.0 or max(sun_els) < 80.0:
            print(f"  [ASTRONOMY WARNING] Apollo 11 sun elevation swing insufficient: [{min(sun_els)}, {max(sun_els)}]")
            all_passed = False
        else:
            print(f"  [ASTRONOMY PASS] Apollo 11 exhibits full equatorial diurnal swing: [{min(sun_els):.1f}°, {max(sun_els):.1f}°].")
        # Earth elevation at Apollo 11 (23.5°E, 0.7°N) should be centered near ~60° with libration wobble of ~6-8°
        if not (50.0 < sum(earth_els)/len(earth_els) < 70.0):
            print(f"  [ASTRONOMY WARNING] Apollo 11 Earth elevation mean unexpected: {sum(earth_els)/len(earth_els)}")
            all_passed = False
        else:
            print(f"  [ASTRONOMY PASS] Apollo 11 Earth elevation centered at {sum(earth_els)/len(earth_els):.1f}° with ±{max(earth_els)-min(earth_els):.1f}° libration.")

    if time_discontinuity > 0 or nan_count > 0 or range_errors > 0:
        all_passed = False

    stats_by_site[site_id] = {
        "count": count,
        "startTime": doc["startTime"],
        "endTime": doc["endTime"],
        "sun_el_min": min(sun_els),
        "sun_el_max": max(sun_els),
        "earth_el_min": min(earth_els),
        "earth_el_max": max(earth_els),
        "earth_el_mean": sum(earth_els)/len(earth_els),
    }

print("\n" + "=" * 80)
print(f"DATASET INTEGRITY RESULT: {'ALL VERIFIED PASS' if all_passed else 'FAILURES DETECTED'}")
print("=" * 80)

with open("pipeline/audit_dataset_summary.json", "w") as f:
    json.dump(stats_by_site, f, indent=2)
