import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-serif mb-6">
        Your story is flowing.
      </h1>
      <p className="text-xl text-muted max-w-lg mb-8 leading-relaxed">
        Thank you for your order. We've received your story and will transform
        it into a scroll-driven experience within 24 hours.
      </p>
      <p className="text-muted mb-12">
        Check your email for confirmation and updates.
      </p>
      <Link
        href="/"
        className="text-ink underline hover:no-underline"
      >
        Return home
      </Link>
    </main>
  )
}
