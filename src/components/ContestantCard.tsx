'use client'

import Image from 'next/image'
import { supabase } from '@/src/lib/supabase'

export default function ContestCard({ contestant }: { contestant: any }) {
  const vote = async () => {
    const alreadyVoted = localStorage.getItem('voted')

    if (alreadyVoted) {
      alert('You already voted!')
      return
    }

    const { error } = await supabase
      .from('votes')
      .insert({
        contestant: contestant.id,
      })

    if (!error) {
      localStorage.setItem('voted', 'true')
      alert(`You voted for ${contestant.name}`)
    }
  }

  return (
    <div
      className={`bg-gradient-to-br ${contestant.gradient} rounded-3xl overflow-hidden shadow-xl`}
    >
      <div className="grid grid-cols-2 gap-2 p-4">
        {contestant.options.map((image: string, i: number) => (
          <Image
            key={i}
            src={image}
            alt={contestant.name}
            width={500}
            height={500}
            className="rounded-xl object-cover h-60"
          />
        ))}
      </div>

      <div className={`p-6 ${contestant.text}`}>
        <h2 className="text-3xl font-bold">
          {contestant.name}
        </h2>

        <p className="text-lg mt-2">
          {contestant.tagline}
        </p>

        <p className="opacity-80 mt-4">
          {contestant.description}
        </p>

        <button
          onClick={vote}
          className="mt-6 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          Vote
        </button>
      </div>
    </div>
  )
}