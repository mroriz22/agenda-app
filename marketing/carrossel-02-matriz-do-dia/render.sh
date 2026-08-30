#!/usr/bin/env bash
# Renderiza cada slide de slides.html em PNG 1080x1350 (formato de feed 4:5).
# O Chrome headless entrega a área útil menor que o pedido, então renderiza
# com folga e corta no tamanho exato com PIL.
set -euo pipefail
cd "$(dirname "$0")"

for i in 1 2 3 4 5 6 7 8; do
  google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1080,1500 --virtual-time-budget=3000 \
    --screenshot="slide-0$i.png" "file://$PWD/slides.html?s=$i" 2>/dev/null
done

python3 - <<'PY'
from PIL import Image
import glob
for f in sorted(glob.glob("slide-0*.png")):
    im = Image.open(f)
    im.crop((0, 0, 1080, 1350)).save(f)
    print(f, "->", Image.open(f).size)
PY
