import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserShell from '@/components/user/UserShell'
import VideoCard from '@/components/user/VideoCard'
import { RiVideoLine } from 'react-icons/ri'

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

  return (
    <UserShell profile={profile}>
      <div>
        <div className="topbar">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              Welcome back, {firstName} 👋
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {videos?.length ?? 0} video{videos?.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>

        <div className="page-content">
          {videos && videos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 40 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 26, color: 'var(--accent)' }}>
                <RiVideoLine />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>No videos yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your instructor hasn&apos;t uploaded any videos yet.</div>
            </div>
          )}
        </div>
      </div>
    </UserShell>
  )
}
