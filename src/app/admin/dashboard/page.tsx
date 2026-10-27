import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import VideoUploadForm from '@/components/admin/VideoUploadForm'
import AdminVideoList from '@/components/admin/AdminVideoList'
import { RiVideoLine, RiUserLine, RiTimeLine, RiCalendarLine } from 'react-icons/ri'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: videos } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
  const { data: users } = await supabase.from('profiles').select('*').eq('role', 'user')

  const expiringSoon = videos?.filter(v => {
    const days = (new Date(v.expires_at).getTime() - Date.now()) / 86400000
    return days <= 2 && days > 0
  }).length ?? 0

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <AdminShell profile={profile}>
      <div>
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Dashboard</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Overview of your LMS</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-muted)' }}>
            <RiCalendarLine style={{ fontSize: 14 }} />
            {today}
          </div>
        </div>

        <div className="page-content">
          {/* Stats */}
          <div className="stat-grid">
            <StatCard icon={<RiVideoLine />} label="Total Videos" value={videos?.length ?? 0} sub="uploaded" color="var(--accent)" bg="var(--accent-light)" />
            <StatCard icon={<RiUserLine />} label="Students" value={users?.length ?? 0} sub="enrolled" color="var(--info)" bg="var(--info-bg)" />
            <StatCard icon={<RiTimeLine />} label="Expiring Soon" value={expiringSoon} sub="within 2 days" color="var(--warning)" bg="var(--warning-bg)" />
          </div>

          {/* Upload */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Upload New Video</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>Videos auto-delete after 7 days · Max 2 GB</div>
            </div>
            <div className="card-body">
              <VideoUploadForm />
            </div>
          </div>

          {/* Video list */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>All Videos</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{videos?.length ?? 0} video{videos?.length !== 1 ? 's' : ''} total</div>
              </div>
            </div>
            <AdminVideoList videos={videos ?? []} />
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function StatCard({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string; value: number; sub: string; color: string; bg: string
}) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  )
}
