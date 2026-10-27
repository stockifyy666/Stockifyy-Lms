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
      <div style={{ width: 380, minWidth: 0, flex: '0 1 380px', background: 'var(--accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 36px' }}>
        <Image src="/logo.svg" alt="Stockifyy" width={140} height={40} style={{ filter: 'brightness(10)' }} />
        <div>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 24, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Start learning today.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.6 }}>
            Create your account and get instant access to all available lecture videos.
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>© 2025 Stockifyy</p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, minWidth: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Create account</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>Join Stockifyy and start watching lectures.</p>
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

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 24 }}>
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
