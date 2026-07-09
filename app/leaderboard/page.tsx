import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, status')
    .in('status', ['active', 'completed'])
    .order('starts_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 max-w-3xl mx-auto"
      >
        <ArrowLeft size={18} />
        Back to events
      </Link>

      <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-10">
        Leaderboards
      </h1>

      {!events?.length ? (
        <p className="text-center text-gray-400">No events available</p>
      ) : (
        <div className="max-w-xl mx-auto space-y-3">
          {events.map((event: any) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}/leaderboard`}
              className="block bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
            >
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-400 capitalize">{event.status}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
