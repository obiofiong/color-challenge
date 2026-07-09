'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(
  _prevState: { error: string | null },
  formData: FormData
) {
  const user = await getSession()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const cover_image = formData.get('cover_image') as string
  const type = formData.get('type') as string
  const theme = formData.get('theme') as string
  const status = formData.get('status') as string
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const voting_starts_at = formData.get('voting_starts_at') as string
  const voting_ends_at = formData.get('voting_ends_at') as string
  const max_votes_per_user = parseInt(formData.get('max_votes_per_user') as string) || 1
  const allow_public_voting = formData.get('allow_public_voting') === 'on'

  if (!title || !slug) {
    return { error: 'Title and slug are required' }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('events').insert({
    title,
    slug,
    description,
    cover_image: cover_image || null,
    type: type || null,
    theme: theme || null,
    status: status || 'draft',
    starts_at: starts_at || null,
    ends_at: ends_at || null,
    voting_starts_at: voting_starts_at || null,
    voting_ends_at: voting_ends_at || null,
    max_votes_per_user,
    allow_public_voting,
    created_by: user.email,
  }).select('id').single()

  if (error) return { error: error.message }

  revalidatePath('/admin/events')
  revalidatePath('/')
  redirect(`/admin/events/${data.id}`)
}

export async function updateEvent(
  _prevState: { error: string | null },
  formData: FormData
) {
  const user = await getSession()
  if (!user) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const cover_image = formData.get('cover_image') as string
  const type = formData.get('type') as string
  const theme = formData.get('theme') as string
  const status = formData.get('status') as string
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const voting_starts_at = formData.get('voting_starts_at') as string
  const voting_ends_at = formData.get('voting_ends_at') as string
  const max_votes_per_user = parseInt(formData.get('max_votes_per_user') as string) || 1
  const allow_public_voting = formData.get('allow_public_voting') === 'on'
  const is_featured = formData.get('is_featured') === 'on'

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('events').update({
    title,
    slug,
    description,
    cover_image: cover_image || null,
    type: type || null,
    theme: theme || null,
    status,
    starts_at: starts_at || null,
    ends_at: ends_at || null,
    voting_starts_at: voting_starts_at || null,
    voting_ends_at: voting_ends_at || null,
    max_votes_per_user,
    allow_public_voting,
    is_featured,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/events')
  revalidatePath(`/admin/events/${id}`)
  revalidatePath('/')
  return { error: null }
}

export async function deleteEvent(id: string) {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/events')
  revalidatePath('/')
  redirect('/admin/events')
}
