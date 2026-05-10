import ContestCard from '@/src/components/ContestantCard'
import { contestants } from '@/src/lib/contestants'

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-4 sm:px-6 md:px-10 py-10">
      {/* TITLE */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-6">
        COLOUR CHALLENGE 🎨
      </h1>

      {/* DESCRIPTION */}
      <p className="text-center text-gray-300 max-w-2xl mx-auto mb-10 text-sm sm:text-base md:text-lg leading-relaxed">
        Welcome to the Colour Challenge — a creative showdown where contestants
        express their identity, mood, and story through color. Each contestant
        presents a unique palette and visual style.
        <br />
        <br />
        Explore the designs, feel the vibe, and vote for the one that stands out
        the most.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {contestants.map((contestant) => (
          <ContestCard
            key={contestant.name}
            contestant={contestant}
          />
        ))}
      </div>
    </main>
  )
}