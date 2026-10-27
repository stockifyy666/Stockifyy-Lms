'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RiShieldUserLine, RiUserLine, RiArrowDownSLine } from 'react-icons/ri'

export default function RoleToggle({ userId, currentRole, isSelf }: { userId: string; currentRole: string; isSelf: boolean }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleOpen() {
    if (isSelf || loading) return
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) setMenuPos({ top: rect.bottom + 6, left: rect.left })
    setOpen(o => !o)
  }

  async function changeRole(newRole: string) {
    if (newRole === currentRole) { setOpen(false); return }
    setLoading(true)
    setOpen(false)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) toast.error('Failed to update role: ' + error.message)
    else { toast.success(`Role changed to ${newRole === 'admin' ? 'Admin' : 'Student'}`); router.refresh() }
    setLoading(false)
  }

  const isAdmin = currentRole === 'admin'

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loading || isSelf}
        title={isSelf ? "Can't change your own role" : 'Change role'}
        className="badge"
        style={{
          cursor: isSelf ? 'default' : 'pointer',
          border: 'none',
          background: isAdmin ? 'var(--accent-light)' : 'var(--info-bg)',
          color: isAdmin ? 'var(--accent)' : 'var(--info)',
          opacity: loading ? 0.6 : 1,
          gap: 5,
        }}
      >
        {isAdmin ? <RiShieldUserLine style={{ fontSize: 13 }} /> : <RiUserLine style={{ fontSize: 13 }} />}
        {loading ? 'Saving...' : isAdmin ? 'Admin' : 'Student'}
        {!isSelf && <RiArrowDownSLine style={{ fontSize: 13, opacity: 0.7 }} />}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            minWidth: 150,
            overflow: 'hidden',
          }}
        >
          {[
            { val: 'user', label: 'Student', icon: <RiUserLine />, bg: 'var(--info-bg)', color: 'var(--info)' },
            { val: 'admin', label: 'Admin', icon: <RiShieldUserLine />, bg: 'var(--accent-light)', color: 'var(--accent)' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => changeRole(opt.val)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px',
                background: currentRole === opt.val ? opt.bg : 'transparent',
                color: currentRole === opt.val ? opt.color : 'var(--text-primary)',
                border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: currentRole === opt.val ? 600 : 400,
              }}
            >
              {opt.icon} {opt.label}
              {currentRole === opt.val && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>current</span>}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
