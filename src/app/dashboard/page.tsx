import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserShell from '@/components/user/UserShell'
import VideoCard from '@/components/user/VideoCard'
import { RiVideoLine, RiTimeLine, RiPlayCircleLine, RiCalendarLine } from 'react-icons/ri'

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin/dashboard')

  const { data: videos } = await supabase
    .from('videos').select('*').eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const total = videos?.length ?? 0
  const expiringSoon = videos?.filter(v => {
    const days = (new Date(v.expires_at).getTime() - Date.now()) / 86400000
    return days <= 2
  }).length ?? 0
  const newest = videos?.[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <UserShell profile={profile}>
      <div>
        <div className="topbar">
          <div style={{ minWidth: 0 }}>
            <div className="topbar-title" style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              My Dashboard
            </div>
            <div className="topbar-subtitle" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {total} lecture{total !== 1 ? 's' : ''} available
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-muted)', flexShrink: 0 }}>
            <RiCalendarLine style={{ fontSize: 14 }} />
            {today}
          </div>
        </div>

        <div className="page-content">
          {/* Welcome banner */}
          <div style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
                Welcome back, {firstName} 👋
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                {total > 0
                  ? `You have ${total} lecture${total !== 1 ? 's' : ''} to explore. Keep learning!`
                  : 'No lectures yet — check back soon.'}
              </div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, position: 'relative', zIndex: 1 }}>
              🎓
            </div>
          </div>

          {/* Stat cards */}
          <div className="stat-grid">
            <StatCard
              icon={<RiVideoLine />}
              label="Total Lectures"
              value={total}
              sub="available now"
              color="var(--accent)"
              bg="var(--accent-light)"
            />
            <StatCard
              icon={<RiTimeLine />}
              label="Expiring Soon"
              value={expiringSoon}
              sub="within 2 days"
              color="var(--warning)"
              bg="var(--warning-bg)"
            />
            <StatCard
              icon={<RiPlayCircleLine />}
              label="Latest Lecture"
              value={newest ? new Date(newest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              sub={newest?.title ?? 'No lectures yet'}
              color="var(--success)"
              bg="var(--success-bg)"
              isText
            />
          </div>

          {/* Video grid */}
          {videos && videos.length > 0 ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>
                All Lectures
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {videos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 26, color: 'var(--accent)' }}>
                <RiVideoLine />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>No lectures yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your instructor hasn&apos;t uploaded any videos yet.</div>
            </div>
          )}
        </div>
      </div>
    </UserShell>
  )
}

function StatCard({ icon, label, value, sub, color, bg, isText }: {
  icon: React.ReactNode; label: string; value: number | string; sub: string
  color: string; bg: string; isText?: boolean
}) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
        </div>
      </div>
      <div style={{ fontSize: isText ? 18 : 32, fontWeight: 800, color, lineHeight: 1, textAlign: 'right', flexShrink: 0 }}>{value}</div>
    </div>
  )
}
