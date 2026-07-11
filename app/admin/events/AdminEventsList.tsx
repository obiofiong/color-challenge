'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-300',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-blue-500/20 text-blue-400',
}

export default function AdminEventsList({ events }: { events: any[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = events.filter((event) => {
    if (status !== 'all' && event.status !== status) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const haystack = `${event.title} ${event.slug}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or slug..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {!filtered.length ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No events match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event: any) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="block bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    /{event.slug} &middot; {event.contestants?.[0]?.count ?? 0} contestants
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[event.status] ?? STATUS_COLORS.draft}`}>
                  {event.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
