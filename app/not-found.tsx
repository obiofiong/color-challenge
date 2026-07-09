import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <Compass className="text-gray-400" size={32} />
        </div>

        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-xl font-semibold text-white mb-3">Page not found</p>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
