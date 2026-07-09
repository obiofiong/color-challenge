'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { LayoutDashboard, Calendar, Users, ClipboardList, LogOut, Menu, X } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1 flex-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
              active
                ? 'bg-white/10 text-white font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 p-6 flex-col shrink-0 hidden md:flex">
        <div className="mb-10">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
        </div>

        <NavLinks pathname={pathname} />

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Admin Panel</h2>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-gray-300 hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-72 bg-zinc-950 border-r border-white/10 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-lg font-bold">Admin Panel</h2>
                <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <NavLinks pathname={pathname} onNavigate={() => setDrawerOpen(false)} />

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition w-full"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </form>
          </aside>
        </div>
      )}
    </>
  )
}
