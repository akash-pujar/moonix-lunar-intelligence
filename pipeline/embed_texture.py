import base64

with open('frontend/public/textures/moon_albedo.jpg', 'rb') as f:
    raw = f.read()

b64 = base64.b64encode(raw).decode('ascii')
content = f'''// moonAlbedoData.ts — Authentic NASA LROC Moon albedo texture encoded as Data URI for 0ms offline rendering
export const MOON_ALBEDO_DATA_URI = "data:image/jpeg;base64,{b64}";
'''

with open('frontend/src/landing/moonAlbedoData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Generated moonAlbedoData.ts successfully ({len(b64)} chars)")

