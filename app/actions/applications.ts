'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function submitApplication(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
) {
  const slug = formData.get('slug') as string
  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const instagram = formData.get('instagram') as string
  const portfolio_url = formData.get('portfolio_url') as string
  const bio = formData.get('bio') as string

  if (!full_name || !email || !slug) {
    return { error: 'Name, email, and event are required', success: false }
  }

  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!event) {
    return { error: 'Event not found', success: false }
  }

  const { error } = await supabase.from('event_applications').insert({
    event_id: event.id,
    full_name,
    email,
    phone: phone || null,
    instagram: instagram || null,
    portfolio_url: portfolio_url || null,
    bio: bio || null,
    status: 'pending',
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You have already applied to this event', success: false }
    }
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

type ApplicationStatusState = {
  error: string | null
  result: { status: string; submittedAt: string } | null
}

export async function checkApplicationStatus(
  _prevState: ApplicationStatusState,
  formData: FormData
): Promise<ApplicationStatusState> {
  const slug = formData.get('slug') as string
  const email = formData.get('email') as string

  if (!email || !slug) {
    return { error: 'Email is required', result: null }
  }

  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!event) {
    return { error: 'Event not found', result: null }
  }

  const { data: application } = await supabase
    .from('event_applications')
    .select('status, created_at')
    .eq('event_id', event.id)
    .eq('email', email)
    .maybeSingle()

  if (!application) {
    return { error: 'No application found for that email on this event', result: null }
  }

  return {
    error: null,
    result: { status: application.status, submittedAt: application.created_at },
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'approved' | 'rejected',
  eventId: string
) {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('event_applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.email,
    })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)

  if (status === 'approved') {
    const { data: app } = await supabase
      .from('event_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (app) {
      await supabase.from('contestants').insert({
        event_id: eventId,
        application_id: applicationId,
        name: app.full_name,
        bio: app.bio,
      })
    }
  }

  revalidatePath('/admin/applications')
  revalidatePath(`/admin/events/${eventId}`)
}
