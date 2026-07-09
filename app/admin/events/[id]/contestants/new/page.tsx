'use client'

import { useActionState, useState } from 'react'
import { createContestant } from '@/app/actions/contestants'
import { getDefaultStyles } from '@/src/lib/color-utils'
import { createSupabaseBrowserClient } from '@/src/lib/supabase-browser'
import { ArrowLeft, Upload, Link2, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function NewContestantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: eventId } = use(params)
  const [state, formAction, pending] = useActionState(createContestant, { error: null as string | null })
  const [color, setColor] = useState('')
  const [gradient, setGradient] = useState('')
  const [textColor, setTextColor] = useState('text-white')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const handleColorChange = (value: string) => {
    setColor(value)
    const defaults = getDefaultStyles(value)
    setGradient(defaults.gradient)
    setTextColor(defaults.textColor)
  }

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
        setImageUrls((prev) => [...prev, data.publicUrl])
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const addUrl = () => {
    if (urlInput.trim()) {
      setImageUrls((prev) => [...prev, urlInput.trim()])
      setUrlInput('')
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
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

      <h1 className="text-3xl font-bold mb-8">Add Contestant</h1>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="event_id" value={eventId} />
        <input type="hidden" name="gradient" value={gradient} />
        <input type="hidden" name="text_color" value={textColor} />
        {imageUrls.map((url) => (
          <input key={url} type="hidden" name="image_urls" value={url} />
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Name *</label>
            <input
              name="name"
              required
              placeholder="Contestant name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Colour</label>
            <input
              name="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="red, blue, green..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Tagline</label>
          <input
            name="tagline"
            placeholder="Short catchy tagline"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Describe this contestant's entry..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Bio</label>
          <textarea
            name="bio"
            rows={2}
            placeholder="About the contestant..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition resize-none"
          />
        </div>

        {/* Gradient preview */}
        {gradient && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400 block">Card Preview</label>
            <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 ${textColor}`}>
              <p className="font-bold">Preview Card</p>
              <p className="text-sm opacity-80">This is how the gradient will look</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Gradient Classes</label>
            <input
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
              placeholder="from-red-700 to-rose-500"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Text Colour Class</label>
            <select
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition"
            >
              <option value="text-white">White text</option>
              <option value="text-black">Black text</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="text-sm text-gray-400 mb-3 block">Images</label>

          <div className="flex gap-3 mb-3">
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

          <div className="flex gap-2 mb-3">
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

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Image ${i + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={pending || uploading}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
        >
          {pending ? 'Creating...' : 'Add Contestant'}
        </button>
      </form>
    </div>
  )
}
