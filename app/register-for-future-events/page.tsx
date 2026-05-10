'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import toast from 'react-hot-toast'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    interests: '',
  })

  function getUserId() {
    let id = localStorage.getItem('user_id')

    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('user_id', id)
    }

    return id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const { error } = await supabase
        .from('future_event_registrations')
        .insert({
          ...form,
          user_id: getUserId() ?? null,
        })

      if (error) throw error

      toast.success('You have successfully joined future events 🎉')

      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (err: any) {
      console.error(err)

      if (err) {
        if (err?.code === '23505') {
          toast.error('This email has already been registered.')
          return
        }
        toast.error('Failed to register')
      }


    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-fuchsia-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-20">
        {/* BACK BUTTON */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-10"
        >
          <ArrowLeft size={18} />
          Back to challenge
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* LEFT CONTENT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 text-sm text-gray-300">
              <Sparkles size={16} />
              Creative Community Access
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Join Our Future
              <span className="block bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                Creative Events
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-xl mb-8">
              Thank you for participating in the Colour Challenge.
              We are building a growing community of photographers,
              designers, artists, storytellers, and creators.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold mb-1">
                  🎨 Future Colour Challenges
                </h3>
                <p className="text-sm text-gray-400">
                  Participate in bigger themed competitions with prizes and community voting.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold mb-1">
                  📸 Photography & Creative Events
                </h3>
                <p className="text-sm text-gray-400">
                  Get invited to collaborative shoots, showcases, and networking opportunities.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold mb-1">
                  🚀 Creator Community Access
                </h3>
                <p className="text-sm text-gray-400">
                  Connect with other creatives and stay updated on future opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Register Interest ✨
              </h2>

              <p className="text-gray-400 text-sm leading-relaxed">
                Fill in your details to receive updates about future events and collaborations.
              </p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Full Name
                </label>

                <input
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Email Address
                </label>

                <input
                  required
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Phone Number
                </label>

                <input
                  type="text"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Interests
                </label>

                <textarea
                  rows={5}
                  placeholder="Tell us the kind of creative events you would love to join..."
                  value={form.interests}
                  onChange={(e) =>
                    setForm({ ...form, interests: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 py-4 rounded-2xl font-bold text-white hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-fuchsia-500/20"
              >
                {loading ? 'Submitting...' : 'Join The Community'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}