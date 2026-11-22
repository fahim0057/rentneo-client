export function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-16 ${className}`}>
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}