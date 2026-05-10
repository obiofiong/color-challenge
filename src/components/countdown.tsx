'use client'

import { useEffect, useState } from 'react'

type Props = {
  targetDate: string
}

export default function Countdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  function getTimeLeft() {
    const difference = new Date(targetDate).getTime() - new Date().getTime()

    return {
      days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((difference / 1000 / 60) % 60)),
      seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
      expired: difference <= 0,
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (timeLeft.expired) {
    return (
      <div className="text-center text-red-400 font-bold text-lg">
        ⛔ Voting has ended
      </div>
    )
  }

  return (
    <div className="text-center text-white mb-10">
      <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
        Voting ends in
      </p>

      <div className="flex justify-center gap-4 text-lg font-bold">
        <span>{timeLeft.days}d</span>
        <span>{timeLeft.hours}h</span>
        <span>{timeLeft.minutes}m</span>
        <span>{timeLeft.seconds}s</span>
      </div>
    </div>
  )
}