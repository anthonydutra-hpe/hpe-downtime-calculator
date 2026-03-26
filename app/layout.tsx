import './globals.css'
import Image from 'next/image'

export const metadata = {
  title: 'HPE Downtime Calculator'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="bg-white border-b">
          <div className="max-w-5xl mx-auto py-4 px-6 flex items-center gap-4">
            <Image src="/hpe-logo.svg" alt="HPE" width={140} height={36} />
            <h1 className="text-xl font-semibold">HPE Downtime Calculator</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
        <footer className="max-w-5xl mx-auto p-6 text-sm text-gray-500">© HPE Downtime Calculator MVP</footer>
      </body>
    </html>
  )
}
