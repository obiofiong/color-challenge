import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import Link from 'next/link'
import { Calendar, Users, Vote, ClipboardList, Sparkles, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: eventCount },
    { count: contestantCount },
    { count: voteCount },
    { count: applicationCount },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('contestants').select('*', { count: 'exact', head: true }),
    supabase.from('votes').select('*', { count: 'exact', head: true }),
    supabase.from('event_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Events', value: eventCount ?? 0, icon: Calendar, href: '/admin/events' },
    { label: 'Contestants', value: contestantCount ?? 0, icon: Users, href: '/admin/events' },
    { label: 'Total Votes', value: voteCount ?? 0, icon: Vote, href: '/admin/events' },
    { label: 'Pending Applications', value: applicationCount ?? 0, icon: ClipboardList, href: '/admin/applications' },
  ]

  const isNewInstall = (eventCount ?? 0) === 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {isNewInstall && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-lg font-bold">Getting started</h2>
          </div>
          <ol className="space-y-3">
            <li>
              <Link
                href="/admin/events/new"
                className="flex items-center justify-between text-sm text-gray-300 hover:text-white transition group"
              >
                <span>1. Create your first event</span>
                <ArrowRight size={16} className="text-gray-500 group-hover:translate-x-1 transition" />
              </Link>
            </li>
            <li className="text-sm text-gray-500">
              2. Add contestants to it (from the event's page, once created)
            </li>
            <li className="text-sm text-gray-500">
              3. Set its status to <span className="text-gray-300">Active</span> when ready to go live
            </li>
            <li className="text-sm text-gray-500">
              4. Share the public link — <span className="text-gray-300">/events/[slug]</span> — with voters
            </li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon size={20} className="text-gray-400" />
              <span className="text-sm text-gray-400">{label}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
