import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <AdminNav email={user.email ?? ''} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
