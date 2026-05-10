'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import toast from 'react-hot-toast'
import { capitalize } from '../lib/helper'
import EventRegistrationModal from './EventRegistrationModal'

export default function ContestCard({ contestant }: { contestant: any }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const [initialDistance, setInitialDistance] = useState<number | null>(null)
  const handleMouseDown = () => {
    if (scale > 1) setIsDragging(true)
  }

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

  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }))
  }
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

  const minSwipeDistance = 50

  // ---------------- USER ID ----------------
  function getUserId() {
    let id = localStorage.getItem('user_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('user_id', id)
    }
    return id
  }

  // ---------------- IP ----------------
  async function getIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch {
      return null
    }
  }

  // ---------------- CHECK IF ALREADY VOTED ----------------
  const hasVoted = async () => {
    const userId = getUserId()

    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    return !!data
  }


  // ---------------- VOTE ----------------
  const vote = async () => {
    if (loading) return

    setLoading(true)

    try {
      const alreadyVoted = await hasVoted()

      if (alreadyVoted) {
        toast.error('You already voted!')
        setLoading(false)
        return
      }

      const userId = getUserId()
      const ip = await getIP()
      const userAgent = navigator.userAgent
      const votePayload = {
        contestant_id: contestant.id,
        contestant_name: contestant.name,
        contestant_color: contestant.color,
        user_id: userId,
        ip_address: ip,
        user_agent: userAgent,
      }

      const { error } = await supabase.from('votes').insert(votePayload)

      if (error) throw error

      toast.success(`You voted for ${contestant.color} 🎉`)
      setShowRegistration(true)

      localStorage.setItem('voted', 'true')
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ---------------- IMAGE NAV ----------------
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

  // ---------------- KEYBOARD ----------------
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
      {/* CARD */}
      <div
        className={`bg-gradient-to-br ${contestant.gradient} rounded-2xl overflow-hidden shadow-xl`}
      >
        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {contestant.options.map((image: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className="overflow-hidden rounded-xl relative group"
            >
              <Image
                src={image}
                alt={contestant.name}
                width={500}
                height={700}
                className="object-cover h-56 w-full transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className={`p-5 ${contestant.text}`}>
          <h2 className="text-2xl font-bold">{capitalize(contestant.color)}</h2>

          <p className="text-sm mt-1 font-medium">
            {contestant.tagline}
          </p>

          <p className="text-sm mt-3 opacity-90">
            {contestant.description}
          </p>

          <button
            onClick={vote}
            disabled={loading}
            className={`mt-5 w-full py-3 rounded-full font-semibold transition ${loading
              ? 'bg-gray-300 text-gray-600'
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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIndex(null)
          }}
        >
          {/* CLOSE */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute z-50 top-4 right-4 text-white"
          >
            <X size={28} />
          </button>

          {/* LEFT ARROW */}
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full"
          >
            <ChevronLeft size={30} />
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full"
          >
            <ChevronRight size={30} />
          </button>

          <div
            className="relative max-w-5xl w-full overflow-hidden cursor-zoom-in"

            onClick={(e) => {
              e.stopPropagation()
              toggleZoom()
            }}
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
      <EventRegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
        contestant={contestant}
      />
    </>
  )
}