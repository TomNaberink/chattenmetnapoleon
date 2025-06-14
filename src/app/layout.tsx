import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chat met Napoleon Bonaparte - Havo 5 Geschiedenis',
  description: 'Interactieve geschiedenisles: Chat met Napoleon Bonaparte en leer over zijn leven, veldslagen en invloed op Europa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-100 min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}