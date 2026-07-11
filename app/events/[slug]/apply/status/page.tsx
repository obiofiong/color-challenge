'use client'

import { useActionState, use } from 'react'
import { checkApplicationStatus } from '@/app/actions/applications'
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_META: Record<string, { icon: typeof Clock; label: string; className: string }> = {
  pending: { icon: Clock, label: 'Pending review', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  approved: { icon: CheckCircle2, label: 'Approved', className: 'text-green-400 bg-green-500/10 border-green-500/20' },
  rejected: { icon: XCircle, label: 'Not selected', className: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

export default function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [state, formAction, pending] = useActionState<
    { error: string | null; result: { status: string; submittedAt: string } | null },
    FormData
  >(checkApplicationStatus, { error: null, result: null })

  const meta = state.result ? STATUS_META[state.result.status] : null
  const Icon = meta?.icon

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-md mx-auto">
        <Link
          href={`/events/${slug}/apply`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to apply
        </Link>

        <h1 className="text-3xl font-bold mb-2">Check Application Status</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Enter the email you applied with to see your current status.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            {pending ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mt-6">
            {state.error}
          </div>
        )}

        {state.result && meta && Icon && (
          <div className={`flex items-center gap-3 border rounded-2xl px-5 py-4 mt-6 ${meta.className}`}>
            <Icon size={22} className="shrink-0" />
            <div>
              <p className="font-semibold">{meta.label}</p>
              <p className="text-xs opacity-70">
                Submitted {new Date(state.result.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
