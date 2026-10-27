import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import VideoPlayer from '@/components/player/VideoPlayer'
import Image from 'next/image'
import Link from 'next/link'
import { RiArrowLeftLine, RiTimeLine, RiCalendarLine } from 'react-icons/ri'

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('email, full_name').eq('id', user.id).single()

  const { data: video } = await supabase
    .from('videos').select('*').eq('id', id).eq('is_active', true)
    .gt('expires_at', new Date().toISOString()).single()

  if (!video) notFound()

  // For uploadthing videos, storage_url is set; for legacy Supabase videos, generate signed URL
  if (!video.storage_url) {
    const { data: signedUrl } = await supabase.storage
      .from('videos').createSignedUrl(video.storage_path, 60)
    if (!signedUrl) notFound()
  }

  const videoUrl = `/api/video/${id}`

  const daysLeft = Math.ceil((new Date(video.expires_at).getTime() - Date.now()) / 86400000)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 7,
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13.5,
          transition: 'color 0.15s',
        }}>
          <RiArrowLeftLine style={{ fontSize: 16 }} />
          Back
        </Link>

        <Image src="/logo.svg" alt="Stockifyy" width={100} height={28} priority style={{ height: 'auto' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <RiTimeLine style={{ fontSize: 13 }} />
          {daysLeft}d left
        </div>
      </header>

      {/* Player area */}
      <div style={{ padding: '24px 32px' }}>
        <VideoPlayer
          videoUrl={videoUrl}
          title={video.title}
          userEmail={profile?.email ?? user.email ?? ''}
          userName={profile?.full_name ?? ''}
        />

        {/* Video info */}
        <div style={{ marginTop: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {video.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <RiCalendarLine style={{ fontSize: 13 }} />
              {new Date(video.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: daysLeft <= 2 ? 'var(--danger)' : 'var(--text-muted)' }}>
              <RiTimeLine style={{ fontSize: 13 }} />
              Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </div>
          </div>

          {video.description && (
            <div style={{
              marginTop: 18, padding: '16px 20px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: 10, fontSize: 13.5,
              color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              {video.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
