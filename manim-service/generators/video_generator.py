import os
import uuid
import subprocess
import textwrap
from utils.prompt_parser import parse_prompt

COLOR_MAP = {
    'hackathon': {'title': 'PURPLE', 'accent': 'BLUE', 'bg': '#1e1b4b'},
    'internship': {'title': 'GREEN', 'accent': 'TEAL', 'bg': '#064e3b'},
    'placement': {'title': 'GOLD', 'accent': 'YELLOW', 'bg': '#451a03'},
    'exam': {'title': 'RED', 'accent': 'ORANGE', 'bg': '#450a0a'},
    'resource': {'title': 'BLUE', 'accent': 'TEAL', 'bg': '#0c4a6e'},
    'tech': {'title': 'TEAL', 'accent': 'BLUE', 'bg': '#083344'},
    'event': {'title': 'PURPLE', 'accent': 'PINK', 'bg': '#3b0764'},
    'general': {'title': 'BLUE', 'accent': 'PURPLE', 'bg': '#1e1b4b'},
}


def build_manim_script(parsed: dict, scene_name: str) -> str:
    title = parsed['title'].replace("'", "\\'").replace('"', '\\"')
    category = parsed['category']
    colors = COLOR_MAP.get(category, COLOR_MAP['general'])
    keywords = parsed['keywords'][:4]

    bullet_points = []
    if parsed.get('date'):
        bullet_points.append(f"Date: {parsed['date']}")
    if parsed.get('venue'):
        bullet_points.append(f"Venue: {parsed['venue']}")
    for kw in keywords[:3]:
        bullet_points.append(kw.capitalize())
    if not bullet_points:
        bullet_points = ['Join Now', 'Limited Seats', 'Register Today']

    bullets_code = '\n'.join(
        [f"        Text('• {bp}', font_size=28, color={colors['accent']})," for bp in bullet_points[:4]]
    )

    script = f'''from manim import *

class {scene_name}(Scene):
    def construct(self):
        self.camera.background_color = "{colors['bg']}"

        title = Text(
            "{title}",
            font_size=48,
            color={colors['title']},
            weight=BOLD,
        ).scale_to_fit_width(config.frame_width - 2)

        subtitle = Text(
            "{category.upper()}",
            font_size=24,
            color=GRAY,
        )
        subtitle.next_to(title, DOWN, buff=0.3)

        title_group = VGroup(title, subtitle).move_to(ORIGIN).shift(UP * 1.5)

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(subtitle, shift=UP * 0.3), run_time=0.8)
        self.wait(0.5)

        divider = Line(LEFT * 5, RIGHT * 5, color={colors['accent']}, stroke_width=2)
        divider.next_to(title_group, DOWN, buff=0.4)
        self.play(Create(divider), run_time=0.6)

        bullets = VGroup(
{bullets_code}
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        bullets.next_to(divider, DOWN, buff=0.4).align_to(divider, LEFT)

        for bullet in bullets:
            self.play(FadeIn(bullet, shift=RIGHT * 0.3), run_time=0.4)
        self.wait(0.5)

        cta = Text(
            "Visit Cohort Connect",
            font_size=22,
            color={colors['accent']},
        )
        cta.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(cta, shift=UP * 0.2), run_time=0.6)

        self.play(
            title.animate.set_color({colors['accent']}),
            run_time=0.5,
        )
        self.wait(1.5)
        self.play(FadeOut(VGroup(title_group, divider, bullets, cta)), run_time=0.8)
'''
    return script


def generate_video(prompt: str, output_dir: str) -> str:
    parsed = parse_prompt(prompt)
    scene_name = f"CohortScene_{uuid.uuid4().hex[:6]}"
    script_content = build_manim_script(parsed, scene_name)

    script_path = os.path.join(output_dir, f"{scene_name}.py")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)

    cmd = [
        'python', '-m', 'manim', 'render',
        '-ql',
        '--format', 'mp4',
        '--output_file', scene_name,
        '--media_dir', output_dir,
        script_path,
        scene_name,
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=output_dir,
        )

        # Manim outputs to media/videos/<quality>/<scene_name>.mp4
        for root, dirs, files in os.walk(output_dir):
            for f in files:
                if f.endswith('.mp4') and scene_name in f:
                    return os.path.join(root, f)

        if result.returncode != 0:
            raise RuntimeError(f"Manim failed: {result.stderr[-500:]}")

        raise RuntimeError("Video file not found after render")
    finally:
        # Clean up script file
        if os.path.exists(script_path):
            os.remove(script_path)
