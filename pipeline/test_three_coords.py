import math

def lat_lon_to_cartesian(lat_deg, lon_deg, R=1.0):
    lat_rad = math.radians(lat_deg)
    lon_rad = math.radians(lon_deg)
    
    # In standard Three.js SphereGeometry:
    # theta = lon_rad + pi/2, phi = pi/2 - lat_rad
    # or direct:
    # y is North
    y = R * math.sin(lat_rad)
    # x and z in horizontal plane:
    # At lon=0: z = R*cos(lat), x = 0
    # At lon=+90 (East): x = R*cos(lat), z = 0
    x = R * math.cos(lat_rad) * math.sin(lon_rad)
    z = R * math.cos(lat_rad) * math.cos(lon_rad)
    return x, y, z

sites = [
    ("Shackleton Rim", -89.54, 0.0),
    ("Malapert Massif", -86.0, 0.0),
    ("Nobile Rim", -85.3, 32.5),
    ("Apollo 11", 0.674, 23.473),
]

for name, lat, lon in sites:
    x, y, z = lat_lon_to_cartesian(lat, lon, 100.0)
    print(f"{name:<20}: Lat={lat:8.3f}°, Lon={lon:8.3f}° => x={x:7.2f}, y={y:7.2f}, z={z:7.2f}")

