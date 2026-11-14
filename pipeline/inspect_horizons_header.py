import requests
from datetime import datetime, timedelta

url = "https://ssd.jpl.nasa.gov/api/horizons.api"
params = {
    "format": "text",
    "COMMAND": "10",
    "CENTER": "coord@301",
    "COORD_TYPE": "GEODETIC",
    "SITE_COORD": "0.0,-89.54,0.002", # lon, lat, alt
    "START_TIME": "2027-03-01 12:00",
    "STOP_TIME": "2027-03-01 12:05",
    "STEP_SIZE": "1h",
    "QUANTITIES": "4",
}

r = requests.get(url, params=params, timeout=20)
print("=== HORIZONS FULL OUTPUT HEADER ===")
print(r.text[:2500])
print("=== HORIZONS FOOTER / NOTES ===")
print(r.text[-2500:])
