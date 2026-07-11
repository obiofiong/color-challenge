import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import AdminApplicationsList from './AdminApplicationsList'

export default async function AdminApplicationsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: applications } = await supabase
    .from('event_applications')
    .select('*, events(title)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Applications</h1>

      {!applications?.length ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No applications yet</p>
        </div>
      ) : (
        <AdminApplicationsList applications={applications} />
      )}
    </div>
  )
}
