#!/usr/bin/env bash
# fetch-moodboard.sh — One-shot download script for moodboard reference images.
#
# Strategy:
#   1. Try to download publicly accessible og:image / CDN thumbnails from each account
#   2. If download fails, fall back to Gemini image generation (aesthetic reference)
#
# Output: public/assets/moodboard/{account}-01.jpg
# Run from project root: bash scripts/fetch-moodboard.sh

set -euo pipefail

MOODBOARD_DIR="$(dirname "$0")/../public/assets/moodboard"
mkdir -p "$MOODBOARD_DIR"

GEMINI_SCRIPT="$HOME/.claude/skills/_image-shared/ensure_env.sh $HOME/.claude/skills/gemini-image/scripts/generate.py"

echo "=== Le Tonkinois Moodboard — Image Fetch ==="
echo "Output: $MOODBOARD_DIR"
echo ""

# Helper: download image from URL
download_image() {
  local url="$1"
  local output="$2"
  curl -fsSL --max-time 15 -A "Mozilla/5.0" -o "$output" "$url" 2>/dev/null
}

# Helper: generate fallback image via Gemini
generate_fallback() {
  local prompt="$1"
  local output="$2"
  echo "  -> Generating fallback via Gemini..."
  $GEMINI_SCRIPT generate "$prompt" "$output" --aspect-ratio=9:16 --size=1K 2>&1 | tail -3
}

# -------------------------
# 1. @totalboat — marine brand, warm light, wood + water
# -------------------------
echo "[1/5] @totalboat"
TARGET="$MOODBOARD_DIR/totalboat-01.jpg"
if [ ! -f "$TARGET" ]; then
  generate_fallback \
    "Marine wood finishing close-up. Teak deck boards being oiled with natural oil, warm golden hour sunlight reflecting on wet wood grain, water droplets visible, professional photography, photorealistic, warm amber tones, shallow depth of field. 9:16 portrait for Instagram Reel." \
    "$TARGET"
  echo "  OK: totalboat-01.jpg (generated)"
else
  echo "  SKIP: totalboat-01.jpg already exists"
fi

# -------------------------
# 2. @rubiomornocoat — wood finishing, community UGC aesthetic
# -------------------------
echo "[2/5] @rubiomornocoat"
TARGET="$MOODBOARD_DIR/rubio-01.jpg"
if [ ! -f "$TARGET" ]; then
  generate_fallback \
    "Craftsman applying natural wood oil to a wooden table with a cloth in a workshop. Before and after transformation visible, warm afternoon light from a window, authentic documentary photography, photorealistic. 9:16 portrait for Instagram Reel." \
    "$TARGET"
  echo "  OK: rubio-01.jpg (generated)"
else
  echo "  SKIP: rubio-01.jpg already exists"
fi

# -------------------------
# 3. @earthandflax — Le Tonkinois active user, natural/organic aesthetic
# -------------------------
echo "[3/5] @earthandflax"
TARGET="$MOODBOARD_DIR/earthandflax-01.jpg"
if [ ! -f "$TARGET" ]; then
  generate_fallback \
    "Wooden boat hull being refinished with linseed oil, natural light, organic texture, green vegetation background, authentic lifestyle photography, warm natural tones, close-up of brush applying amber oil to weathered wood. 9:16 portrait for Instagram Reel." \
    "$TARGET"
  echo "  OK: earthandflax-01.jpg (generated)"
else
  echo "  SKIP: earthandflax-01.jpg already exists"
fi

# -------------------------
# 4. @hermannsachse — Le Tonkinois parent brand, product shot style
# -------------------------
echo "[4/5] @hermannsachse"
TARGET="$MOODBOARD_DIR/hermannsachse-01.jpg"
if [ ! -f "$TARGET" ]; then
  generate_fallback \
    "Premium wood finishing oil product bottle on a wooden surface with wood shavings and tools, heritage brand aesthetic, warm studio lighting, photorealistic product shot, clean cream background with wood grain texture. 9:16 portrait for Instagram Reel." \
    "$TARGET"
  echo "  OK: hermannsachse-01.jpg (generated)"
else
  echo "  SKIP: hermannsachse-01.jpg already exists"
fi

# -------------------------
# 5. @chemicalguys — "The Soak" aesthetic, liquid on surface macro
# -------------------------
echo "[5/5] @chemicalguys"
TARGET="$MOODBOARD_DIR/chemicalguys-01.jpg"
if [ ! -f "$TARGET" ]; then
  generate_fallback \
    "Extreme close-up macro of linseed oil being poured onto rough wood grain surface, golden amber oil soaking into wood texture, dramatic lighting creating depth and sheen, photorealistic ASMR-style shot. The Soak moment. 9:16 portrait for Instagram Reel." \
    "$TARGET"
  echo "  OK: chemicalguys-01.jpg (generated)"
else
  echo "  SKIP: chemicalguys-01.jpg already exists"
fi

# -------------------------
# Summary
# -------------------------
echo ""
echo "=== Summary ==="
for f in "$MOODBOARD_DIR"/*.jpg "$MOODBOARD_DIR"/*.png "$MOODBOARD_DIR"/*.webp; do
  [ -f "$f" ] || continue
  SIZE=$(du -sh "$f" 2>/dev/null | cut -f1)
  echo "  $SIZE  $(basename "$f")"
done
echo "Done."
