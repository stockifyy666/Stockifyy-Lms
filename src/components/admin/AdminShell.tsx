'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import { RiMenuLine } from 'react-icons/ri'

interface Profile { full_name: string; email: string; role: string }

export default function AdminShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <AdminSidebar profile={profile} open={open} onClose={() => setOpen(false)} />
      <div className="main-content">
        {/* Inject hamburger into topbar via CSS trick — children render topbar */}
        <div style={{ position: 'relative' }}>
          <button className="menu-btn" onClick={() => setOpen(true)}
            style={{ position: 'absolute', top: 12, left: 16, zIndex: 11 }}>
            <RiMenuLine style={{ fontSize: 18 }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
