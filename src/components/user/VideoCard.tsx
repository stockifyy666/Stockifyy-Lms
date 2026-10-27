'use client'

import Link from 'next/link'
import Image from 'next/image'
import { RiPlayFill, RiTimeLine } from 'react-icons/ri'

interface Video { id: string; title: string; description: string; expires_at: string; created_at: string; thumbnail_url?: string }

export default function VideoCard({ video }: { video: Video }) {
  const daysLeft = Math.ceil((new Date(video.expires_at).getTime() - Date.now()) / 86400000)
  const urgent = daysLeft <= 2

  return (
    <Link href={`/watch/${video.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
        }}
      >
        {/* Thumbnail */}
        <div style={{ aspectRatio: '16/9', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {video.thumbnail_url
            ? <Image src={video.thumbnail_url} alt={video.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 600px) 100vw, 280px" />
            : null
          }
          {/* Play overlay */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: video.thumbnail_url ? 'rgba(0,0,0,0.25)' : 'transparent',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: video.thumbnail_url ? 'rgba(255,255,255,0.9)' : 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}>
              <RiPlayFill style={{ color: video.thumbnail_url ? 'var(--accent)' : '#fff', fontSize: 20, marginLeft: 2 }} />
            </div>
          </div>
          {urgent && (
            <span className="badge" style={{ position: 'absolute', top: 10, right: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 11 }}>
              Expires soon
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.title}
          </div>
          {video.description && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
              {video.description}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="badge" style={{ background: urgent ? 'var(--danger-bg)' : 'var(--accent-light)', color: urgent ? 'var(--danger)' : 'var(--accent)', fontSize: 11 }}>
              <RiTimeLine style={{ fontSize: 11 }} />
              {daysLeft}d left
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
