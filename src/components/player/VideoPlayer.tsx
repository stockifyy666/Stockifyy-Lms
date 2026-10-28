'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  userEmail: string
  userName: string
}

export default function VideoPlayer({ videoUrl, title, userEmail, userName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [watermarkPos, setWatermarkPos] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const positions = [
    { left: '5%', top: '8%' },
    { left: '60%', top: '8%' },
    { left: '5%', top: '75%' },
    { left: '60%', top: '75%' },
    { left: '30%', top: '42%' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos(p => (p + 1) % positions.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const prevent = (e: MouseEvent) => e.preventDefault()
    el.addEventListener('contextmenu', prevent)
    return () => el.removeEventListener('contextmenu', prevent)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  function togglePlay() {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = parseFloat(e.target.value)
    if (videoRef.current) videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    if (videoRef.current) videoRef.current.volume = val
    setVolume(val)
  }

  function toggleMute() {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  function toggleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const pos = positions[watermarkPos]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        background: '#000',
        borderRadius: isFullscreen ? 0 : 12,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        width: '100%',
        height: isFullscreen ? '100vh' : undefined,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{
          width: '100%',
          display: 'block',
          aspectRatio: isFullscreen ? undefined : '16/9',
          maxHeight: isFullscreen ? '100vh' : '65vh',
          height: isFullscreen ? '100vh' : undefined,
          objectFit: 'contain',
        }}
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
        onEnded={() => setPlaying(false)}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        playsInline
      />

      {/* Watermark — logo + user info, moves every 8s */}
      <div
        style={{
          position: 'absolute',
          left: pos.left,
          top: pos.top,
          transition: 'left 1.2s ease, top 1.2s ease',
          pointerEvents: 'none',
          opacity: 0.55,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 4,
        }}
      >
        <Image src="/logo.svg" alt="Stockifyy" width={90} height={26} />
        <span style={{
          fontSize: 11,
          color: '#fff',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.45)',
          padding: '2px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
        }}>
          {userName} · {userEmail}
        </span>
      </div>

      {/* Click-to-play overlay */}
      <div onClick={togglePlay} style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 1 }} />

      {/* Controls */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          padding: '20px 16px 14px',
        }}
      >
        {/* Seek bar */}
        <input
          type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
          onChange={handleSeek}
          style={{ width: '100%', marginBottom: 10, accentColor: '#818cf8', cursor: 'pointer', height: 3 }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={togglePlay} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            {playing ? (
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div style={{ flex: 1 }} />

          <button onClick={toggleMute} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            {muted || volume === 0 ? (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            ) : (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            )}
          </button>

          <input
            type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            onChange={handleVolume}
            style={{ width: 72, accentColor: '#818cf8', cursor: 'pointer', height: 3 }}
          />

          <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            {isFullscreen ? (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
            ) : (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
