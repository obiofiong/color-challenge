'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { COLOR_PALETTE, getDefaultStyles } from '@/src/lib/color-utils'
import { capitalize } from '@/src/lib/helper'

export default function ColorSwatchPicker({
  color,
  gradient,
  textColor,
  onChange,
}: {
  color: string
  gradient: string
  textColor: string
  onChange: (next: { color: string; gradient: string; textColor: string }) => void
}) {
  const matchesPalette = COLOR_PALETTE.some((c) => c.name === color.toLowerCase())
  const [customMode, setCustomMode] = useState(color.length > 0 && !matchesPalette)

  const selectSwatch = (name: string) => {
    setCustomMode(false)
    const defaults = getDefaultStyles(name)
    onChange({ color: name, gradient: defaults.gradient, textColor: defaults.textColor })
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {COLOR_PALETTE.map((swatch) => {
          const selected = !customMode && color.toLowerCase() === swatch.name
          return (
            <button
              key={swatch.name}
              type="button"
              onClick={() => selectSwatch(swatch.name)}
              title={capitalize(swatch.name)}
              className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${swatch.gradient} border-2 transition ${
                selected ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              }`}
            >
              {selected && (
                <Check
                  size={16}
                  className={`absolute inset-0 m-auto ${swatch.textColor}`}
                />
              )}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setCustomMode(true)}
          className={`px-3 h-9 rounded-full border text-xs font-medium transition ${
            customMode
              ? 'border-white text-white bg-white/10'
              : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          }`}
        >
          Custom
        </button>
      </div>

      {customMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={color}
            onChange={(e) => onChange({ color: e.target.value, gradient, textColor })}
            placeholder="Colour name (e.g. maroon)"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
          />
          <input
            value={gradient}
            onChange={(e) => onChange({ color, gradient: e.target.value, textColor })}
            placeholder="from-red-700 to-rose-500"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
          />
          <select
            value={textColor}
            onChange={(e) => onChange({ color, gradient, textColor: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition"
          >
            <option value="text-white">White text</option>
            <option value="text-black">Black text</option>
          </select>
        </div>
      )}
    </div>
  )
}
