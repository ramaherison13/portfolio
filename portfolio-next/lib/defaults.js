// Contenu de secours : le site s'affiche même si Supabase n'est pas encore configuré.
export const DEFAULT_CONTENT = {
  hero_name: 'Lucien',
  roles: 'Développeur Web,Développeur Mobile,Designer UI,Freelance',
  about_1: "Étudiant en Master Informatique à l'ENI de Fianarantsoa, je conçois des applications mobiles fluides et des architectures web robustes.",
  about_2: "Mon travail porte sur des outils numériques à fort impact, comme Itantsoroka, une plateforme dédiée à la monographie communale et à l'information citoyenne.",
  email: 'lucienrandrianirina0@gmail.com',
  phone: '+261 34 01 805 49',
  location: 'Toliara II & Fianarantsoa, Madagascar',
  github: 'https://github.com/ramaherison13',
  linkedin: 'https://www.linkedin.com/in/ramaherison-lucien-randrianirina-8461a3288/',
  photo_url: '',
  cv_url: '/cv.pdf',
}

export const DEFAULT_PROJECTS = [
  { id: 'd1', title: 'Itantsoroka', category: 'mobile', description: 'Plateforme de monographie communale (Flutter + Node.js).', tech: 'Flutter · Dart · Node.js · PostgreSQL', link: 'https://github.com/ramaherison13', icon: 'fa-mobile-screen' },
  { id: 'd2', title: 'Portail de suivi citoyen', category: 'web', description: 'Suivi des démarches administratives pour citoyens et agents.', tech: 'React · Express · PostgreSQL', link: 'https://github.com/ramaherison13', icon: 'fa-globe' },
  { id: 'd3', title: 'Supervision réseau locale', category: 'web', description: 'Scripts et tableaux de bord de monitoring et de sauvegarde.', tech: 'Linux · Bash · Docker', link: '', icon: 'fa-server' },
  { id: 'd4', title: 'Interface Itantsoroka', category: 'design', description: "Conception de l'interface et du système visuel de l'application.", tech: 'UI / UX · Figma', link: '', icon: 'fa-pen-nib' },
]

export const DEFAULT_SKILLS = [
  { id: 's1', name: 'Flutter / Dart', level: 92 },
  { id: 's2', name: 'React / JavaScript', level: 82 },
  { id: 's3', name: 'Node.js / Express', level: 84 },
  { id: 's4', name: 'PostgreSQL / MySQL', level: 82 },
]
