import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'InterviewSaarthi — AI Mock Interview Coach',
  description: 'Ace your next interview with AI-powered mock sessions, real-time feedback, and personalized improvement roadmaps.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#181c27',
              color: '#e2e8f0',
              border: '1px solid #252a38',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#38a3f8', secondary: '#0f1117' } },
            error:   { iconTheme: { primary: '#f97316', secondary: '#0f1117' } },
          }}
        />
      </body>
    </html>
  )
}
