'use client'

import { updateApplicationStatus } from '@/app/actions/applications'
import { Check, X } from 'lucide-react'
import { useTransition } from 'react'

export default function ApplicationActions({
  applicationId,
  eventId,
}: {
  applicationId: string
  eventId: string
}) {
  const [pending, startTransition] = useTransition()

  const handle = (status: 'approved' | 'rejected') => {
    startTransition(() => updateApplicationStatus(applicationId, status, eventId))
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => handle('approved')}
        className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-500/20 transition disabled:opacity-50"
      >
        <Check size={14} />
        Approve
      </button>
      <button
        disabled={pending}
        onClick={() => handle('rejected')}
        className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-50"
      >
        <X size={14} />
        Reject
      </button>
    </div>
  )
}
