export function PageHead({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl leading-8 font-bold">{title}</h1>
        {description && <p className="mt-1 max-w-[600px] text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border bg-background p-4 sm:p-6 ${className}`}>{children}</section>;
}
