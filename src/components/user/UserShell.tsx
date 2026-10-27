'use client'

import { useState } from 'react'
import UserSidebar from './UserSidebar'
import { RiMenuLine } from 'react-icons/ri'

interface Profile { full_name: string; email: string }

export default function UserShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <UserSidebar profile={profile} open={open} onClose={() => setOpen(false)} />
      <div className="main-content">
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
