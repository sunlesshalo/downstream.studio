import './globals.css'

export const metadata = {
  title: 'DownStream Intake',
  description: 'Submit your content for a DownStream visual story',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
