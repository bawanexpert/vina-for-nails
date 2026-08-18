#!/usr/bin/env python3
"""vina_for_nails asset pipeline.

STRICT ASSET SEPARATION:
  - IMG_0334.PNG (square profile shot)  -> profile.webp  (Header/About badge ONLY)
  - 1242x2688 Instagram screenshots     -> photo-band cropped -> design_XXX.webp
                                           (isolated nail-art artwork only; IG UI
                                           chrome, captions and headers removed)
  - crops auto-classified into the 5 catalog categories
  - regenerates src/data/designs.json

Usage:  python scripts/process_assets.py
"""

import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw_images"
OUT = ROOT / "public" / "assets"
DESIGNS_JSON = ROOT / "src" / "data" / "designs.json"

PROFILE_FILE = "IMG_0334.PNG"
MAX_DIM = 1000

CATEGORIES = [
    ("french", "فرێنچ و کلاسیک"),
    ("holiday", "کریسمس و بەفر"),
    ("animal", "پڵنگی و پاییزی"),
    ("hearts", "دڵ و ڕۆمانسی"),
    ("glitter", "سادە و بریقەدار"),
]

NAMES = {
    "french": [
        ("French Classic", "فرێنچی کلاسیک"),
        ("Red Tip French", "فرێنچی لووت سوور"),
        ("Milky French", "فرێنچی شیری"),
        ("Golden French", "فرێنچی زێڕین"),
    ],
    "holiday": [
        ("Snowy Christmas", "کریسمسی بەفراوی"),
        ("Winter Sparkle", "بریقەی زستان"),
        ("Frosty Art", "نەخشی بەستەڵەک"),
        ("Holiday Joy", "خۆشی جەژن"),
    ],
    "animal": [
        ("Leopard Luxe", "پڵنگی لوکس"),
        ("Autumn Earth", "دیزاینی پاییزی"),
        ("Cheetah Spots", "خاڵەکانی چیتا"),
        ("Autumn Nude", "نودی پاییزی"),
    ],
    "hearts": [
        ("Lovely Hearts", "دڵە ڕۆمانسییەکان"),
        ("Romance Blush", "ڕۆمانسی پەمەیی"),
        ("Sweet Hearts", "دڵە شیرینەکان"),
        ("Rose Romance", "ڕۆمانسی ڕۆز"),
    ],
    "glitter": [
        ("Chrome Shine", "کرۆمی بریقەدار"),
        ("Minimal Nude", "سادەی نود"),
        ("Glitter Dust", "تۆزی بریقە"),
        ("Pearl White", "سپی مرواری"),
    ],
}

# Manual best-effort re-tags for images the color heuristic cannot place well.
# These are based on luminance/saturation analysis only — edit designs.json
# afterwards to fine-tune any category by eye.
OVERRIDES = {
    "IMG_0343.PNG": "french",  # bright, subtle red on light background
    "IMG_0349.PNG": "french",  # bright neutral / milky tones
    "IMG_0348.PNG": "animal",  # dark, high-texture print look
    "IMG_0338.PNG": "glitter",  # neutral low-saturation chrome tones
}


def row_signals(img):
    w, h = img.size
    step = 4
    small = img.resize((48, h // step))
    px = small.load()
    n = small.height
    x0, x1 = int(0.2 * small.width), int(0.8 * small.width)
    means, midvars, sats = [], [], []
    for y in range(n):
        vals = [px[x, y] for x in range(small.width)]
        m = sum(sum(v) for v in vals) / (len(vals) * 3)
        mids = [px[x, y] for x in range(x0, x1)]
        mm = sum(sum(v) for v in mids) / (len(mids) * 3)
        v = sum((sum(v) / 3 - mm) ** 2 for v in mids) / len(mids)
        s = sum(max(v) - min(v) for v in vals) / len(vals)
        means.append(m)
        midvars.append(v)
        sats.append(s)
    return step, means, midvars, sats


def find_photo_band(img):
    """Locate the isolated nail-art region inside an Instagram screenshot."""
    w, h = img.size
    step, means, midvars, sats = row_signals(img)
    n = len(means)

    is_photo = [
        (v > 120 or (m > 110 and v > 40 and s > 4))
        for v, m, s in zip(midvars, means, sats)
    ]

    # --- top boundary ---
    top_i = next((i for i in range(n) if is_photo[i]), 0)
    if means[top_i] < 80:  # dark textured start (header): skip to first light zone
        limit = int(0.30 * n)
        for j in range(top_i, min(top_i + limit, n)):
            if means[j] > 100:
                top_i = j
                break
    strip_lim = min(top_i + int(0.03 * n), n)  # trim light status bar strip
    k = top_i
    while k < strip_lim and means[k] > 150 and midvars[k] < 60 and sats[k] < 8:
        k += 1
    top_i = k
    top = min(int(top_i * step), h - 1)

    # --- bottom boundary: last long flat-dark run (divider / nav) ---
    bottom = h
    i = n - 1
    while i > 0:
        if midvars[i] < 80 and means[i] < 80:
            j = i
            while j > 0 and midvars[j] < 80 and means[j] < 80:
                j -= 1
            if (i - j) >= max(8, int(0.015 * n)):
                run_top = (j + 1) * step
                if run_top <= 0.94 * h:
                    bottom = run_top
                    break
            i = j
        else:
            i -= 1
    # fallback: long flat-light run in lower half (light-mode caption zone)
    if bottom == h:
        i = n - 1
        while i > 0:
            if midvars[i] < 60 and means[i] > 150 and sats[i] < 8:
                j = i
                while j > 0 and midvars[j] < 60 and means[j] > 150 and sats[j] < 8:
                    j -= 1
                if (i - j) >= max(10, int(0.03 * n)) and (j + 1) * step > 0.55 * h:
                    bottom = (j + 1) * step
                    break
                i = j
            else:
                i -= 1
    if bottom <= top or bottom > h:
        bottom = int(0.87 * h)

    top = max(0, top - int(0.005 * h))
    bottom = min(h, bottom + int(0.005 * h))
    return top, bottom


def trim_columns(crop):
    """Trim near-uniform columns at the left/right edges."""
    cw, ch = crop.size
    if ch < 40:
        return crop
    small = crop.resize((48, max(12, 48 * ch // max(1, cw))))
    px = small.load()
    flat = []
    for x in range(small.width):
        vals = [px[x, y] for y in range(small.height)]
        m = sum(sum(v) for v in vals) / (len(vals) * 3)
        v = sum((sum(v) / 3 - m) ** 2 for v in vals) / len(vals)
        flat.append(v < 45)
    thresh = int(0.85 * small.height)
    xl = 0
    while xl < small.width - 6 and sum(flat[xl : xl + 3]) == 3:
        xl += 1
    xr = small.width - 1
    while xr > 5 and sum(flat[xr - 2 : xr + 1]) == 3:
        xr -= 1
    xl = min(xl, int(0.04 * small.width))
    xr = max(xr, small.width - 1 - int(0.04 * small.width))
    sx = int(xl / small.width * cw)
    ex = int((xr + 1) / small.width * cw)
    return crop.crop((sx, 0, ex, ch))


def color_stats(img):
    """Vivid-color hue histogram + luminance/saturation stats."""
    small = img.convert("RGB")
    small.thumbnail((240, 240))
    px = small.load()
    w, h = small.size
    hist = Counter()
    sat_sum = lum_sum = 0
    n = w * h
    red_top = red_bot = 0
    n_top = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            mx, mn = max(r, g, b), min(r, g, b)
            lum = (r + g + b) / 3
            sat = mx - mn
            sat_sum += sat
            lum_sum += lum
            in_top = y < int(0.6 * h)
            if sat > 35 and mx > 80:
                if mx == r:
                    hue = (g - b) / sat
                elif mx == g:
                    hue = 120 + (b - r) / sat
                else:
                    hue = 240 + (r - g) / sat
                hue %= 360
                if in_top and (hue < 15 or hue > 330):
                    red_top += 1
                if (hue < 15 or hue > 330):
                    red_bot += 1
                hist[int(hue)] += 1
            n_top += in_top
    sat_mean = sat_sum / n
    lum_mean = lum_sum / n

    def frac(a, b):
        return sum(v for k, v in hist.items() if a <= k < b) / n

    return {
        "lum": lum_mean,
        "sat": sat_mean,
        "vivid": sum(hist.values()) / n,
        "red": frac(0, 15) + frac(345, 360),
        "pink": frac(300, 345),
        "orange": frac(15, 60),
        "green": frac(90, 165),
        "blue": frac(195, 260),
        "red_top_ratio": (red_top / n_top) if n_top else 0,
        "red_total_ratio": (red_bot / n) if n else 0,
    }


def classify(stats):
    if stats["green"] > 0.08 or stats["blue"] > 0.08:
        return "holiday"
    if stats["red"] > 0.30:
        return "hearts"
    if stats["orange"] > 0.12:
        return "animal"
    if stats["red"] > 0.12:
        return "hearts"
    if stats["sat"] < 32:
        if stats["lum"] > 165:
            return "french"
        return "glitter"
    if stats["red"] > 0.06 and stats["red_top_ratio"] > 0.06 and stats["lum"] > 130:
        return "french"
    if stats["red"] + stats["pink"] > 0.06:
        return "hearts"
    if stats["lum"] > 150:
        return "french"
    return "glitter"


def make_profile():
    src = RAW / PROFILE_FILE
    img = Image.open(src).convert("RGB")
    img.thumbnail((512, 512), Image.Resampling.LANCZOS)
    img.save(OUT / "profile.webp", "WEBP", quality=88)
    print(f"profile.webp <- {src.name}  (Header/About badge only)")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.glob("design_*.webp"):
        stale.unlink()
    (OUT / "logo.webp").unlink(missing_ok=True)
    make_profile()

    screenshots = sorted(
        p for p in RAW.iterdir() if p.suffix.lower() == ".png" and p.name != PROFILE_FILE
    )
    designs = []
    counters = Counter()

    for i, path in enumerate(screenshots, start=1):
        try:
            img = Image.open(path).convert("RGB")
            top, bottom = find_photo_band(img)
            crop = img.crop((0, top, img.width, bottom))
            crop = trim_columns(crop)
            stats = color_stats(crop)
            cat = OVERRIDES.get(path.name, classify(stats))

            crop.thumbnail((MAX_DIM, MAX_DIM), Image.Resampling.LANCZOS)
            out_name = f"design_{i:03d}.webp"
            crop.save(OUT / out_name, "WEBP", quality=86, method=6)

            name_pool = NAMES[cat]
            name_en, name_ku = name_pool[counters[cat] % len(name_pool)]
            counters[cat] += 1

            designs.append(
                {
                    "id": f"design-{i:03d}",
                    "name_en": name_en,
                    "name_ku": name_ku,
                    "category": cat,
                    "imagePath": f"/assets/{out_name}",
                }
            )
            print(
                f"{path.name}: [{top}-{bottom}] {crop.size[0]}x{crop.size[1]} "
                f"lum={stats['lum']:.0f} sat={stats['sat']:.0f} vivid={stats['vivid']:.2f} "
                f"red={stats['red']:.2f} pink={stats['pink']:.2f} orange={stats['orange']:.2f} "
                f"green={stats['green']:.2f} blue={stats['blue']:.2f} "
                f"redTop={stats['red_top_ratio']:.2f} -> {cat}"
            )
        except Exception as e:
            print(f"ERROR {path.name}: {e}", file=sys.stderr)

    order = [c for c, _ in CATEGORIES]
    designs.sort(key=lambda d: (order.index(d["category"]), d["id"]))

    with open(DESIGNS_JSON, "w", encoding="utf-8") as fp:
        json.dump(designs, fp, ensure_ascii=False, indent=2)

    print(f"\nDone: {len(designs)} designs -> {DESIGNS_JSON}")
    for c, _ in CATEGORIES:
        print(f"  {c}: {counters[c]}")


if __name__ == "__main__":
    main()
