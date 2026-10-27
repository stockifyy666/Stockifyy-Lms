import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import RoleToggle from '@/components/admin/RoleToggle'
import { RiCalendarLine } from 'react-icons/ri'

export default async function AdminUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false })

  const admins = users?.filter(u => u.role === 'admin').length ?? 0
  const students = users?.filter(u => u.role !== 'admin').length ?? 0

  return (
    <AdminShell profile={profile}>
      <div>
        <div className="topbar">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Users</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {students} student{students !== 1 ? 's' : ''} · {admins} admin{admins !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="page-content">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div className="avatar" style={{
                          width: 34, height: 34, fontSize: 13, flexShrink: 0,
                          background: u.role === 'admin' ? 'var(--accent)' : 'var(--info)',
                        }}>
                          {u.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>
                            {u.full_name || '—'}
                          </div>
                          {u.id === user.id && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                    <td>
                      <RoleToggle userId={u.id} currentRole={u.role} isSelf={u.id === user.id} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12.5 }}>
                        <RiCalendarLine style={{ fontSize: 13, flexShrink: 0 }} />
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
