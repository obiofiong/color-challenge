const COLOR_STYLES: Record<string, { gradient: string; textColor: string }> = {
  black: { gradient: 'from-zinc-900 to-zinc-700', textColor: 'text-white' },
  red: { gradient: 'from-red-700 to-rose-500', textColor: 'text-white' },
  brown: { gradient: 'from-amber-900 to-orange-700', textColor: 'text-white' },
  green: { gradient: 'from-green-700 to-emerald-400', textColor: 'text-white' },
  blue: { gradient: 'from-blue-700 to-cyan-500', textColor: 'text-white' },
  yellow: { gradient: 'from-yellow-400 to-amber-600', textColor: 'text-black' },
  pink: { gradient: 'from-pink-500 to-fuchsia-700', textColor: 'text-white' },
  orange: { gradient: 'from-orange-500 to-red-600', textColor: 'text-white' },
  purple: { gradient: 'from-purple-600 to-violet-500', textColor: 'text-white' },
  white: { gradient: 'from-gray-100 to-gray-300', textColor: 'text-black' },
  teal: { gradient: 'from-teal-600 to-cyan-400', textColor: 'text-white' },
}

const DEFAULT_STYLE = { gradient: 'from-gray-700 to-gray-500', textColor: 'text-white' }

export function getDefaultStyles(colorName: string) {
  return COLOR_STYLES[colorName.toLowerCase()] ?? DEFAULT_STYLE
}

export const COLOR_PALETTE = Object.entries(COLOR_STYLES).map(([name, style]) => ({
  name,
  ...style,
}))

export function getLeaderboardStyle(colorName: string): string {
  const styles: Record<string, string> = {
    black: 'bg-zinc-900 shadow-zinc-700',
    red: 'bg-red-600 shadow-red-400',
    brown: 'bg-amber-800 shadow-amber-500',
    green: 'bg-green-600 shadow-green-400',
    blue: 'bg-blue-600 shadow-blue-400',
    yellow: 'bg-yellow-400 text-black shadow-yellow-300',
    pink: 'bg-pink-500 shadow-pink-300',
    orange: 'bg-orange-500 shadow-orange-300',
    purple: 'bg-purple-600 shadow-purple-400',
    teal: 'bg-teal-600 shadow-teal-400',
  }
  return styles[colorName.toLowerCase()] ?? 'bg-white/10'
}
