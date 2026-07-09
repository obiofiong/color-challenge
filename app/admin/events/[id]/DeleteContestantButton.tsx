'use client'

import { deleteContestant } from '@/app/actions/contestants'
import { Trash2, X } from 'lucide-react'
import { useState, useTransition } from 'react'

export default function DeleteContestantButton({
  contestantId,
  eventId,
  contestantName,
}: {
  contestantId: string
  eventId: string
  contestantName?: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
      >
        <Trash2 size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Delete contestant</h3>
              <button
                onClick={() => !pending && setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">
                {contestantName ?? 'this contestant'}
              </span>
              ? This will permanently remove their images and votes. This cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                disabled={pending}
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteContestant(contestantId, eventId)
                    setOpen(false)
                  })
                }
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-400 transition disabled:opacity-50"
              >
                {pending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
