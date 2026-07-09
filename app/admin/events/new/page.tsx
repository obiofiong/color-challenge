'use client'

import { useActionState } from 'react'
import { createEvent } from '@/app/actions/events'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CreateEventPage() {
  const [state, formAction, pending] = useActionState(createEvent, { error: null as string | null })
  const [title, setTitle] = useState('')

  const generateSlug = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
      >
        <ArrowLeft size={18} />
        Back to events
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create Event</h1>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Title *</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Colour Challenge 2025"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Slug *</label>
            <input
              name="slug"
              required
              defaultValue={generateSlug(title)}
              key={title}
              placeholder="colour-challenge-2025"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Describe the event..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Cover Image URL</label>
          <input
            name="cover_image"
            type="url"
            placeholder="https://example.com/cover.jpg"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Type</label>
            <input
              name="type"
              placeholder="photography, design, etc."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Theme</label>
            <input
              name="theme"
              placeholder="colour, fashion, etc."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Status</label>
          <select
            name="status"
            defaultValue="draft"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Starts At</label>
            <input
              name="starts_at"
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Ends At</label>
            <input
              name="ends_at"
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Voting Starts At</label>
            <input
              name="voting_starts_at"
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Voting Ends At</label>
            <input
              name="voting_ends_at"
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Max Votes Per User</label>
            <input
              name="max_votes_per_user"
              type="number"
              min="1"
              defaultValue="1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div className="flex items-center gap-3 pt-8">
            <input
              name="allow_public_voting"
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded"
            />
            <label className="text-sm text-gray-300">Allow Public Voting</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
        >
          {pending ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  )
}
