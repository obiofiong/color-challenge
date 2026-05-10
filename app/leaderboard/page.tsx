'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { contestants } from '@/src/lib/contestants'

type LeaderboardItem = {
  name: string
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

      const { data: votes, error } = await supabase
        .from('votes')
        .select('contestant')

      if (error) throw error

      // Count votes per contestant
      const counts: Record<string, number> = {}

      votes.forEach((vote: any) => {
        counts[vote.contestant] =
          (counts[vote.contestant] || 0) + 1
      })

      // Map to contestants data
      const leaderboard: LeaderboardItem[] = contestants.map(
        (c) => ({
          name: c.name,
          votes: counts[c?.name] || 0,
        })
      )

      // Sort descending
      leaderboard.sort((a, b) => b.votes - a.votes)

      setData(leaderboard)
    } catch (err) {
      console.error(err)
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8">
        🏆 Leaderboard
      </h1>

      {/* STATES */}
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

      {/* LIST */}
      {!loading && !error && (
        <div className="max-w-2xl mx-auto space-y-4">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold w-6">
                  {index + 1}
                </span>

                <span className="text-lg sm:text-xl font-semibold">
                  {item.name}
                </span>
              </div>

              <span className="text-lg font-bold">
                {item.votes} votes
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}