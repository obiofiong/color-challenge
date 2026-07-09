import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import Link from 'next/link'
import { Calendar, Users, Vote, ClipboardList } from 'lucide-react'

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

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
