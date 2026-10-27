'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { RiMailLine, RiLockLine, RiArrowRightLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg)' }}>
      {/* Left accent panel */}
      <div style={{ width: 380, minWidth: 0, flex: '0 1 380px', background: 'var(--accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo.svg" alt="Stockifyy" width={28} height={28} style={{ filter: 'brightness(10)', flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>Stockifyy</span>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 24, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Learn at your own pace, securely.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.6 }}>
            Access your lectures anytime. Videos auto-expire to keep content fresh and secure.
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>© 2025 Stockifyy</p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, minWidth: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Sign in</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>Welcome back — enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <RiMailLine style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none' }} />
                <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <RiLockLine style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none' }} />
                <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 20px', fontSize: 14, marginTop: 4 }}
            >
              {loading ? 'Signing in…' : <><span>Sign In</span><RiArrowRightLine style={{ fontSize: 16 }} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 24 }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
