'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

type ConnectionPreference = { saveData?: boolean };
const portraitFilmQuery = '(max-width: 760px) and (orientation: portrait)';
function filmSource() {
  return window.matchMedia(portraitFilmQuery).matches
    ? '/videos/loong-jump-brand-film-mobile.mp4'
    : '/videos/loong-jump-brand-film.mp4';
}

export function HeroFilm() {
  const visualRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRequested = useRef(false);
  const inView = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);

  function playFilm() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.getAttribute('src')) {
      video.src = filmSource();
    }
    // Some mobile browsers reject autoplay. The visible play button remains usable.
    video.muted = true;
    void video.play().catch(() => setPlaying(false));
  }

  useEffect(() => {
    const video = videoRef.current;
    const visual = visualRef.current;
    if (!video || !visual) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const portrait = window.matchMedia(portraitFilmQuery);
    const connection = (navigator as Navigator & { connection?: ConnectionPreference }).connection;
    playbackRequested.current = !motion.matches && !connection?.saveData;

    function syncPlayback() {
      if (playbackRequested.current && inView.current && !document.hidden) playFilm();
      else video?.pause();
    }
    function onMotionChange() {
      if (motion.matches) {
        playbackRequested.current = false;
        video?.pause();
      }
    }

    function onLayoutChange() {
      // Rotate without keeping the portrait crop on a wider screen.
      if (!video || !video.getAttribute('src')) return;
      setHasFrame(false);
      video.src = filmSource();
      video.load();
      syncPlayback();
    }

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      inView.current = entries[0]?.isIntersecting ?? false;
      syncPlayback();
    }, { threshold: 0 });
    observer?.observe(visual);
    if (!observer) syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', onMotionChange);
    portrait.addEventListener('change', onLayoutChange);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      motion.removeEventListener('change', onMotionChange);
      portrait.removeEventListener('change', onLayoutChange);
      video.pause();
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      playbackRequested.current = false;
      video.pause();
    } else {
      playbackRequested.current = true;
      if (video.error) {
        video.removeAttribute('src');
        video.load();
      }
      playFilm();
    }
  }

  return <>
    <div className="hero-visual" ref={visualRef} aria-hidden="true">
      <img src="/images/hero.jpg" width="2666" height="1499" alt="" fetchPriority="high"/>
      <video
        id="hero-brand-film"
        ref={videoRef}
        className={`hero-film${hasFrame ? ' is-ready' : ''}`}
        poster="/images/hero.jpg"
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        disablePictureInPicture
        onPlaying={() => { setHasFrame(true); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onError={() => { setHasFrame(false); setPlaying(false); }}
      />
    </div>
    <button
      className="hero-film-control"
      type="button"
      onClick={togglePlayback}
      aria-controls="hero-brand-film"
      aria-label={playing ? 'Jeda video koleksi' : 'Putar video koleksi'}
    >
      {playing ? <Pause size={15} aria-hidden="true"/> : <Play size={15} aria-hidden="true"/>}
      <span>{playing ? 'Jeda video' : 'Putar video'}</span>
    </button>
  </>;
}
