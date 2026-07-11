'use client'

import { useActionState, use } from 'react'
import { submitApplication } from '@/app/actions/applications'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [state, formAction, pending] = useActionState(submitApplication, {
    error: null,
    success: false,
  })

  if (state.success) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
          <p className="text-gray-400 mb-6">
            Your application is under review. We will notify you once it has been processed.
          </p>
          <div className="flex flex-col items-center gap-2">
            <Link
              href={`/events/${slug}/apply/status`}
              className="text-white underline hover:text-gray-300"
            >
              Check application status
            </Link>
            <Link
              href={`/events/${slug}`}
              className="text-gray-400 hover:text-white text-sm"
            >
              Back to event
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link
          href={`/events/${slug}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to event
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Apply to Compete</h1>
            <p className="text-gray-400 text-sm">
              Submit your application to participate in this event. Applications are reviewed by the organizers.
            </p>
          </div>
          <Link
            href={`/events/${slug}/apply/status`}
            className="text-gray-400 hover:text-white text-xs underline whitespace-nowrap mt-1"
          >
            Already applied?
          </Link>
        </div>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {state.error}
          </div>
        )}

        <ApplyForm slug={slug} formAction={formAction} pending={pending} />
      </div>
    </main>
  )
}

function ApplyForm({
  slug,
  formAction,
  pending,
}: {
  slug: string
  formAction: (formData: FormData) => void
  pending: boolean
}) {
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Full Name *</label>
        <input
          name="full_name"
          required
          placeholder="Your full name"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Email *</label>
        <input
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Phone</label>
        <input
          name="phone"
          placeholder="Phone number"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Instagram</label>
        <input
          name="instagram"
          placeholder="@yourhandle"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Portfolio URL</label>
        <input
          name="portfolio_url"
          type="url"
          placeholder="https://yourportfolio.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Bio</label>
        <textarea
          name="bio"
          rows={4}
          placeholder="Tell us about yourself and your creative work..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
      >
        {pending ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}
