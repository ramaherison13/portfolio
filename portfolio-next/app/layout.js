import './site.css'
import './admin.css'

export const metadata = {
  title: 'Ramaherison Lucien — Développeur Web & Mobile',
  description: 'Portfolio de Randrianirina Ramaherison Lucien — Développeur Multiplateforme (Flutter) et Full-Stack (React, Node.js, PostgreSQL).',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
