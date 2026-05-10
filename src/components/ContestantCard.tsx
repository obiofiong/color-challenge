'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ContestCard({ contestant }: { contestant: any }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const minSwipeDistance = 50

  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [selectedIndex])

  const toggleZoom = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }
  const handleMouseDown = () => {
    if (scale > 1) setIsDragging(true)
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }))
  }
  const [initialDistance, setInitialDistance] = useState<number | null>(null)

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchMoveZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches)

      if (initialDistance) {
        const scaleChange = distance / initialDistance
        setScale(Math.min(Math.max(1, scale * scaleChange), 4))
      }

      setInitialDistance(distance)
    }
  }

  const handleTouchEndZoom = () => {
    setInitialDistance(null)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd

    if (distance > minSwipeDistance) {
      nextImage() // swipe left → next
    } else if (distance < -minSwipeDistance) {
      prevImage() // swipe right → prev
    }
  }

  const vote = async () => {
    if (loading) return

    const alreadyVoted = localStorage.getItem('voted')

    if (alreadyVoted) {
      toast.error('You already voted!')
      return
    }

    try {
      setLoading(true)

      const promise = supabase.from('votes').insert({
        contestant_id: contestant.id,
        contestant_name: contestant.name,
        contestant_color: contestant.color,
      })

      await toast.promise(
        (async () => {
          const { error } = await supabase.from('votes').insert({
            contestant_id: contestant.id,
            contestant_name: contestant.name,
            contestant_color: contestant.color,
          })

          if (error) throw error
        })(),
        {
          loading: 'Submitting vote...',
          success: `You voted for ${contestant.name} 🎉`,
          error: 'Something went wrong',
        }
      )
      localStorage.setItem('voted', 'true')
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  const nextImage = () => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) =>
      prev === contestant.options.length - 1 ? 0 : (prev as number) + 1
    )
  }

  const prevImage = () => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) =>
      prev === 0 ? contestant.options.length - 1 : (prev as number) - 1
    )
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null)
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex])

  return (
    <>
      <div
        className={`bg-gradient-to-br ${contestant.gradient} rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl`}
      >
        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl sm:rounded-3xl">
          {contestant.options.map((image: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className="relative group overflow-hidden rounded-xl sm:rounded-2xl"
            >
              <Image
                src={image}
                alt={contestant.name}
                width={500}
                height={800}
                className="object-cover h-60 md:h-52 lg:h-60 w-full transition duration-300 group-hover:scale-105"
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
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedIndex(null)
            }
          }}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full"
          >
            <X size={28} />
          </button>


          {/* LEFT ARROW */}
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full"
          >
            <ChevronLeft size={28} />
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full"
          >
            <ChevronRight size={28} />
          </button>


          <div
            className="relative max-w-5xl w-full overflow-hidden cursor-zoom-in"
            onClick={toggleZoom}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMoveZoom}
            onTouchEnd={handleTouchEndZoom}
          >
            <Image
              src={contestant.options[selectedIndex]}
              alt="Preview"
              width={1200}
              height={1200}
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl transition-transform duration-200"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                cursor: scale > 1 ? 'grab' : 'zoom-in',
              }}
            />

            {/* COUNTER */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {selectedIndex + 1} / {contestant.options.length}
            </div>
          </div>

        </div>
      )}
    </>
  )
}