'use client'

import { deleteEvent } from '@/app/actions/events'
import ConfirmDialog from '@/src/components/ConfirmDialog'
import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

export default function DeleteEventButton({
  eventId,
  eventTitle,
}: {
  eventId: string
  eventTitle?: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
      >
        <Trash2 size={16} />
        Delete Event
      </button>

      <ConfirmDialog
        open={open}
        pending={pending}
        title="Delete event"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="text-white font-semibold">{eventTitle ?? 'this event'}</span>?
            This will permanently remove all of its contestants, images, votes, and
            applications. This cannot be undone.
          </>
        }
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            await deleteEvent(eventId)
          })
        }
      />
    </>
  )
}
