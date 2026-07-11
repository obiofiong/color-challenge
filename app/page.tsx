import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import Link from 'next/link'
import { Calendar, Users, Sparkles, Trophy, ArrowRight, ImageOff } from 'lucide-react'

export default async function Home() {
  const supabase = await createSupabaseServerClient()

  const [{ data: events }, { count: contestantCount }, { count: voteCount }] = await Promise.all([
    supabase
      .from('events')
      .select('*, contestants(count)')
      .in('status', ['active', 'completed'])
      .order('is_featured', { ascending: false })
      .order('starts_at', { ascending: false }),
    supabase.from('contestants').select('*', { count: 'exact', head: true }),
    supabase.from('votes').select('*', { count: 'exact', head: true }),
  ])

  return (
    <main className="relative min-h-screen bg-black px-4 sm:px-6 md:px-10 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-fuchsia-600/20 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -top-20 right-0 w-[26rem] h-[26rem] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[24rem] h-[24rem] bg-amber-500/10 rounded-full blur-[120px]" />

      <div className="relative">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <Sparkles size={14} className="text-amber-400" />
            Vote. Compete. Win.
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-white mb-6 tracking-tight">
          Creative{' '}
          <span className="bg-gradient-to-r from-fuchsia-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
            Challenges
          </span>
        </h1>

        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-10 text-sm sm:text-base md:text-lg leading-relaxed">
          A platform for creative showdowns — photography, design, and more.
          <br />
          Browse active challenges, vote for your favourites, or apply to compete.
        </p>

        {(contestantCount ?? 0) > 0 && (
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-14 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{events?.length ?? 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Events</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{contestantCount ?? 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Contestants</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{voteCount ?? 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Votes cast</p>
            </div>
          </div>
        )}

        {!events?.length ? (
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4">
              <ImageOff className="text-gray-500" size={26} />
            </div>
            <p className="text-gray-400 mb-4">No active events right now</p>
            <Link
              href="/register-for-future-events"
              className="text-white underline hover:text-gray-300"
            >
              Register for future events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.07] transition-all hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden relative bg-gradient-to-br from-zinc-800 to-zinc-900">
                  {event.cover_image ? (
                    <img
                      src={event.cover_image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="text-white/10" size={48} />
                    </div>
                  )}
                  {event.is_featured && (
                    <span className="absolute top-3 right-3 text-xs bg-amber-500/90 text-black px-2.5 py-0.5 rounded-full font-semibold">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h2 className="text-xl font-bold text-white">{event.title}</h2>
                    <ArrowRight
                      size={18}
                      className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition shrink-0"
                    />
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {event.contestants?.[0]?.count ?? 0} contestants
                    </span>
                    {event.starts_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(event.starts_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`ml-auto px-2 py-0.5 rounded-full font-medium ${event.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                      }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="my-16 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-gray-500 text-sm">Not ready to vote yet?</p>
          <Link
            href="/register-for-future-events"
            className="inline-flex items-center gap-2 text-xl sm:text-2xl font-bold text-white hover:text-gray-300 transition"
          >
            Join Future Events
            <ArrowRight size={22} />
          </Link>
        </div>
      </div>
    </main>
  )
}
