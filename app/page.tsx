import ContestCard from '@/components/ContestantCard'
import { contestants } from '@/src/lib/contestants'

export default function Home() {
  return (
    <main className="min-h-screen bg-black p-10">
      <h1 className="text-5xl font-bold text-center text-white mb-10">
        COLOUR CHALLENGE
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
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