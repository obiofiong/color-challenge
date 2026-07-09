import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { notFound } from 'next/navigation'
import { getLeaderboardStyle } from '@/src/lib/color-utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('slug', slug)
    .single()

  return { title: event ? `Leaderboard — ${event.title}` : 'Leaderboard' }
}

export default async function EventLeaderboardPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const { data: contestants } = await supabase
    .from('contestants')
    .select('*')
    .eq('event_id', event.id)

  const { data: votes } = await supabase
    .from('votes')
    .select('contestant_id')
    .eq('event_id', event.id)

  const counts: Record<string, number> = {}
  votes?.forEach((v: any) => {
    counts[v.contestant_id] = (counts[v.contestant_id] || 0) + 1
  })

  const leaderboard = (contestants ?? [])
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      color: c.color ?? '',
      gradient: c.gradient,
      votes: counts[c.id] || 0,
    }))
    .sort((a, b) => b.votes - a.votes)

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white px-4 py-12">
      <Link
        href={`/events/${slug}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 max-w-3xl mx-auto"
      >
        <ArrowLeft size={18} />
        Back to event
      </Link>

      <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-10">
        {event.title} — Leaderboard
      </h1>

      {leaderboard.length === 0 ? (
        <p className="text-center text-gray-400">No votes yet</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {leaderboard.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-5 rounded-2xl shadow-lg transition hover:scale-[1.02] ${
                item.gradient
                  ? `bg-gradient-to-br ${item.gradient}`
                  : getLeaderboardStyle(item.color)
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold w-8 text-center">
                  {index + 1}
                </div>
                <div>
                  <div className="text-xl font-bold">{item.name}</div>
                  {item.color && (
                    <div className="text-xs opacity-80 capitalize">{item.color}</div>
                  )}
                </div>
              </div>
              <div className="text-2xl font-extrabold">
                {item.votes}
                <span className="text-sm ml-1 font-normal opacity-70">votes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
