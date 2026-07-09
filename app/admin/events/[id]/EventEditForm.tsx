'use client'

import { useActionState } from 'react'
import { updateEvent } from '@/app/actions/events'

export default function EventEditForm({ event }: { event: any }) {
  const [state, formAction, pending] = useActionState(updateEvent, { error: null })

  const formatDate = (d: string | null) => {
    if (!d) return ''
    return new Date(d).toISOString().slice(0, 16)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit: {event.title}</h1>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {state.error}
        </div>
      )}

      {state.error === null && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-6 hidden" id="success-msg">
          Event updated successfully
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={event.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Title</label>
            <input
              name="title"
              required
              defaultValue={event.title}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Slug</label>
            <input
              name="slug"
              required
              defaultValue={event.slug}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={event.description ?? ''}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Cover Image URL</label>
          <input
            name="cover_image"
            type="url"
            defaultValue={event.cover_image ?? ''}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Type</label>
            <input
              name="type"
              defaultValue={event.type ?? ''}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Theme</label>
            <input
              name="theme"
              defaultValue={event.theme ?? ''}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Status</label>
            <select
              name="status"
              defaultValue={event.status ?? 'draft'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Starts At</label>
            <input
              name="starts_at"
              type="datetime-local"
              defaultValue={formatDate(event.starts_at)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Ends At</label>
            <input
              name="ends_at"
              type="datetime-local"
              defaultValue={formatDate(event.ends_at)}
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
              defaultValue={formatDate(event.voting_starts_at)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Voting Ends At</label>
            <input
              name="voting_ends_at"
              type="datetime-local"
              defaultValue={formatDate(event.voting_ends_at)}
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
              defaultValue={event.max_votes_per_user ?? 1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div className="flex items-center gap-6 pt-8">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                name="allow_public_voting"
                type="checkbox"
                defaultChecked={event.allow_public_voting}
                className="w-5 h-5 rounded"
              />
              Public Voting
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                name="is_featured"
                type="checkbox"
                defaultChecked={event.is_featured}
                className="w-5 h-5 rounded"
              />
              Featured
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
