'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

import { BrandSelectionFields } from '@/components/solar/feasibility/BrandSelectionFields';
import { CustomerFields } from '@/components/solar/feasibility/CustomerFields';
import { QuoteFields } from '@/components/solar/feasibility/QuoteFields';
import {
  FeasibilityValidationErrors,
  INVERTER_BRAND_OPTIONS,
  PANEL_BRAND_OPTIONS,
} from '@/lib/solar/feasibility-config';
import { CurrencySymbol, FeasibilityFormState, QuoteMode } from '@/lib/solar/types';

interface FeasibilityModalProps {
  open: boolean;
  form: FeasibilityFormState;
  errors: FeasibilityValidationErrors;
  isGenerating: boolean;
  onClose: () => void;
  onTextChange: (
    key: 'customerName' | 'phone' | 'addressLine' | 'notes' | 'inverterBrandOther' | 'panelBrandOther',
    value: string,
  ) => void;
  onQuoteModeChange: (value: QuoteMode) => void;
  onPriceChange: (key: 'turnkeyPriceMin' | 'turnkeyPriceMax', value: number | undefined) => void;
  onCurrencyChange: (value: CurrencySymbol) => void;
  onBrandToggle: (group: 'inverterBrands' | 'panelBrands', brandId: string) => void;
  onRequestLocation: () => void;
  onGeneratePdf: () => void;
}

export function FeasibilityModal({
  open,
  form,
  errors,
  isGenerating,
  onClose,
  onTextChange,
  onQuoteModeChange,
  onPriceChange,
  onCurrencyChange,
  onBrandToggle,
  onRequestLocation,
  onGeneratePdf,
}: FeasibilityModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-950/55 px-3 py-3 backdrop-blur-sm md:px-6 md:py-6">
      <div className="flex h-full w-full max-w-[1260px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[color:var(--bg-secondary)] shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 md:px-7">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[color:var(--muted-text)]">Ubden Solar FX</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Fizibilite Formu</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-border/80 p-3 transition hover:border-accent hover:text-accent">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="space-y-5">
              <CustomerFields
                form={form}
                errors={errors}
                onChange={(key, value) => onTextChange(key, value)}
                onRequestLocation={onRequestLocation}
              />

              <QuoteFields
                form={form}
                errors={errors}
                onQuoteModeChange={onQuoteModeChange}
                onPriceChange={onPriceChange}
                onCurrencyChange={onCurrencyChange}
                onNotesChange={(value) => onTextChange('notes', value)}
              />
            </div>

            <div className="space-y-5">
              <BrandSelectionFields
                title="İnverter Marka Seçenekleri"
                subtitle="Inverter"
                options={INVERTER_BRAND_OPTIONS}
                selected={form.inverterBrands}
                otherValue={form.inverterBrandOther}
                otherError={errors.inverterBrandOther}
                onToggle={(brandId) => onBrandToggle('inverterBrands', brandId)}
                onOtherChange={(value) => onTextChange('inverterBrandOther', value)}
              />

              <BrandSelectionFields
                title="Panel Marka Seçenekleri"
                subtitle="Panel"
                options={PANEL_BRAND_OPTIONS}
                selected={form.panelBrands}
                otherValue={form.panelBrandOther}
                otherError={errors.panelBrandOther}
                onToggle={(brandId) => onBrandToggle('panelBrands', brandId)}
                onOtherChange={(value) => onTextChange('panelBrandOther', value)}
              />

              <section className="rounded-[24px] border border-border/80 bg-white/70 p-5 dark:bg-slate-950/45">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">Rapor</p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">PDF Çıktısı</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted-text)]">
                  PDF; müşteri bilgileri, marka seçimleri, fiyat aralığı, ana performans kartları, grafik, teknik girdi özeti, 2D teknik çizim ve 3D yerleşim görünüşünü aynı rapora toplar.
                </p>
                <p className="mt-3 text-xs leading-5 text-[color:var(--muted-text)]">
                  Marka seçimi yapılmazsa raporda "Belirtilmedi" yazılır. Adres, müşteri adı ve telefon alanları ise zorunludur.
                </p>
              </section>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/80 px-5 py-4 md:px-7">
          <p className="text-sm text-[color:var(--muted-text)]">Fizibilite raporu istemci tarafında oluşturulur ve mevcut proje durumunu kullanır.</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="action-button-secondary">
              Vazgeç
            </button>
            <button type="button" onClick={onGeneratePdf} className="action-button-primary" disabled={isGenerating}>
              {isGenerating ? 'PDF hazırlanıyor...' : 'Fizibilite Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
