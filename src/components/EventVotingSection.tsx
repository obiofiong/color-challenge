'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Users } from 'lucide-react'
import Link from 'next/link'
import { getMyVote } from '@/app/actions/votes'
import { getUserId } from '../lib/user'
import { capitalize } from '../lib/helper'
import ContestCard from './ContestantCard'

export default function EventVotingSection({
  contestants,
  eventId,
  eventSlug,
}: {
  contestants: any[]
  eventId: string
  eventSlug: string
}) {
  const [votedContestantId, setVotedContestantId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false

    getMyVote(eventId, getUserId()).then((contestantId) => {
      if (!cancelled) {
        setVotedContestantId(contestantId)
        setChecked(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [eventId])

  const votedContestant = contestants.find((c) => c.id === votedContestantId)

  if (!contestants.length) {
    return (
      <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-12 text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <Users className="text-gray-500" size={26} />
        </div>
        <p className="text-gray-400 mb-4">No contestants yet — check back soon.</p>
        <Link
          href={`/events/${eventSlug}/apply`}
          className="text-white underline hover:text-gray-300"
        >
          Apply to compete
        </Link>
      </div>
    )
  }

  return (
    <>
      {checked && votedContestant && (
        <div className="max-w-3xl mx-auto mb-8 flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl px-5 py-4 text-sm sm:text-base">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>
            You voted for{' '}
            <span className="font-semibold">
              {votedContestant.name ?? capitalize(votedContestant.color)}
            </span>{' '}
            in this event.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {contestants.map((contestant: any) => (
          <ContestCard
            key={contestant.id}
            contestant={contestant}
            eventId={eventId}
            initiallyVoted={contestant.id === votedContestantId}
          />
        ))}
      </div>
    </>
  )
}
