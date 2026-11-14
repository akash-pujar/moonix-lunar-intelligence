import math
import spiceypy as sp
from pathlib import Path

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

lat_deg = -89.54
lon_deg = 0.0
alt_km = 0.002
utc_str = "2027-03-01T12:00:00"
et = sp.str2et(utc_str)

obs_pos_me = sp.georec(lon_deg * sp.rpd(), lat_deg * sp.rpd(), alt_km, re, f)
normal_me = sp.surfnm(re, re, rp, obs_pos_me)
z_axis = [0.0, 0.0, 1.0]
proj = sp.vdot(z_axis, normal_me)
north_me = sp.vhat(sp.vsub(z_axis, sp.vscl(proj, normal_me)))
east_me = sp.ucrss(north_me, normal_me)

for target in ["SUN", "EARTH"]:
    # Method 1: Existing method (center-of-moon LT+S minus observer position)
    sun_pos_moon, _ = sp.spkpos(target, et, "MOON_ME", "LT+S", "MOON")
    r_topo_1 = sp.vsub(sun_pos_moon, obs_pos_me)
    r_hat_1 = sp.vhat(r_topo_1)
    e1 = sp.vdot(r_hat_1, east_me)
    n1 = sp.vdot(r_hat_1, north_me)
    u1 = sp.vdot(r_hat_1, normal_me)
    el1 = math.degrees(math.asin(max(-1.0, min(1.0, u1))))
    az1 = math.degrees(math.atan2(e1, n1)) % 360.0

    # Method 2: Native SPICE spkcpo (constant position surface observer on MOON body)
    # spkcpo(target, et, outsys, refloc, abcorr, obspos, obsctr, obsref)
    state_topo_2, lt2 = sp.spkcpo(target, et, "MOON_ME", "OBSERVER", "LT+S", obs_pos_me, "MOON", "MOON_ME")
    r_hat_2 = sp.vhat(state_topo_2[:3])
    e2 = sp.vdot(r_hat_2, east_me)
    n2 = sp.vdot(r_hat_2, north_me)
    u2 = sp.vdot(r_hat_2, normal_me)
    el2 = math.degrees(math.asin(max(-1.0, min(1.0, u2))))
    az2 = math.degrees(math.atan2(e2, n2)) % 360.0

    # Method 3: Geometric (no aberration correction 'NONE')
    state_none, _ = sp.spkcpo(target, et, "MOON_ME", "OBSERVER", "NONE", obs_pos_me, "MOON", "MOON_ME")
    r_hat_3 = sp.vhat(state_none[:3])
    e3 = sp.vdot(r_hat_3, east_me)
    n3 = sp.vdot(r_hat_3, north_me)
    u3 = sp.vdot(r_hat_3, normal_me)
    el3 = math.degrees(math.asin(max(-1.0, min(1.0, u3))))
    az3 = math.degrees(math.atan2(e3, n3)) % 360.0

    print(f"=== TARGET: {target} ===")
    print(f"Method 1 (spkpos MOON + vector sub): Az={az1:.6f}°, El={el1:.6f}°")
    print(f"Method 2 (spkcpo topocentric LT+S):   Az={az2:.6f}°, El={el2:.6f}°")
    print(f"Method 3 (spkcpo topocentric NONE):   Az={az3:.6f}°, El={el3:.6f}°")
    print(f"Delta (Method 1 vs Method 2): dAz={abs(az1-az2):.6f}°, dEl={abs(el1-el2):.6f}°")
    print(f"Aberration impact (M2 vs M3): dAz={abs(az2-az3):.6f}°, dEl={abs(el2-el3):.6f}°")
    print()

sp.kclear()
