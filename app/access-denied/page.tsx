export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md space-y-4 text-center">
        <p className="font-mono text-sm text-muted-foreground">403</p>
        <h1 className="text-2xl font-semibold">Website access unavailable</h1>
        <p className="leading-6 text-muted-foreground">
          This account is intended to use the mobile application. Please contact an administrator if you need website access.
        </p>
      </section>
    </main>
  )
}
