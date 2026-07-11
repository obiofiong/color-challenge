'use client'

import { X } from 'lucide-react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting...',
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: React.ReactNode
  confirmLabel?: string
  pendingLabel?: string
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel()
      }}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={() => !pending && onCancel()}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-sm text-gray-400 mb-6">{description}</div>

        <div className="flex gap-3 justify-end">
          <button
            disabled={pending}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={pending}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-400 transition disabled:opacity-50"
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
