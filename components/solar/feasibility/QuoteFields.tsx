'use client';

import { FeasibilityValidationErrors } from '@/lib/solar/feasibility-config';
import { CurrencySymbol, FeasibilityFormState, QuoteMode } from '@/lib/solar/types';

interface QuoteFieldsProps {
  form: FeasibilityFormState;
  errors: FeasibilityValidationErrors;
  onQuoteModeChange: (value: QuoteMode) => void;
  onPriceChange: (key: 'turnkeyPriceMin' | 'turnkeyPriceMax', value: number | undefined) => void;
  onCurrencyChange: (value: CurrencySymbol) => void;
  onNotesChange: (value: string) => void;
}

export function QuoteFields({
  form,
  errors,
  onQuoteModeChange,
  onPriceChange,
  onCurrencyChange,
  onNotesChange,
}: QuoteFieldsProps) {
  const currencies: CurrencySymbol[] = ['₺', '$', '€'];

  return (
    <section className="rounded-[24px] border border-border/80 bg-white/70 p-5 dark:bg-slate-950/45">
      <div className="mb-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">Ticari Katman</p>
        <h3 className="font-display text-2xl font-semibold tracking-tight">Teklif ve Fiyat Bilgisi</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onQuoteModeChange('turnkey_range')}
          className={[
            'rounded-2xl border px-4 py-4 text-left transition',
            form.quoteMode === 'turnkey_range'
              ? 'border-accent bg-amber-50 dark:bg-amber-500/10'
              : 'border-border/80 bg-white/80 dark:bg-slate-950/50',
          ].join(' ')}
        >
          <span className="block text-sm font-medium">Anahtar teslim aralık</span>
          <span className="mt-1 block text-xs text-[color:var(--muted-text)]">Alt ve üst fiyat aralığı PDF içine yazılır.</span>
        </button>
        <button
          type="button"
          onClick={() => onQuoteModeChange('separate_quote')}
          className={[
            'rounded-2xl border px-4 py-4 text-left transition',
            form.quoteMode === 'separate_quote'
              ? 'border-accent bg-amber-50 dark:bg-amber-500/10'
              : 'border-border/80 bg-white/80 dark:bg-slate-950/50',
          ].join(' ')}
        >
          <span className="block text-sm font-medium">Fiyat teklifi ayrıca verilecek</span>
          <span className="mt-1 block text-xs text-[color:var(--muted-text)]">Fiyat alanları gizlenir, rapora not düşülür.</span>
        </button>
      </div>

      {form.quoteMode === 'turnkey_range' ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_120px]">
          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Alt fiyat</span>
            <input
              type="number"
              value={form.turnkeyPriceMin ?? ''}
              onChange={(event) => onPriceChange('turnkeyPriceMin', event.target.value ? Number(event.target.value) : undefined)}
              className="field-input"
              placeholder="0"
            />
            {errors.turnkeyPriceMin ? <p className="mt-2 text-xs text-red-600">{errors.turnkeyPriceMin}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Üst fiyat</span>
            <input
              type="number"
              value={form.turnkeyPriceMax ?? ''}
              onChange={(event) => onPriceChange('turnkeyPriceMax', event.target.value ? Number(event.target.value) : undefined)}
              className="field-input"
              placeholder="0"
            />
            {errors.turnkeyPriceMax ? <p className="mt-2 text-xs text-red-600">{errors.turnkeyPriceMax}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Para birimi</span>
            <select value={form.priceCurrency} onChange={(event) => onCurrencyChange(event.target.value as CurrencySymbol)} className="field-input">
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="mt-4">
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Notlar</span>
          <textarea
            value={form.notes}
            onChange={(event) => onNotesChange(event.target.value)}
            className="field-input min-h-24 resize-y"
            placeholder="Opsiyonel teklif notları, montaj kapsamı veya teslim varsayımları"
          />
        </label>
      </div>
    </section>
  );
}
