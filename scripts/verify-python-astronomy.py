import swisseph as swe
import datetime
import json
import os

# Set Ephemeris path if available, else standard
# swe.set_ephe_path('/usr/local/share/sweph') 

# Set Ayanamsa to Lahiri
swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)

location = {
    'lat': 12.9716,
    'lon': 77.5946,
}

start_date = datetime.datetime(2025, 1, 1)
days = 10

results = []

def get_julian_day(dt):
    # Convert to UTC for Julian Day
    # Assuming the input datetime is in IST (UTC+5.5) or local mean time?
    # Let's treat input as UTC for simplicity of comparison, or convert strict
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60.0 + dt.second/3600.0)

for i in range(days):
    dt = start_date + datetime.timedelta(days=i)
    # We'll check at 00:00 UTC (05:30 IST)
    jd_ut = get_julian_day(dt)
    
    # Flags: Sidereal + Speed
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED

    # Sun
    sun_res = swe.calc_ut(jd_ut, swe.SUN, flags)
    sun_lon = sun_res[0][0]
    
    # Moon
    moon_res = swe.calc_ut(jd_ut, swe.MOON, flags)
    moon_lon = moon_res[0][0]

    # Calculate Tithi
    # Tithi = (Moon - Sun) / 12
    diff = moon_lon - sun_lon
    if diff < 0: diff += 360
    tithi_val = diff / 12.0
    tithi_index = int(tithi_val) + 1 
    
    # Calculate Nakshatra
    # Nakshatra = Moon / 13.3333
    nak_val = moon_lon / (360/27)
    nak_index = int(nak_val)

    results.append({
        "date": dt.isoformat(),
        "jd": jd_ut,
        "sun_lon": sun_lon,
        "moon_lon": moon_lon,
        "tithi_index": tithi_index,
        "nakshatra_index": nak_index
    })

print(json.dumps(results, indent=2))
