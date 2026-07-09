import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminEventsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, contestants(count)')
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-300',
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-semibold hover:scale-[1.02] transition text-sm"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {!events?.length ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400 mb-4">No events yet</p>
          <Link
            href="/admin/events/new"
            className="text-white underline hover:text-gray-300"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
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
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[event.status] ?? statusColors.draft}`}>
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
