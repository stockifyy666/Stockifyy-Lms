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
      <div className="auth-left" style={{ width: 400, minWidth: 0, flex: '0 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background elements */}
        <div className="auth-glow-top" style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="auth-glow-bottom" style={{ position: 'absolute', bottom: 60, left: -60, width: 240, height: 240, borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="auth-line-gold" style={{ position: 'absolute', top: '40%', right: 20, width: 1, height: 120, pointerEvents: 'none' }} />
        <div className="auth-line-white" style={{ position: 'absolute', top: '30%', left: 20, width: 1, height: 80, pointerEvents: 'none' }} />

        {/* Logo */}
        <Image src="/logo.svg" alt="Stockifyy" width={140} height={40} style={{ position: 'relative', zIndex: 1 }} />

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 20, padding: '5px 13px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a017', display: 'inline-block' }} />
            <span style={{ color: '#d4a017', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em' }}>SECP CERTIFIED PLATFORM</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 26, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Learn at your own pace,<br />securely.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, lineHeight: 1.65, marginBottom: 32 }}>
            Access your lectures anytime. Videos auto-expire to keep content fresh and secure.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🔒', text: 'Download-protected video streaming' },
              { icon: '📹', text: 'Watermarked with your identity' },
              { icon: '⏱️', text: 'Auto-expiring access links' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="auth-feature-icon" style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, position: 'relative', zIndex: 1 }}>© 2026 Stockifyy. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="auth-right" style={{ flex: 1, minWidth: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: 380, borderRadius: 16, padding: '36px 32px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Sign in</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Welcome back — enter your credentials to continue.</p>
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

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 24 }}>
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
