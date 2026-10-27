'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { RiMailLine, RiLockLine, RiUserLine, RiArrowRightLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: 'user' } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Account created! Welcome to Stockifyy.')
    router.push('/dashboard')
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
            <span style={{ color: '#d4a017', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em' }}>FREE TO JOIN</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 26, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Start learning today,<br />for free.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, lineHeight: 1.65, marginBottom: 32 }}>
            Create your account and get instant access to all available lecture videos on the platform.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🎓', text: 'Unlimited access to all lectures' },
              { icon: '📱', text: 'Watch on any device, anywhere' },
              { icon: '🔐', text: 'Secure, identity-linked streaming' },
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
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Create account</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Join Stockifyy and start watching lectures.</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Full name</label>
              <div style={{ position: 'relative' }}>
                <RiUserLine style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none' }} />
                <input className="input" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" style={{ paddingLeft: 38 }} />
              </div>
            </div>

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
                <input className="input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 20px', fontSize: 14, marginTop: 4 }}
            >
              {loading ? 'Creating account…' : <><span>Create Account</span><RiArrowRightLine style={{ fontSize: 16 }} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
