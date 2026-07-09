'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, { error: null as string | null })

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
        <p className="text-gray-400 text-sm mb-8">
          Sign in to manage events and contestants.
        </p>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30 transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30 transition"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            {pending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
