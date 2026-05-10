'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'

export default function ContestCard({ contestant }: { contestant: any }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const vote = async () => {
    if (loading) return

    const alreadyVoted = localStorage.getItem('voted')

    if (alreadyVoted) {
      alert('You already voted!')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.from('votes').insert({
        contestant: contestant.id,
      })

      if (error) {
        throw error
      }

      localStorage.setItem('voted', 'true')
      alert(`You voted for ${contestant.name}`)
    } catch (err: any) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className={`bg-gradient-to-br ${contestant.gradient} rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl`}
      >
        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4">
          {contestant.options.map((image: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedImage(image)}
              className="relative group overflow-hidden rounded-xl sm:rounded-2xl"
            >
              <Image
                src={image}
                alt={contestant.name}
                width={500}
                height={500}
                className="object-cover h-32 sm:h-44 md:h-52 lg:h-60 w-full transition duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className={`p-4 sm:p-6 ${contestant.text}`}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {contestant.name}
          </h2>

          <p className="text-sm sm:text-base mt-1 sm:mt-2 font-medium">
            {contestant.tagline}
          </p>

          <p className="opacity-90 mt-3 sm:mt-4 leading-relaxed text-sm sm:text-base">
            {contestant.description}
          </p>

          <button
            onClick={vote}
            disabled={loading}
            className={`mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 w-full sm:w-auto
              ${loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-white text-black hover:scale-105'
              }`}
          >
            {loading ? 'Voting...' : 'Vote'}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={28} />
          </button>

          {/* IMAGE */}
          <div className="relative max-w-5xl w-full">
            <Image
              src={selectedImage}
              alt="Preview"
              width={1200}
              height={1200}
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl sm:rounded-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}