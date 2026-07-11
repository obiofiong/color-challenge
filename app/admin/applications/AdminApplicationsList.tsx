'use client'

import { useMemo, useState } from 'react'
import ApplicationActions from './ApplicationActions'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

export default function AdminApplicationsList({ applications }: { applications: any[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [eventId, setEventId] = useState('all')

  const events = useMemo(() => {
    const map = new Map<string, string>()
    applications.forEach((app) => {
      if (app.event_id) map.set(app.event_id, app.events?.title ?? 'Unknown')
    })
    return Array.from(map.entries())
  }, [applications])

  const filtered = applications.filter((app) => {
    if (status !== 'all' && app.status !== status) return false
    if (eventId !== 'all' && app.event_id !== eventId) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const haystack = `${app.full_name} ${app.email}`.toLowerCase()
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
          placeholder="Search by name or email..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
        >
          <option value="all">All events</option>
          {events.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {!filtered.length ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No applications match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => (
            <div
              key={app.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{app.full_name}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {app.email}
                    {app.phone && ` · ${app.phone}`}
                    {app.instagram && ` · @${app.instagram}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Event: {app.events?.title ?? 'Unknown'}
                  </p>
                  {app.bio && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{app.bio}</p>
                  )}
                  {app.portfolio_url && (
                    <a
                      href={app.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline mt-1 inline-block"
                    >
                      View Portfolio
                    </a>
                  )}
                </div>

                {app.status === 'pending' && (
                  <ApplicationActions
                    applicationId={app.id}
                    eventId={app.event_id}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
