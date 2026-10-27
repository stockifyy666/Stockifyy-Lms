'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import Image from 'next/image'
import { RiMenuLine } from 'react-icons/ri'

interface Profile { full_name: string; email: string; role: string }

export default function AdminShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <AdminSidebar profile={profile} open={open} onClose={() => setOpen(false)} />
      <div className="main-content">
        {/* Mobile-only header bar */}
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setOpen(true)} style={{ display: 'flex' }}>
            <RiMenuLine style={{ fontSize: 18 }} />
          </button>
          <Image src="/logo.svg" alt="Stockifyy" width={100} height={28} />
          <div style={{ width: 36 }} />
        </div>
        {children}
      </div>
    </div>
  )
}
