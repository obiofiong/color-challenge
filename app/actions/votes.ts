'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function castVote(
  contestantId: string,
  contestantName: string,
  contestantColor: string,
  eventId: string,
  userId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (existing) {
    return { error: 'You already voted in this event!' }
  }

  const headerStore = await headers()
  const forwarded = headerStore.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? null
  const userAgent = headerStore.get('user-agent') ?? null

  const { error } = await supabase.from('votes').insert({
    contestant_id: contestantId,
    contestant_name: contestantName,
    contestant_color: contestantColor,
    event_id: eventId,
    user_id: userId,
    ip_address: ip,
    user_agent: userAgent,
  })

  if (error) return { error: error.message }

  revalidatePath(`/events`)
  return { error: null }
}
