import os
import uuid
from PIL import Image, ImageDraw, ImageFont
from utils.prompt_parser import parse_prompt


def hex_to_rgb(hex_color: str) -> tuple:
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def get_font(size: int, bold: bool = False):
    font_paths = [
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def wrap_text(text: str, font, max_width: int, draw: ImageDraw.ImageDraw) -> list:
    words = text.split()
    lines, current = [], ''
    for word in words:
        test = (current + ' ' + word).strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def generate_thumbnail(prompt: str, output_dir: str) -> str:
    parsed = parse_prompt(prompt)
    colors = parsed['colors']
    width, height = 1280, 720

    bg = hex_to_rgb(colors['bg'])
    primary = hex_to_rgb(colors['primary'])
    secondary = hex_to_rgb(colors['secondary'])
    darker = tuple(max(0, c - 40) for c in bg)

    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(height):
        ratio = y / height
        r = int(darker[0] + (bg[0] - darker[0]) * ratio)
        g = int(darker[1] + (bg[1] - darker[1]) * ratio)
        b = int(darker[2] + (bg[2] - darker[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Left accent stripe
    draw.rectangle([0, 0, 10, height], fill=primary)

    # Decorative shapes
    draw.ellipse([900, -100, 1380, 380], outline=(*primary, 30), width=4)
    draw.ellipse([960, -60, 1320, 320], outline=(*secondary, 20), width=3)

    # Category label
    cat_font = get_font(28, bold=True)
    cat_text = parsed['category'].upper()
    cx, cy = 60, 80
    bbox = draw.textbbox((0, 0), cat_text, font=cat_font)
    bw = bbox[2] - bbox[0] + 24
    draw.rounded_rectangle([cx, cy, cx + bw, cy + 44], radius=8, fill=primary)
    draw.text((cx + 12, cy + 7), cat_text, fill='white', font=cat_font)

    # Main title — large and bold
    title_font = get_font(72, bold=True)
    title = parsed['title'][:50]
    title_lines = wrap_text(title, title_font, width - 120, draw)
    ty = 160
    for line in title_lines[:2]:
        draw.text((60, ty), line, fill='white', font=title_font)
        bbox = draw.textbbox((60, ty), line, font=title_font)
        ty += bbox[3] - bbox[1] + 10

    # Subtitle from prompt
    sub_font = get_font(32)
    sub_text = prompt[:100]
    sub_lines = wrap_text(sub_text, sub_font, width - 120, draw)
    sy = ty + 20
    for line in sub_lines[:2]:
        draw.text((60, sy), line, fill=(*secondary, 200), font=sub_font)
        bbox = draw.textbbox((60, sy), line, font=sub_font)
        sy += bbox[3] - bbox[1] + 8

    # Bottom bar
    draw.rectangle([0, height - 70, width, height], fill=(*primary, 180))
    brand_font = get_font(28, bold=True)
    draw.text((60, height - 52), 'Cohort Connect', fill='white', font=brand_font)

    filename = f"thumbnail_{uuid.uuid4().hex[:8]}.png"
    filepath = os.path.join(output_dir, filename)
    img.save(filepath, 'PNG', quality=95)
    return filepath
