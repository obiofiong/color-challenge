'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { LayoutDashboard, Calendar, Users, ClipboardList, LogOut } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
]

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-black border-r border-white/10 p-6 flex flex-col shrink-0 hidden md:flex">
      <div className="mb-10">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
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
  )
}
