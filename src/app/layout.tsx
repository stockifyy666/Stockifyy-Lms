import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stockifyy — Learning Management System',
  description: 'Secure video learning platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                fontFamily: 'inherit',
                fontSize: '14px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
