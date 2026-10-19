import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const inputClass = "h-10 rounded-md bg-background text-[15px]";

export function FieldShell({ label, hint, htmlFor, children, className }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={htmlFor} className="font-semibold">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs leading-4 text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  hint,
  defaultValue,
  multiline,
  required,
  type = "text",
  className,
  placeholder,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | number | null;
  multiline?: boolean;
  required?: boolean;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  const id = `f-${name}`;
  return (
    <FieldShell label={label} hint={hint} htmlFor={id} className={className}>
      {multiline ? (
        <Textarea id={id} name={name} defaultValue={defaultValue ?? ""} required={required} rows={3} placeholder={placeholder} className="rounded-md bg-background text-[15px]" />
      ) : (
        <Input id={id} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className={inputClass} />
      )}
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
}) {
  const id = `f-${name}`;
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} className={cn(inputClass, "border border-input px-2.5")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-ink" />
      <span>
        <b className="font-semibold">{label}</b>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}
