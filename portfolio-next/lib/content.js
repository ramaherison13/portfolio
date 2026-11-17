import { createPublicClient } from '@/lib/supabase/public'
import { DEFAULT_CONTENT, DEFAULT_PROJECTS, DEFAULT_SKILLS } from '@/lib/defaults'

// Lit le contenu éditable depuis Supabase ; retombe sur les valeurs par défaut en cas d'échec.
export async function getSiteData() {
  const fallback = { content: DEFAULT_CONTENT, projects: DEFAULT_PROJECTS, skills: DEFAULT_SKILLS }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return fallback
  try {
    const sb = createPublicClient()
    const [c, p, s] = await Promise.all([
      sb.from('site_content').select('key,value'),
      sb.from('projects').select('*').eq('published', true).order('sort').order('created_at'),
      sb.from('skills').select('*').order('sort'),
    ])
    const content = { ...DEFAULT_CONTENT }
    ;(c.data || []).forEach((r) => { if (r.value !== '') content[r.key] = r.value })
    return {
      content,
      projects: p.data?.length ? p.data : DEFAULT_PROJECTS,
      skills: s.data?.length ? s.data : DEFAULT_SKILLS,
    }
  } catch {
    return fallback
  }
}
