#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成《数据结构与算法 · 互动自学学院》专属高清应用图标：
- 现代学院风蓝紫渐变圆角徽章
- 二叉树拓扑节点 + 精简光泽层次
- 输出 Tauri 2 所需的全部 PNG (RGBA) 与多尺寸 Windows ICO
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

APP_DIR = Path(__file__).resolve().parent
ICONS_DIR = APP_DIR / "src-tauri" / "icons"


def lerp(a: float, b: float, t: float) -> int:
    return int(round(a + (b - a) * t))


def make_base_icon(size: int = 1024) -> Image.Image:
    # 1. 创建蓝紫渐变背景（深靛蓝 -> 皇家蓝 -> 紫罗兰）
    grad = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = grad.load()
    c_tl = (29, 78, 216)    # #1D4ED8
    c_mid = (79, 70, 229)   # #4F46E5
    c_br = (124, 58, 237)   # #7C3AED

    for y in range(size):
        fy = y / (size - 1)
        for x in range(size):
            fx = x / (size - 1)
            t = 0.55 * fx + 0.45 * fy
            if t < 0.5:
                k = t * 2.0
                r = lerp(c_tl[0], c_mid[0], k)
                g = lerp(c_tl[1], c_mid[1], k)
                b = lerp(c_tl[2], c_mid[2], k)
            else:
                k = (t - 0.5) * 2.0
                r = lerp(c_mid[0], c_br[0], k)
                g = lerp(c_mid[1], c_br[1], k)
                b = lerp(c_mid[2], c_br[2], k)
            px[x, y] = (r, g, b, 255)

    # 2. 圆角矩形蒙版（现代 macOS / Windows 11 徽章比例）
    pad = int(size * 0.06)
    radius = int(size * 0.22)
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, fill=255)

    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(grad, (0, 0), mask)

    # 3. 顶部柔和高光晕影（学院质感）
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse(
        [int(size * 0.08), int(-size * 0.18), int(size * 0.92), int(size * 0.52)],
        fill=(255, 255, 255, 42),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=size * 0.04))
    glow_clipped = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_clipped.paste(glow, (0, 0), mask)
    icon = Image.alpha_composite(icon, glow_clipped)

    # 4. 微妙内边框高光
    border_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_layer)
    bdraw.rounded_rectangle(
        [pad + 6, pad + 6, size - pad - 6, size - pad - 6],
        radius=radius - 6,
        outline=(255, 255, 255, 65),
        width=max(4, size // 128),
    )
    icon = Image.alpha_composite(icon, border_layer)

    # 5. 二叉树数据结构徽标（居中清晰几何构图）
    # 节点坐标（按比例定位，小尺寸 32x32 依然极易辨识）
    root = (size * 0.50, size * 0.27)
    left = (size * 0.29, size * 0.53)
    right = (size * 0.71, size * 0.53)
    ll = (size * 0.19, size * 0.76)
    lr = (size * 0.40, size * 0.76)
    rl = (size * 0.60, size * 0.76)
    rr = (size * 0.81, size * 0.76)

    edges = [
        (root, left),
        (root, right),
        (left, ll),
        (left, lr),
        (right, rl),
        (right, rr),
    ]

    # 阴影层
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sh_off = size * 0.018
    edge_w = int(size * 0.036)
    for (x1, y1), (x2, y2) in edges:
        sdraw.line([(x1, y1 + sh_off), (x2, y2 + sh_off)], fill=(15, 23, 42, 95), width=edge_w)

    nodes_spec = [
        (root, size * 0.098, (255, 255, 255, 255), (56, 189, 248, 255)),  # 根节点：纯白+青蓝核
        (left, size * 0.078, (255, 255, 255, 255), (99, 102, 241, 255)),
        (right, size * 0.078, (255, 255, 255, 255), (168, 85, 247, 255)),
        (ll, size * 0.060, (224, 242, 254, 255), (56, 189, 248, 255)),
        (lr, size * 0.060, (224, 242, 254, 255), (56, 189, 248, 255)),
        (rl, size * 0.060, (243, 232, 255, 255), (192, 132, 252, 255)),
        (rr, size * 0.060, (243, 232, 255, 255), (192, 132, 252, 255)),
    ]

    for (cx, cy), r, _, _ in nodes_spec:
        sdraw.ellipse([cx - r, cy - r + sh_off, cx + r, cy + r + sh_off], fill=(15, 23, 42, 110))

    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size * 0.018))
    icon = Image.alpha_composite(icon, shadow)

    # 正式绘制连线与节点
    fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(fg)

    # 连线（半透明亮白，干净通透）
    for (x1, y1), (x2, y2) in edges:
        fdraw.line([(x1, y1), (x2, y2)], fill=(226, 232, 240, 235), width=edge_w)

    # 节点外圈与内点
    for idx, ((cx, cy), r, outer_col, inner_col) in enumerate(nodes_spec):
        fdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=outer_col)
        if idx == 0:
            # 根节点：青金色高亮环 + 中心亮白圆点
            ir = r * 0.56
            fdraw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=inner_col)
            cr = r * 0.26
            fdraw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(255, 255, 255, 255))
        elif idx in (1, 2):
            ir = r * 0.48
            fdraw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=inner_col)
        else:
            ir = r * 0.42
            fdraw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=inner_col)

    icon = Image.alpha_composite(icon, fg)
    return icon


def main() -> int:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    base = make_base_icon(1024)

    png_targets = {
        "icon.png": 512,
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
    }
    for fname, dim in png_targets.items():
        resized = base.resize((dim, dim), Image.Resampling.LANCZOS).convert("RGBA")
        out_path = ICONS_DIR / fname
        resized.save(out_path, format="PNG")
        print(f"[icons] generated {out_path.name} ({dim}x{dim}, RGBA)")

    ico_path = ICONS_DIR / "icon.ico"
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    base.resize((256, 256), Image.Resampling.LANCZOS).convert("RGBA").save(
        ico_path, format="ICO", sizes=ico_sizes
    )
    print(f"[icons] generated {ico_path.name} (multi-size: {[s[0] for s in ico_sizes]})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
