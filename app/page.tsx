import ContestCard from '@/src/components/ContestantCard'
import Countdown from '@/src/components/countdown'
import { contestants as localContestants } from '@/src/lib/contestants'
import { supabase } from '@/src/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase
    .from('contestants')
    .select('*')

  const { data: settings } = await supabase
    .from('settings')
    .select('voting_end')
    .eq('id', 'global')
    .single()

  if (error) {
    console.error(error)
  }

  const mergedContestants = data?.map((dbContestant: any) => {
    const local = localContestants.find(
      (c) => c.id === dbContestant.color
    )

    return {
      ...local,
      id: dbContestant.id,
    }
  })

  return (
    <main className="min-h-screen bg-black px-4 sm:px-6 md:px-10 py-10">

      {/* TITLE */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-6 md:mt-24">
        COLOUR CHALLENGE 🎨
      </h1>

      {/* DESCRIPTION */}
      <p className="text-center text-gray-300 max-w-2xl mx-auto mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
        Welcome to the Colour Challenge — a creative showdown where contestants
        express their identity, mood, and story through color.
        <br /><br />
        Explore the designs and vote for your favorite.
      </p>

      {/* COUNTDOWN FROM SUPABASE */}
      {settings?.voting_end && (
        <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 mb-10">
          <Countdown targetDate={settings.voting_end} />
        </div>
      )}

      {/* RULES */}
      <div className="max-w-3xl mx-auto mb-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-200">
        <h2 className="text-xl font-bold mb-4 text-white">
          📜 Voting Rules
        </h2>

        <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc list-inside">
          <li>Vote based on creativity, storytelling, and visual impact — not popularity.</li>

          <li className='font-bold'>
            Images that are heavily edited to portray a certain color effect should not be favoured over naturally
            captured or authentic visuals.
          </li>

          <li>Each person is allowed only one vote.</li>

          <li>Judging should be fair, unbiased, and based on personal interpretation.</li>
        </ul>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {mergedContestants?.map((contestant: any) => (
          <ContestCard
            key={contestant.id}
            contestant={contestant}
          />
        ))}
      </div>
    </main>
  )
}