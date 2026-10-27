'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import Image from 'next/image'
import { RiMenuLine, RiLogoutBoxLine } from 'react-icons/ri'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Profile { full_name: string; email: string; role: string }

export default function AdminShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth/login')
  }

  return (
    <div className="app-shell">
      <AdminSidebar profile={profile} open={open} onClose={() => setOpen(false)} />
      <div className="main-content">
        {/* Mobile-only header bar */}
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setOpen(true)} style={{ display: 'flex' }}>
            <RiMenuLine style={{ fontSize: 18 }} />
          </button>
          <Image src="/logo.svg" alt="Stockifyy" width={100} height={28} priority style={{ height: 'auto' }} />
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}>
            <RiLogoutBoxLine style={{ fontSize: 17 }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
