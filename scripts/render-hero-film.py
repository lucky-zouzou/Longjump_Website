"""Render a silent, seamlessly looping brand film from the site's existing stills.

Requires ffmpeg with libx264, supplied through FFMPEG_BINARY or PATH.
No synthetic product frames, audio, typography, or interface are baked in.
"""

import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get('FFMPEG_BINARY') or shutil.which('ffmpeg')
if not FFMPEG:
    raise SystemExit('Set FFMPEG_BINARY to an ffmpeg executable with libx264.')

FPS = 30
SHOT_SECONDS = 5
FADE_SECONDS = 0.8
PERIOD = 3 * (SHOT_SECONDS - FADE_SECONDS)
SHOTS = [
    ('hero.jpg', 0.65, 0.5, '1.015+0.075*on/149', 0.64, 0.52),
    ('stitching.jpg', 0.5, 0.35, '1.09-0.075*on/149', 0.5, 0.52),
    ('brand-detail.jpg', 0.62, 0.6, '1.015+0.065*on/149', 0.62, 0.58),
]


def run(args):
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def render(width, height, name):
    # Oversampling avoids one-pixel stepping during the slow camera moves.
    work_width, work_height = width * 2, height * 2
    with tempfile.TemporaryDirectory(prefix='loong-jump-film-') as scratch:
        clips = []
        for i, (asset, crop_x, crop_y, zoom, focus_x, focus_y) in enumerate(SHOTS):
            clip = str(Path(scratch) / f'shot-{i}.mp4')
            filters = (
                f'scale={work_width}:{work_height}:force_original_aspect_ratio=increase:flags=lanczos,'
                f'crop={work_width}:{work_height}:(iw-ow)*{crop_x}:(ih-oh)*{crop_y},'
                f"zoompan=z='{zoom}':x='(iw-iw/zoom)*{focus_x}':y='(ih-ih/zoom)*{focus_y}'"
                f':d={FPS * SHOT_SECONDS}:s={width}x{height}:fps={FPS},'
                'setsar=1,format=yuv420p'
            )
            run(['-i', str(ROOT / 'public/images' / asset), '-vf', filters,
                 '-frames:v', str(FPS * SHOT_SECONDS), '-an', '-c:v', 'libx264',
                 '-preset', 'fast', '-crf', '17', '-threads', '2', clip])
            clips.append(clip)
        inputs = [part for clip in [*clips, clips[0]] for part in ['-i', clip]]
        # Repeat the first shot, then trim its opening overlap: last and first
        # frames share the same camera trajectory instead of fading through black.
        # Keep the frame at 13.4s where the final dissolve is fully complete;
        # start at 25/30s so the next loop continues with the next camera frame.
        graph = (
            '[0:v]settb=AVTB[a];[1:v]settb=AVTB[b];[2:v]settb=AVTB[c];[3:v]settb=AVTB[d];'
            '[a][b]xfade=transition=fade:duration=0.8:offset=4.2[ab];'
            '[ab][c]xfade=transition=fade:duration=0.8:offset=8.4[abc];'
            '[abc][d]xfade=transition=fade:duration=0.8:offset=12.6,'
            'trim=start_frame=25:end_frame=403,setpts=PTS-STARTPTS,format=yuv420p[out]'
        )
        destination = ROOT / 'public/videos' / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        run([*inputs, '-filter_complex_threads', '1', '-filter_complex', graph,
             '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow',
             '-crf', '23', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
             '-r', str(FPS), '-t', str(PERIOD), '-movflags', '+faststart',
             '-threads', '2', str(destination)])
        print(f'{name}: {width} × {height}, {PERIOD:.1f}s, {destination.stat().st_size / 1_000_000:.2f} MB', flush=True)


if __name__ == '__main__':
    render(1600, 900, 'loong-jump-brand-film.mp4')
    render(720, 960, 'loong-jump-brand-film-mobile.mp4')
