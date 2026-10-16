import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-4 sm:px-8 lg:px-16", className)} {...props} />;
}

export function SectionHead({
  overline,
  title,
  lead,
  action,
  spark,
}: {
  overline: string;
  title: string;
  lead?: React.ReactNode;
  action?: React.ReactNode;
  spark?: boolean;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
      <div>
        <span className="eyebrow mb-4 block">{overline}</span>
        <h2 className="max-w-[640px] text-[clamp(28px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
          {title}
          {spark && <span aria-hidden className="spark" />}
        </h2>
        {lead && <p className="mt-4 max-w-[560px] text-lg leading-7 text-muted-foreground">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
