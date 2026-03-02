'use client';

import { FeasibilityValidationErrors } from '@/lib/solar/feasibility-config';
import { FeasibilityFormState } from '@/lib/solar/types';

interface CustomerFieldsProps {
  form: FeasibilityFormState;
  errors: FeasibilityValidationErrors;
  onChange: (key: 'customerName' | 'phone' | 'addressLine', value: string) => void;
  onRequestLocation: () => void;
}

function ErrorLine({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-red-600">{message}</p>;
}

export function CustomerFields({ form, errors, onChange, onRequestLocation }: CustomerFieldsProps) {
  return (
    <section className="rounded-[24px] border border-border/80 bg-white/70 p-5 dark:bg-slate-950/45">
      <div className="mb-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">Müşteri</p>
        <h3 className="font-display text-2xl font-semibold tracking-tight">Müşteri Bilgileri</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Müşteri adı</span>
          <input
            value={form.customerName}
            onChange={(event) => onChange('customerName', event.target.value)}
            className="field-input"
            placeholder="Ad Soyad"
          />
          <ErrorLine message={errors.customerName} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--muted-text)]">Telefon</span>
          <input
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className="field-input"
            placeholder="+90 5xx xxx xx xx"
          />
          <ErrorLine message={errors.phone} />
        </label>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm text-[color:var(--muted-text)]">Adres</span>
          <button type="button" onClick={onRequestLocation} className="action-button-secondary !px-4 !py-2 !text-sm">
            {form.geoLocation.status === 'fetching' ? 'Konum alınıyor...' : 'Konumdan çek'}
          </button>
        </div>
        <textarea
          value={form.addressLine}
          onChange={(event) => onChange('addressLine', event.target.value)}
          className="field-input min-h-28 resize-y"
          placeholder="Adres bilgisi"
        />
        <ErrorLine message={errors.addressLine} />
        <p className="mt-2 text-xs text-[color:var(--muted-text)]">
          {form.geoLocation.status === 'success' && typeof form.geoLocation.latitude === 'number' && typeof form.geoLocation.longitude === 'number'
            ? `Konum alındı: ${form.geoLocation.latitude.toFixed(5)}, ${form.geoLocation.longitude.toFixed(5)}`
            : form.geoLocation.status === 'error'
              ? form.geoLocation.errorMessage ?? 'Konum bilgisi alınamadı.'
              : 'Adres alanı kullanıcı tarafından düzenlenebilir kalır.'}
        </p>
      </div>
    </section>
  );
}
