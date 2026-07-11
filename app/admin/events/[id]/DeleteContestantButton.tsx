'use client'

import { deleteContestant } from '@/app/actions/contestants'
import ConfirmDialog from '@/src/components/ConfirmDialog'
import { Trash2 } from 'lucide-react'
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

      <ConfirmDialog
        open={open}
        pending={pending}
        title="Delete contestant"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="text-white font-semibold">
              {contestantName ?? 'this contestant'}
            </span>
            ? This will permanently remove their images and votes. This cannot be undone.
          </>
        }
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            await deleteContestant(contestantId, eventId)
            setOpen(false)
          })
        }
      />
    </>
  )
}
