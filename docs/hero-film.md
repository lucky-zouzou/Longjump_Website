# Hero brand film

The opening hero uses a silent 12.6-second MP4 edited from existing brand stills:

1. `public/images/hero.jpg` — cream canvas bag and caramel outfit.
2. `public/images/stitching.jpg` — close-up of stitching.
3. `public/images/brand-detail.jpg` — warm brown material and brand mark.

This is a motion edit of still images, with slow camera movement and cross-dissolves. It is not newly filmed footage or a claim of live factory production. The images, product shapes, and branding are retained. No new model, material, product specification, audio, or delivery claim is introduced.

`scripts/render-hero-film.py` creates a 1600 × 900 desktop film and a separately framed 720 × 960 mobile film using ffmpeg with libx264. Set `FFMPEG_BINARY` when ffmpeg is not on PATH. Both files use H.264/yuv420p and fast-start metadata, have no audio track, and loop without a black transition.

`HeroFilm` keeps the existing still as the initial/failure fallback and loads only the selected rendition. Playback is muted and inline, pauses outside the viewport or in a hidden tab, and has a visible keyboard-accessible play/pause control. Reduced-motion or data-saving preferences suppress automatic loading/playback; the visitor may explicitly play the film. Autoplay rejection leaves the manual play button available.
