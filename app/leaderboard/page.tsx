'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

type LeaderboardItem = {
  id: string
  name: string
  color: string
  votes: number
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)

      const { data: contestants, error: cError } =
        await supabase.from('contestants').select('*')

      const { data: votes, error: vError } =
        await supabase.from('votes').select('contestant_id')

      if (cError || vError) throw cError || vError

      const counts: Record<string, number> = {}

      votes?.forEach((v: any) => {
        counts[v.contestant_id] =
          (counts[v.contestant_id] || 0) + 1
      })

      const leaderboard: LeaderboardItem[] = contestants.map(
        (c: any) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          votes: counts[c.id] || 0,
        })
      )

      leaderboard.sort((a, b) => b.votes - a.votes)

      setData(leaderboard)
    } catch (err) {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const colorMap: Record<string, string> = {
    black: 'bg-zinc-900 shadow-zinc-700',
    red: 'bg-red-600 shadow-red-400',
    brown: 'bg-amber-800 shadow-amber-500',
    green: 'bg-green-600 shadow-green-400',
    blue: 'bg-blue-600 shadow-blue-400',
    yellow: 'bg-yellow-400 text-black shadow-yellow-300',
    pink: 'bg-pink-500 shadow-pink-300',
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white px-4 py-12">
      <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-10">
        🏆 Colour Battle Leaderboard
      </h1>

      {loading && (
        <p className="text-center text-gray-400">
          Loading leaderboard...
        </p>
      )}

      {error && (
        <p className="text-center text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="max-w-3xl mx-auto space-y-4">
          {data.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-5 rounded-2xl shadow-lg transition hover:scale-[1.02] ${colorMap[item.color] || 'bg-white/10'
                }`}
            >
              {/* LEFT SIDE */}
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold w-8 text-center">
                  {index + 1}
                </div>

                <div>
                  <div className="text-xl font-bold">
                    {item.name}
                  </div>

                  <div className="text-xs opacity-80 capitalize">
                    {item.color}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="text-2xl font-extrabold">
                {item.votes}
                <span className="text-sm ml-1 font-normal opacity-70">
                  votes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}