'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createContestant(
  _prevState: { error: string | null },
  formData: FormData
) {
  const user = await getSession()
  if (!user) return { error: 'Unauthorized' }

  const event_id = formData.get('event_id') as string
  const name = formData.get('name') as string
  const color = formData.get('color') as string
  const tagline = formData.get('tagline') as string
  const description = formData.get('description') as string
  const bio = formData.get('bio') as string
  const gradient = formData.get('gradient') as string
  const text_color = formData.get('text_color') as string

  if (!name || !event_id) {
    return { error: 'Name and event are required' }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('contestants').insert({
    event_id,
    name,
    color: color || null,
    tagline: tagline || null,
    description: description || null,
    bio: bio || null,
    gradient: gradient || null,
    text_color: text_color || null,
  }).select('id').single()

  if (error) return { error: error.message }

  const imageUrls = formData.getAll('image_urls') as string[]
  if (imageUrls.length > 0) {
    const imageRows = imageUrls
      .filter(url => url.trim())
      .map((url, i) => ({
        contestant_id: data.id,
        image_url: url.trim(),
        sort_order: i,
      }))

    if (imageRows.length > 0) {
      await supabase.from('contestant_images').insert(imageRows)
    }
  }

  revalidatePath(`/admin/events/${event_id}`)
  redirect(`/admin/events/${event_id}`)
}

export async function updateContestant(
  _prevState: { error: string | null },
  formData: FormData
) {
  const user = await getSession()
  if (!user) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const event_id = formData.get('event_id') as string
  const name = formData.get('name') as string
  const color = formData.get('color') as string
  const tagline = formData.get('tagline') as string
  const description = formData.get('description') as string
  const bio = formData.get('bio') as string
  const gradient = formData.get('gradient') as string
  const text_color = formData.get('text_color') as string

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('contestants').update({
    name,
    color: color || null,
    tagline: tagline || null,
    description: description || null,
    bio: bio || null,
    gradient: gradient || null,
    text_color: text_color || null,
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/admin/events/${event_id}`)
  revalidatePath(`/admin/events/${event_id}/contestants/${id}`)
  return { error: null }
}

export async function deleteContestant(id: string, eventId: string) {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createSupabaseServerClient()

  const { data: images } = await supabase
    .from('contestant_images')
    .select('image_url')
    .eq('contestant_id', id)

  if (images) {
    const storagePaths = images
      .map(img => {
        const match = img.image_url.match(/contestant-images\/(.+)$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    if (storagePaths.length > 0) {
      await supabase.storage.from('contestant-images').remove(storagePaths)
    }
  }

  await supabase.from('contestant_images').delete().eq('contestant_id', id)
  const { error } = await supabase.from('contestants').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/events/${eventId}`)
}

export async function addContestantImage(
  contestantId: string,
  eventId: string,
  imageUrl: string,
  sortOrder: number
) {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('contestant_images').insert({
    contestant_id: contestantId,
    image_url: imageUrl,
    sort_order: sortOrder,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/events/${eventId}/contestants/${contestantId}`)
}

export async function removeContestantImage(
  imageId: string,
  imageUrl: string,
  eventId: string,
  contestantId: string
) {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createSupabaseServerClient()

  const match = imageUrl.match(/contestant-images\/(.+)$/)
  if (match) {
    await supabase.storage.from('contestant-images').remove([match[1]])
  }

  const { error } = await supabase.from('contestant_images').delete().eq('id', imageId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/events/${eventId}/contestants/${contestantId}`)
}
