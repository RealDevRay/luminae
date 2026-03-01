import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata: Metadata = {
  metadataBase: new URL('https://luminae.qzz.io'),
  title: 'Luminae - Autonomous Research Illumination',
  description: 'Transform academic papers into actionable intelligence with AI-powered analysis',
  openGraph: {
    title: 'Luminae - Autonomous Research Illumination',
    description: 'Transform academic papers into actionable intelligence with AI-powered analysis',
    url: 'https://luminae.qzz.io',
    siteName: 'Luminae',
    images: [
      {
        url: '/icon.png',
        width: 1024,
        height: 1024,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luminae - Autonomous Research Illumination',
    description: 'Transform academic papers into actionable intelligence with AI-powered analysis',
    images: ['/icon.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
