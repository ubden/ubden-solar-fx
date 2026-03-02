'use client';

import { BrandOption } from '@/lib/solar/types';

interface BrandSelectionFieldsProps {
  title: string;
  subtitle: string;
  options: BrandOption[];
  selected: string[];
  otherValue: string;
  otherError?: string;
  onToggle: (brandId: string) => void;
  onOtherChange: (value: string) => void;
}

export function BrandSelectionFields({
  title,
  subtitle,
  options,
  selected,
  otherValue,
  otherError,
  onToggle,
  onOtherChange,
}: BrandSelectionFieldsProps) {
  return (
    <section className="rounded-[24px] border border-border/80 bg-white/70 p-5 dark:bg-slate-950/45">
      <div className="mb-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">{subtitle}</p>
        <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const active = selected.includes(option.id);

          return (
            <label
              key={option.id}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition',
                active
                  ? 'border-accent bg-amber-50 text-slate-900 dark:bg-amber-500/10 dark:text-white'
                  : 'border-border/80 bg-white/80 hover:border-accent/70 dark:bg-slate-950/50',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(option.id)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Diğer</span>
          <input
            value={otherValue}
            onChange={(event) => onOtherChange(event.target.value)}
            className="field-input"
            placeholder="Marka belirtin"
          />
        </label>
        {otherError ? <p className="mt-2 text-xs text-amber-600">{otherError}</p> : null}
      </div>
    </section>
  );
}
