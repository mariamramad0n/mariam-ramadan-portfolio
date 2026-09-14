import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    setLoading(false)

    if (signInError) {
      setError(signInError)
      return
    }

    navigate('/admin/dashboard')
  }

  const inputStyle = {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 24%, transparent)' }}
      />

      <div
        className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-2) 20%, transparent)' }}
      />

      <section className="soft-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          ← Back to portfolio
        </a>

        <div className="mt-8 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--accent)',
            }}
          >
            ◫
          </div>

          <p className="eyebrow mt-5">Private Area</p>

          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            Admin Login
          </h1>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Sign in to update projects, certificates, skills, and your portfolio profile.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <p
            className="mt-6 rounded-2xl border px-4 py-3 text-xs leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Supabase is not connected yet. Add your project URL and anon key to
            <code className="mx-1">.env.local</code>
            before signing in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Email address
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Password
            </label>

            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: '#DC5B4B', color: '#DC5B4B' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="primary-button w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in to dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-[10px] tracking-wide" style={{ color: 'var(--text-muted)' }}>
          PORTFOLIO MANAGEMENT SYSTEM
        </p>
      </section>
    </main>
  )
}