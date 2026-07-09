'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { getUserId } from '../lib/user'

export default function EventRegistrationModal({
  open,
  onClose,
  contestant,
}: {
  open: boolean
  onClose: () => void
  contestant: any
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    interests: '',
  })

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

      toast.success('Successfully registered for future events 🎉')
      onClose()
      setForm({ full_name: '', email: '', phone: '', interests: '' })
    } catch (err: any) {
      if (err?.code === '23505') {
        toast.error('This email has already been registered.')
        return
      }
      toast.error('Failed to register')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-2">Join Future Events</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Thanks for voting for {contestant?.name ?? contestant?.color}. Register to participate in
          future challenges and other creative events.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="text"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
          />

          <input
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
          />

          <input
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
          />

          <textarea
            placeholder="What are your interests?"
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
          >
            {loading ? 'Submitting...' : 'Register Interest'}
          </button>
        </form>
      </div>
    </div>
  )
}
