"""
SPICE Topocentric Calculator Test with DE421 orientation
"""
import math
from pathlib import Path
import spiceypy as sp

KERNEL_DIR = Path(__file__).resolve().parent / "kernels"

# Furnish kernels
kernels = [
    KERNEL_DIR / "naif0012.tls",
    KERNEL_DIR / "pck00011.tpc",
    KERNEL_DIR / "moon_080317.tf",
    KERNEL_DIR / "moon_assoc_me.tf",
    KERNEL_DIR / "moon_pa_de421_1900-2050.bpc",
    KERNEL_DIR / "de440s.bsp",
]

for k in kernels:
    sp.furnsh(str(k))

print("Furnished kernels successfully.")

# Target: Sun (10), Earth (399)
# Observer: Shackleton Rim on Moon
lat_deg = -89.54
lon_deg = 0.0
alt_km = 0.002
utc_str = "2027-03-01T12:00:00"

et = sp.str2et(utc_str)

# Lunar radii from PCK
radii = sp.bodvrd("MOON", "RADII", 3)[1]
r_equat = radii[0]
r_polar = radii[2]
f = (r_equat - r_polar) / r_equat

# Observer position in MOON_ME frame (body-fixed)
# georec takes longitude, latitude, altitude in radians and km
obs_pos_me = sp.georec(lon_deg * sp.rpd(), lat_deg * sp.rpd(), alt_km, r_equat, f)
print("Observer position in MOON_ME (km):", obs_pos_me)

# Surface normal (Zenith) vector in MOON_ME
normal_me = sp.surfnm(r_equat, r_equat, r_polar, obs_pos_me)

# North unit vector:
z_axis = [0.0, 0.0, 1.0]
proj = sp.vdot(z_axis, normal_me)
north_me = sp.vhat(sp.vsub(z_axis, sp.vscl(proj, normal_me)))

# East unit vector = North x Zenith
east_me = sp.ucrss(north_me, normal_me)

def calc_body(target_name):
    pos_target_moon, lt = sp.spkpos(target_name, et, "MOON_ME", "LT+S", "MOON")
    r_topo_me = sp.vsub(pos_target_moon, obs_pos_me)
    r_hat = sp.vhat(r_topo_me)
    
    e_comp = sp.vdot(r_hat, east_me)
    n_comp = sp.vdot(r_hat, north_me)
    u_comp = sp.vdot(r_hat, normal_me)
    
    el_deg = math.degrees(math.asin(max(-1.0, min(1.0, u_comp))))
    az_deg = math.degrees(math.atan2(e_comp, n_comp)) % 360.0
    
    return az_deg, el_deg

sun_az, sun_el = calc_body("SUN")
earth_az, earth_el = calc_body("EARTH")

print(f"\n--- SPICE Topocentric Results at {utc_str} UTC ---")
print(f"Sun:   Azimuth = {sun_az:8.4f}°, Elevation = {sun_el:8.4f}°")
print(f"Earth: Azimuth = {earth_az:8.4f}°, Elevation = {earth_el:8.4f}°")

print("\n--- JPL Horizons Reference Results ---")
print("Sun:   Azimuth = 259.4281°, Elevation = -0.6644°")
print("Earth: Azimuth =   3.4466°, Elevation = -5.4211°")

print("\n--- Absolute Difference (SPICE vs Horizons) ---")
print(f"Sun Azimuth Delta:     {abs(sun_az - 259.4281):.4f}°")
print(f"Sun Elevation Delta:   {abs(sun_el - (-0.6644)):.4f}°")
print(f"Earth Azimuth Delta:   {abs(earth_az - 3.4466):.4f}°")
print(f"Earth Elevation Delta: {abs(earth_el - (-5.4211)):.4f}°")

sp.kclear()
