import Portfolio from '@/components/Portfolio'
import ConsentBanner from '@/components/ConsentBanner'
import { getSiteData } from '@/lib/content'

// Page publique : régénérée au plus toutes les 60 s après une modification dans /admin.
export const revalidate = 60

export default async function Home() {
  const data = await getSiteData()
  return (
    <div className="site">
      <Portfolio data={data} />
      <ConsentBanner />
    </div>
  )
}
