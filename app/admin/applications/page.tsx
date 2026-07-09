import { createSupabaseServerClient } from '@/src/lib/supabase-server'
import ApplicationActions from './ApplicationActions'

export default async function AdminApplicationsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: applications } = await supabase
    .from('event_applications')
    .select('*, events(title)')
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Applications</h1>

      {!applications?.length ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{app.full_name}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {app.email}
                    {app.phone && ` · ${app.phone}`}
                    {app.instagram && ` · @${app.instagram}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Event: {app.events?.title ?? 'Unknown'}
                  </p>
                  {app.bio && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{app.bio}</p>
                  )}
                  {app.portfolio_url && (
                    <a
                      href={app.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline mt-1 inline-block"
                    >
                      View Portfolio
                    </a>
                  )}
                </div>

                {app.status === 'pending' && (
                  <ApplicationActions
                    applicationId={app.id}
                    eventId={app.event_id}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
