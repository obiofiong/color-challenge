import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { notFound } from 'next/navigation'
import EventVotingSection from '@/src/components/EventVotingSection'
import Countdown from '@/src/components/countdown'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, cover_image')
    .eq('slug', slug)
    .single()

  if (!event) return { title: 'Event Not Found' }

  return {
    title: event.title,
    description: event.description ?? undefined,
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      images: event.cover_image ? [event.cover_image] : undefined,
    },
  }
}

export default async function EventPage({ params }: Props) {
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
    .select('*, contestant_images(*)')
    .eq('event_id', event.id)

  const mappedContestants = contestants?.map((c: any) => {
    const images = (c.contestant_images ?? [])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img: any) => img.image_url)

    return {
      ...c,
      options: images.length > 0 ? images : c.options ?? [],
      gradient: c.gradient ?? 'from-gray-700 to-gray-500',
      text: c.text_color ?? 'text-white',
    }
  })

  return (
    <main className="min-h-screen bg-black px-4 sm:px-6 md:px-10 py-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-6 md:mt-24">
        {event.title}
      </h1>

      {event.description && (
        <p className="text-center text-gray-300 max-w-2xl mx-auto mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
          {event.description}
        </p>
      )}

      {event.voting_ends_at && (
        <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 mb-10">
          <Countdown targetDate={event.voting_ends_at} />
        </div>
      )}

      <div className="max-w-3xl mx-auto mb-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-200">
        <h2 className="text-xl font-bold mb-4 text-white">Voting Rules</h2>
        <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc list-inside">
          <li>Vote based on creativity, storytelling, and visual impact — not popularity.</li>
          <li className="font-bold">
            Images that are heavily edited to portray a certain color effect should not be favoured over naturally
            captured or authentic visuals.
          </li>
          <li>Each person is allowed only one vote per event.</li>
          <li>Judging should be fair, unbiased, and based on personal interpretation.</li>
        </ul>
      </div>

      <EventVotingSection
        contestants={mappedContestants ?? []}
        eventId={event.id}
        eventSlug={slug}
      />

      <div className="my-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/events/${slug}/leaderboard`}
          className="text-white underline hover:text-gray-300 text-lg font-semibold"
        >
          View Leaderboard
        </Link>
        <Link
          href={`/events/${slug}/apply`}
          className="text-white underline hover:text-gray-300 text-lg font-semibold"
        >
          Apply to Compete
        </Link>
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm"
        >
          Back to all events
        </Link>
      </div>
    </main>
  )
}
