import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Tool',
  description: 'Resume and Cover Letter Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}