import hashlib
import json
from pathlib import Path

kdir = Path('pipeline/kernels')
with open(kdir / 'kernel_manifest.json') as f:
    manifest = json.load(f)

print("=" * 80)
print("KERNEL VERIFICATION AUDIT")
print("=" * 80)

all_ok = True
for item in manifest:
    p = kdir / item['filename']
    if not p.exists():
        print(f"MISSING: {p}")
        all_ok = False
        continue
    actual_size = p.stat().st_size
    h = hashlib.sha256()
    with open(p, 'rb') as fp:
        while chunk := fp.read(65536):
            h.update(chunk)
    actual_sha = h.hexdigest()
    size_ok = (actual_size == item['size_bytes'])
    sha_ok = (actual_sha == item['sha256'])
    status = "OK" if (size_ok and sha_ok) else "MISMATCH"
    if not (size_ok and sha_ok):
        all_ok = False
    print(f"{item['filename']:<30} Size: {actual_size} bytes [{'OK' if size_ok else 'FAIL'}] SHA-256: [{'OK' if sha_ok else 'FAIL'}]")
    if not sha_ok:
        print(f"  Expected SHA: {item['sha256']}")
        print(f"  Actual SHA:   {actual_sha}")

print("=" * 80)
print(f"KERNEL INTEGRITY: {'ALL VERIFIED PASS' if all_ok else 'FAILURES DETECTED'}")
