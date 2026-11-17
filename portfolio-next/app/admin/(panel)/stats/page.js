import { createClient } from '@/lib/supabase/server'
import { getStats } from '@/lib/stats'
import StatsView from '@/components/admin/StatsView'

export default async function StatsPage() {
  const stats = await getStats(createClient())
  return <StatsView stats={stats} extended />
}
