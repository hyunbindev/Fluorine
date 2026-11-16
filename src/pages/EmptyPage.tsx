// Keep the design preview empty until each feature page is implemented.
export default function EmptyPage({ title }: { title: string }) {
  return (
    <section className="min-h-full" aria-label={title}>
      <h1 className="sr-only">{title}</h1>
    </section>
  )
}
