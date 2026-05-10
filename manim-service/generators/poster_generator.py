import os
import uuid
from PIL import Image, ImageDraw, ImageFont
from utils.prompt_parser import parse_prompt


def hex_to_rgb(hex_color: str) -> tuple:
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def generate_gradient(width: int, height: int, color1: tuple, color2: tuple) -> Image.Image:
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / height
        r = int(color1[0] + (color2[0] - color1[0]) * ratio)
        g = int(color1[1] + (color2[1] - color1[1]) * ratio)
        b = int(color1[2] + (color2[2] - color1[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def get_font(size: int, bold: bool = False):
    font_paths = [
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
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
    lines = []
    current = ''
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


def generate_poster(prompt: str, output_dir: str) -> str:
    parsed = parse_prompt(prompt)
    colors = parsed['colors']
    width, height = 800, 1000

    bg_color = hex_to_rgb(colors['bg'])
    primary = hex_to_rgb(colors['primary'])
    secondary = hex_to_rgb(colors['secondary'])

    # darker version of bg for gradient start
    darker = tuple(max(0, c - 30) for c in bg_color)
    img = generate_gradient(width, height, darker, bg_color)
    draw = ImageDraw.Draw(img)

    # Top accent bar
    draw.rectangle([0, 0, width, 8], fill=primary)
    draw.rectangle([0, height - 8, width, height], fill=primary)

    # Decorative circles
    draw.ellipse([-60, -60, 160, 160], outline=(*secondary, 40), width=3)
    draw.ellipse([-100, -100, 200, 200], outline=(*secondary, 20), width=2)
    draw.ellipse([640, 840, 900, 1100], outline=(*primary, 40), width=3)

    # Category badge
    badge_font = get_font(18, bold=True)
    badge_text = parsed['category'].upper()
    badge_x, badge_y = 40, 40
    bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    bw, bh = bbox[2] - bbox[0] + 20, bbox[3] - bbox[1] + 10
    draw.rounded_rectangle([badge_x, badge_y, badge_x + bw, badge_y + bh], radius=6, fill=primary)
    draw.text((badge_x + 10, badge_y + 5), badge_text, fill='white', font=badge_font)

    # Main title
    title_font = get_font(52, bold=True)
    title_lines = wrap_text(parsed['title'], title_font, width - 80, draw)
    y = 140
    for line in title_lines[:3]:
        draw.text((40, y), line, fill='white', font=title_font)
        bbox = draw.textbbox((40, y), line, font=title_font)
        y += bbox[3] - bbox[1] + 8

    # Divider
    y += 20
    draw.rectangle([40, y, 120, y + 4], fill=secondary)
    y += 30

    # Description from prompt
    desc_font = get_font(24)
    desc_text = prompt[:200]
    desc_lines = wrap_text(desc_text, desc_font, width - 80, draw)
    for line in desc_lines[:6]:
        draw.text((40, y), line, fill=(*secondary, 220), font=desc_font)
        bbox = draw.textbbox((40, y), line, font=desc_font)
        y += bbox[3] - bbox[1] + 6

    # Date/venue info
    y += 20
    info_font = get_font(22, bold=True)
    if parsed.get('date'):
        draw.text((40, y), f"Date: {parsed['date']}", fill='white', font=info_font)
        y += 36
    if parsed.get('venue'):
        draw.text((40, y), f"Venue: {parsed['venue']}", fill='white', font=info_font)
        y += 36

    # Bottom branding
    brand_font = get_font(20, bold=True)
    brand_text = 'Cohort Connect'
    draw.text((40, height - 60), brand_text, fill=(*secondary, 200), font=brand_font)

    website_font = get_font(16)
    draw.text((40, height - 35), 'cohortconnect.app', fill=(*secondary, 140), font=website_font)

    filename = f"poster_{uuid.uuid4().hex[:8]}.png"
    filepath = os.path.join(output_dir, filename)
    img.save(filepath, 'PNG', quality=95)
    return filepath
