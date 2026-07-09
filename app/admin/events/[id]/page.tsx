import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import EventEditForm from './EventEditForm'
import DeleteContestantButton from './DeleteContestantButton'

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { data: contestants } = await supabase
    .from('contestants')
    .select('*, contestant_images(*)')
    .eq('event_id', id)

  const { data: votes } = await supabase
    .from('votes')
    .select('contestant_id')
    .eq('event_id', id)

  const voteCounts: Record<string, number> = {}
  votes?.forEach((v: any) => {
    voteCounts[v.contestant_id] = (voteCounts[v.contestant_id] || 0) + 1
  })

  return (
    <div>
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
      >
        <ArrowLeft size={18} />
        Back to events
      </Link>

      <EventEditForm event={event} />

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Contestants</h2>
          <Link
            href={`/admin/events/${id}/contestants/new`}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-semibold hover:scale-[1.02] transition text-sm"
          >
            <Plus size={16} />
            Add Contestant
          </Link>
        </div>

        {!contestants?.length ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No contestants yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contestants.map((c: any) => (
              <div
                key={c.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between"
              >
                <Link
                  href={`/admin/events/${id}/contestants/${c.id}`}
                  className="flex-1"
                >
                  <div className="flex items-center gap-4">
                    {c.contestant_images?.[0] && (
                      <img
                        src={c.contestant_images[0].image_url}
                        alt={c.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-sm text-gray-400">
                        {c.color && <span className="capitalize">{c.color}</span>}
                        {c.color && ' · '}
                        {c.contestant_images?.length ?? 0} images · {voteCounts[c.id] ?? 0} votes
                      </p>
                    </div>
                  </div>
                </Link>
                <DeleteContestantButton contestantId={c.id} eventId={id} contestantName={c.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
