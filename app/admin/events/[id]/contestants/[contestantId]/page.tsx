'use client'

import { useActionState, useState, useTransition, use } from 'react'
import { updateContestant, addContestantImage, removeContestantImage } from '@/app/actions/contestants'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import { ArrowLeft, Upload, Link2, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function EditContestantPage({
  params,
}: {
  params: Promise<{ id: string; contestantId: string }>
}) {
  const { id: eventId, contestantId } = use(params)
  const [state, formAction, pending] = useActionState(updateContestant, { error: null })
  const [contestant, setContestant] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [removePending, startRemoveTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    async function load() {
      const { data: c } = await supabase
        .from('contestants')
        .select('*, contestant_images(*)')
        .eq('id', contestantId)
        .single()

      if (c) {
        setContestant(c)
        setImages(
          (c.contestant_images ?? []).sort(
            (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
          )
        )
      }
      setLoading(false)
    }

    load()
  }, [contestantId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    const supabase = createSupabaseBrowserClient()

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${eventId}/${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('contestant-images')
        .upload(path, file)

      if (!error) {
        const { data } = supabase.storage
          .from('contestant-images')
          .getPublicUrl(path)

        await addContestantImage(contestantId, eventId, data.publicUrl, images.length)
        setImages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), image_url: data.publicUrl, sort_order: prev.length },
        ])
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const addUrl = async () => {
    if (!urlInput.trim()) return
    await addContestantImage(contestantId, eventId, urlInput.trim(), images.length)
    setImages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), image_url: urlInput.trim(), sort_order: prev.length },
    ])
    setUrlInput('')
  }

  const handleRemoveImage = (img: any) => {
    startRemoveTransition(async () => {
      await removeContestantImage(img.id, img.image_url, eventId, contestantId)
      setImages((prev) => prev.filter((i) => i.id !== img.id))
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading contestant...</p>
      </div>
    )
  }

  if (!contestant) {
    return <p className="text-gray-400">Contestant not found</p>
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/events/${eventId}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
      >
        <ArrowLeft size={18} />
        Back to event
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit: {contestant.name}</h1>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={contestantId} />
        <input type="hidden" name="event_id" value={eventId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Name</label>
            <input
              name="name"
              required
              defaultValue={contestant.name}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Colour</label>
            <input
              name="color"
              defaultValue={contestant.color ?? ''}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Tagline</label>
          <input
            name="tagline"
            defaultValue={contestant.tagline ?? ''}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={contestant.description ?? ''}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Bio</label>
          <textarea
            name="bio"
            rows={2}
            defaultValue={contestant.bio ?? ''}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Gradient Classes</label>
            <input
              name="gradient"
              defaultValue={contestant.gradient ?? ''}
              placeholder="from-red-700 to-rose-500"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Text Colour Class</label>
            <input
              name="text_color"
              defaultValue={contestant.text_color ?? 'text-white'}
              placeholder="text-white or text-black"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Image Management */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Images</h2>

        <div className="flex gap-3 mb-4">
          <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition text-sm">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste image URL"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
          />
          <button
            type="button"
            onClick={addUrl}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition"
          >
            <Link2 size={16} />
          </button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img: any) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.image_url}
                  alt="Contestant"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  disabled={removePending}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No images yet</p>
        )}
      </div>
    </div>
  )
}
