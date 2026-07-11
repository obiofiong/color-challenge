import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AdminEventsList from './AdminEventsList'

export default async function AdminEventsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, contestants(count)')
    .order('created_at', { ascending: false })

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
        <AdminEventsList events={events} />
      )}
    </div>
  )
}
