# vina_for_nails 💅 — Luxury Nail Salon Web App

Kurdish (Sorani, RTL) + English website for **vina_for_nails**, a nail salon in
Sulaymaniyah, Zerinok. React + TypeScript + Vite + Tailwind CSS 4.

## Features

- **Interactive 3D Swatch Wheel** — nail designs mounted on realistic white salon
  swatch sticks (plastic stem + polished almond tip with acrylic gloss shine).
  Drag / swipe / tap to spin the fan. Pure CSS 3D transforms — no WebGL, GPU
  friendly, smooth on mobile.
- **Strict asset separation** — the profile picture appears only as the
  Header/About badge. Catalog cards show only isolated nail-art artwork (photo
  region auto-cropped from Instagram screenshots, UI chrome removed).
- **5 catalog categories**: French & Classics · Holiday & Snow · Animal & Autumn ·
  Hearts & Romantic · Minimal & Glitter.
- **Official price menu (IQD)** with instant "book this service".
- **4-step booking flow** — Service → Shape & Design → Date & Time → Details —
  dispatched instantly to WhatsApp (`+9647766939291` / `+9647501684893`) and
  Viber (`+9647766939291`) with a pre-filled, polite message.
- Clean Kurdish Sorani (RTL) / English toggle. Deep velvet black + rose-gold +
  champagne luxury theme.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server
npm run build      # typecheck + production build
npm run lint       # oxlint
```

## Asset pipeline

`python scripts/process_assets.py` regenerates `public/assets` and
`src/data/designs.json` from `raw_images/`:

| Source | Output | Usage |
| --- | --- | --- |
| `IMG_0334.PNG` (square) | `profile.webp` | Header/About badge **only** |
| `IMG_0336..IMG_0350.PNG` (screenshots) | `design_XXX.webp` | isolated nail-art cards (photo band auto-cropped, IG header/captions/nav removed) |

Each crop is auto-classified into one of the 5 categories by color analysis,
with a small `OVERRIDES` table in the script for manual corrections. To
re-tag designs by eye, simply edit the `category` field in `src/data/designs.json`
(`french` | `holiday` | `animal` | `hearts` | `glitter`).

## Structure

```
src/
  components/
    Header.tsx          # luxury blur nav + profile badge + language toggle
    Hero.tsx            # brand, location, about badge, mini swatch fan
    SwatchStick.tsx     # one swatch stick (CSS)
    SwatchWheel.tsx     # interactive CSS 3D radial fan
    Catalog.tsx         # swatch catalog: categories + wheel + grid
    Services.tsx        # price menu (IQD)
    BookingAssistant.tsx# 4-step flow -> WhatsApp/Viber
    LocationMap.tsx     # contact + map
  context/              # LanguageContext (ku/en), BookingContext
  i18n/translations.ts  # Sorani + English strings
  data/salonInfo.ts     # services, prices, phones, categories
  data/designs.json     # generated catalog
```
