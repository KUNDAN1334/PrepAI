#!/usr/bin/env python3
"""
Regenerate every PrepAI brand asset from one geometry definition.

    python3 scripts/build-brand-assets.py

Writes into public/ and app/. The mark itself (marks, favicons, PWA icons) is
pure geometry and always builds. The wordmark assets — the lockup SVG/PNG and
the social card — need Space Grotesk outlines; install it once with

    npm i -D @fontsource/space-grotesk

and they are built too. Without it those files are skipped, not corrupted.

Dependencies:  pip install cairosvg fonttools brotli pillow

The React component at components/brand/Logo.tsx carries the same three paths
and the same transform. If you change the geometry here, change it there too —
the constants are marked in both files.
"""

from __future__ import annotations

import io
import os
import sys

try:
    import cairosvg
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("missing deps — run: pip install cairosvg fonttools brotli pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
APPDIR = os.path.join(ROOT, "app")

# ------------------------------------------------------------------ palette
INK = "#141210"
PAPER = "#FFFFFF"
CRIMSON = "#E8174A"
AZURE = "#1B8FCB"
GOLD = "#E3B505"
PAPER_BG = "#E9E7E1"
INK_SOFT = "#4A463C"

# ------------------------------------------------------------ mark geometry
CX, HW = 14.0, 2.8      # stem centre / half-width
WING = 7.2              # arrowhead half-width
APEX = 2.8              # arrow tip
BASE = 12.8             # arrowhead base == bowl top
BOT = 34.4              # stem foot
BOWL_R = 8.0            # bowl outer radius
T = 4.2                 # bowl weight
OVER = 4.4              # bowl arc start, from the stem's right edge


def n(v: float) -> str:
    return f"{round(v, 4):g}"


_L, _R = CX - HW, CX + HW
_ARC = _R + OVER
_BO = BASE + 2 * BOWL_R
_RI = BOWL_R - T

# The rising arrow — its shaft is the P's stem.
P_ARROW = (f"M{n(CX)} {n(APEX)}L{n(CX+WING)} {n(BASE)}L{n(_R)} {n(BASE)}"
           f"L{n(_R)} {n(BOT)}L{n(_L)} {n(BOT)}L{n(_L)} {n(BASE)}"
           f"L{n(CX-WING)} {n(BASE)}Z")
# The bowl: outer D plus a concentric counter. Both run back to the stem centre
# so the arrow, painted last, hides every seam.
P_BOWL_OUTER = (f"M{n(CX)} {n(BASE)}H{n(_ARC)}A{n(BOWL_R)} {n(BOWL_R)} 0 0 1 "
                f"{n(_ARC)} {n(_BO)}H{n(CX)}Z")
P_BOWL_INNER = (f"M{n(CX)} {n(BASE+T)}H{n(_ARC)}A{n(_RI)} {n(_RI)} 0 0 1 "
                f"{n(_ARC)} {n(_BO-T)}H{n(CX)}Z")

BBOX = (CX - WING, _ARC + BOWL_R, APEX, BOT)   # 6.8..29.2 , 2.8..34.4


def fit(glyph_h: float = 26.0, box: float = 40.0) -> str:
    """Centre the raw glyph in a `box`-unit square at the given cap height."""
    x0, x1, y0, y1 = BBOX
    s = glyph_h / (y1 - y0)
    tx = (box - (x1 - x0) * s) / 2 - x0 * s
    ty = (box - glyph_h) / 2 - y0 * s
    return f"translate({tx:.4f} {ty:.4f}) scale({s:.5f})"


XFORM = fit()


def glyph_group(glyph=PAPER, accent=CRIMSON, xform=XFORM) -> str:
    if accent:
        bowl = (f'<path d="{P_BOWL_OUTER}" fill="{glyph}"/>'
                f'<path d="{P_BOWL_INNER}" fill="{accent}"/>')
    else:
        bowl = (f'<path d="{P_BOWL_OUTER} {P_BOWL_INNER}" fill="{glyph}"'
                f' fill-rule="evenodd"/>')
    return f'<g transform="{xform}">{bowl}<path d="{P_ARROW}" fill="{glyph}"/></g>'


def mark_svg(size=None, badge=INK, glyph=PAPER, accent=CRIMSON,
             border=None, radius=10, bare=False, xform=XFORM) -> str:
    dim = f' width="{size}" height="{size}"' if size else ""
    body = []
    if not bare:
        st = f' stroke="{border}" stroke-width="2"' if border else ""
        i = 1 if border else 0
        body.append(f'<rect x="{i}" y="{i}" width="{40-2*i}" height="{40-2*i}"'
                    f' rx="{radius}" fill="{badge}"{st}/>')
    body.append(glyph_group(glyph, accent, xform))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"{dim}'
            f' fill="none" role="img" aria-label="PrepAI">{"".join(body)}</svg>')


# --------------------------------------------------------------- wordmark
FONT_DIRS = [
    os.path.join(ROOT, "node_modules", "@fontsource", "space-grotesk", "files"),
    os.path.join(ROOT, "scripts", "fonts"),
]
_FONTS: dict[int, tuple] = {}


def _font(weight: int = 700):
    if weight in _FONTS:
        return _FONTS[weight]
    from fontTools.ttLib import TTFont
    for d in FONT_DIRS:
        for name in (f"space-grotesk-latin-{weight}-normal.woff2",
                     f"SG-{weight}.ttf"):
            p = os.path.join(d, name)
            if os.path.exists(p):
                f = TTFont(p)
                _FONTS[weight] = (f["head"].unitsPerEm, f.getGlyphSet(),
                                  f.getBestCmap(), f["hmtx"])
                return _FONTS[weight]
    raise FileNotFoundError(f"Space Grotesk {weight} not found in {FONT_DIRS}")


def word_paths(text, size, tracking=-0.01, weight=700):
    from fontTools.pens.svgPathPen import SVGPathPen
    upm, gs, cmap, hmtx = _font(weight)
    scale, track = size / upm, tracking * size
    x, out = 0.0, []
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        d = pen.getCommands()
        if d:
            out.append((f'<g transform="translate({x:.3f} 0) '
                        f'scale({scale:.6f} {-scale:.6f})"><path d="{d}"/></g>', ch))
        x += hmtx[name][0] * scale + track
    return out, x - track


def text_svg(text, size, color=INK, weight=700, tracking=-0.01):
    parts, w_ = word_paths(text, size, tracking, weight)
    return "".join(d.replace("<path d=", f'<path fill="{color}" d=')
                   for d, _ in parts), w_


def wordmark_parts(size, ink=INK, accent=CRIMSON):
    """"Prep" in ink, "AI" in the accent."""
    parts, width = word_paths("PrepAI", size)
    body = [d.replace("<path d=", f'<path fill="{accent if i >= 4 else ink}" d=')
            for i, (d, _) in enumerate(parts)]
    return "".join(body), width


def lockup_svg(mark_px=44, gap=14, text_px=42, ink=INK, accent=CRIMSON,
               badge=INK, glyph=PAPER, border=None) -> str:
    body, tw = wordmark_parts(text_px, ink, accent)
    cap, desc = 0.70 * text_px, 0.22 * text_px      # Space Grotesk metrics
    baseline = mark_px / 2 + cap / 2                # centre caps on the badge
    h = max(mark_px, baseline + desc)               # never clip the 'p' tail
    mark_y = (h - mark_px) / 2
    total_w = mark_px + gap + tw
    inner = mark_svg(badge=badge, glyph=glyph, border=border)
    inner = inner.split(">", 1)[1].rsplit("</svg>", 1)[0]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{total_w:.1f}"'
            f' height="{h:.1f}" viewBox="0 0 {total_w:.1f} {h:.1f}" fill="none"'
            f' role="img" aria-label="PrepAI">'
            f'<g transform="translate(0 {mark_y:.2f}) scale({mark_px/40:.5f})">{inner}</g>'
            f'<g transform="translate({mark_px+gap:.2f} {baseline+mark_y:.2f})">{body}</g>'
            f'</svg>')


# ------------------------------------------------------------------ writers
def write_svg(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text + "\n")
    print("  svg ", os.path.relpath(path, ROOT))


def write_png(path, svg, w, h=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(cairosvg.svg2png(bytestring=svg.encode(),
                                 output_width=w, output_height=h or w))
    print("  png ", os.path.relpath(path, ROOT), f"{w}x{h or w}")


def main() -> int:
    print("PrepAI brand assets")

    # --- marks -------------------------------------------------------------
    write_svg(f"{PUBLIC}/logo-mark.svg", mark_svg())
    write_svg(f"{PUBLIC}/logo-mark-paper.svg",
              mark_svg(badge=PAPER, glyph=INK, border=INK))
    write_svg(f"{PUBLIC}/logo-mark-mono.svg",
              mark_svg(bare=True, glyph="currentColor", accent=None))
    write_svg(f"{APPDIR}/icon.svg", mark_svg(radius=8))

    # --- raster icons ------------------------------------------------------
    write_png(f"{PUBLIC}/logo.png", mark_svg(), 512)
    write_png(f"{PUBLIC}/icon-192.png", mark_svg(radius=8), 192)
    write_png(f"{PUBLIC}/icon-512.png", mark_svg(radius=8), 512)
    # Maskable: full bleed, glyph pulled in to survive the 20% safe-zone crop.
    write_png(f"{PUBLIC}/icon-maskable-512.png",
              mark_svg(radius=0, xform=fit(glyph_h=19.0)), 512)
    write_png(f"{APPDIR}/apple-icon.png", mark_svg(radius=0), 180)

    # favicon.ico — supersample, then downsample so the counter survives 16px
    frames = []
    for s in (16, 32, 48, 64):
        d = cairosvg.svg2png(bytestring=mark_svg(radius=7).encode(),
                             output_width=s * 4, output_height=s * 4)
        frames.append(Image.open(io.BytesIO(d)).convert("RGBA")
                      .resize((s, s), Image.LANCZOS))
    frames[-1].save(f"{APPDIR}/favicon.ico", format="ICO",
                    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("  ico  ", os.path.relpath(f"{APPDIR}/favicon.ico", ROOT))

    # --- wordmark assets (need the font) -----------------------------------
    try:
        _font(700), _font(500)
    except FileNotFoundError as e:
        print(f"\n  skipped lockup + social card: {e}")
        print("  install with: npm i -D @fontsource/space-grotesk")
        return 0

    write_svg(f"{PUBLIC}/logo.svg", lockup_svg())
    write_svg(f"{PUBLIC}/logo-lockup-dark.svg",
              lockup_svg(ink=PAPER, badge=PAPER, glyph=INK))
    write_png(f"{PUBLIC}/logo-lockup.png",
              lockup_svg(mark_px=88, gap=26, text_px=84), 1114, 276)

    lk = lockup_svg(mark_px=112, gap=32, text_px=104)
    inner = lk.split(">", 1)[1].rsplit("</svg>", 1)[0]
    og = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"'
        f' width="1200" height="630">'
        f'<rect width="1200" height="630" fill="{PAPER_BG}"/>'
        f'<rect y="0" width="1200" height="14" fill="{INK}"/>'
        f'<rect y="616" width="1200" height="14" fill="{INK}"/>'
        f'<rect x="0" y="586" width="400" height="30" fill="{CRIMSON}"/>'
        f'<rect x="400" y="586" width="400" height="30" fill="{AZURE}"/>'
        f'<rect x="800" y="586" width="400" height="30" fill="{GOLD}"/>'
        f'<g transform="translate(96 152)">{inner}</g>'
        f'<g transform="translate(96 372)">{text_svg("AI-powered interview prep,", 56)[0]}</g>'
        f'<g transform="translate(96 442)">{text_svg("without the guesswork.", 56, CRIMSON)[0]}</g>'
        f'<g transform="translate(96 514)">'
        f'{text_svg("Mock interviews  /  Resume optimizer  /  Company research  /  Question bank", 25, INK_SOFT, 500, 0)[0]}'
        f'</g></svg>')
    write_png(f"{PUBLIC}/og-image.png", og, 1200, 630)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
