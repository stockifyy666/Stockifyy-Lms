'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'
import Image from 'next/image'
import {
  RiDashboardLine, RiUserLine, RiSunLine, RiMoonLine,
  RiLogoutBoxLine, RiShieldCheckLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'

interface Profile { full_name: string; email: string; role: string }

export default function AdminSidebar({ profile, open, onClose }: {
  profile: Profile
  open?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { dark, toggle } = useTheme()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth/login')
  }

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { href: '/admin/users', label: 'Users', icon: RiUserLine },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      <div className={`sidebar-backdrop${open ? ' open' : ''}`} onClick={onClose} />

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Brand */}
        <div style={{ height: 60, padding: '0 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image src="/logo.svg" alt="Stockifyy" width={120} height={34} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          <div className="nav-section-label" style={{ marginBottom: 6, marginTop: 4 }}>Navigation</div>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }} onClick={onClose}>
              <div className={`nav-item${pathname === href ? ' active' : ''}`}>
                <Icon style={{ fontSize: 16, flexShrink: 0 }} />
                {label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '10px 8px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            padding: '10px 12px', borderRadius: 10, marginBottom: 6,
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 12, background: 'var(--accent)', flexShrink: 0 }}>
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                <RiShieldCheckLine style={{ fontSize: 10, color: 'var(--accent)' }} />
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Admin</span>
              </div>
            </div>
          </div>

          <button className="nav-item" onClick={toggle} style={{ marginBottom: 2 }}>
            {dark ? <RiSunLine style={{ fontSize: 15 }} /> : <RiMoonLine style={{ fontSize: 15 }} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button className="nav-item danger" onClick={handleLogout}>
            <RiLogoutBoxLine style={{ fontSize: 15 }} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
