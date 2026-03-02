import { BrandOption, FeasibilityFormState } from '@/lib/solar/types';

export const OTHER_BRAND_ID = '__other__';

export const INVERTER_BRAND_OPTIONS: BrandOption[] = [
  { id: 'Huawei', label: 'Huawei' },
  { id: 'Fronius', label: 'Fronius' },
  { id: 'Growatt', label: 'Growatt' },
  { id: 'GoodWe', label: 'GoodWe' },
  { id: 'SMA', label: 'SMA' },
  { id: 'Solis', label: 'Solis' },
  { id: OTHER_BRAND_ID, label: 'Diğer' },
];

export const PANEL_BRAND_OPTIONS: BrandOption[] = [
  { id: 'Jinko', label: 'Jinko' },
  { id: 'Longi', label: 'Longi' },
  { id: 'Trina', label: 'Trina' },
  { id: 'Canadian Solar', label: 'Canadian Solar' },
  { id: 'JA Solar', label: 'JA Solar' },
  { id: 'Risen', label: 'Risen' },
  { id: OTHER_BRAND_ID, label: 'Diğer' },
];

export interface FeasibilityValidationErrors {
  customerName?: string;
  phone?: string;
  addressLine?: string;
  turnkeyPriceMin?: string;
  turnkeyPriceMax?: string;
  inverterBrandOther?: string;
  panelBrandOther?: string;
}

export function getSelectedBrandLabels(selected: string[], other: string) {
  const labels = selected.filter((entry) => entry !== OTHER_BRAND_ID);

  if (other.trim()) {
    labels.push(other.trim());
  }

  return labels;
}

export function validateFeasibilityForm(form: FeasibilityFormState): FeasibilityValidationErrors {
  const errors: FeasibilityValidationErrors = {};

  if (!form.customerName.trim()) {
    errors.customerName = 'Müşteri adı zorunludur.';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Telefon zorunludur.';
  }

  if (!form.addressLine.trim()) {
    errors.addressLine = 'Adres zorunludur.';
  }

  if (form.quoteMode === 'turnkey_range') {
    if (typeof form.turnkeyPriceMin !== 'number' || !Number.isFinite(form.turnkeyPriceMin)) {
      errors.turnkeyPriceMin = 'Alt fiyat girin.';
    }

    if (typeof form.turnkeyPriceMax !== 'number' || !Number.isFinite(form.turnkeyPriceMax)) {
      errors.turnkeyPriceMax = 'Üst fiyat girin.';
    }

    if (
      typeof form.turnkeyPriceMin === 'number' &&
      typeof form.turnkeyPriceMax === 'number' &&
      form.turnkeyPriceMin > form.turnkeyPriceMax
    ) {
      errors.turnkeyPriceMax = 'Üst fiyat alt fiyattan küçük olamaz.';
    }
  }

  if (form.inverterBrands.includes(OTHER_BRAND_ID) && !form.inverterBrandOther.trim()) {
    errors.inverterBrandOther = 'Diğer inverter markasını yazın veya Diğer seçimini kaldırın.';
  }

  if (form.panelBrands.includes(OTHER_BRAND_ID) && !form.panelBrandOther.trim()) {
    errors.panelBrandOther = 'Diğer panel markasını yazın veya Diğer seçimini kaldırın.';
  }

  return errors;
}

export function hasFeasibilityErrors(errors: FeasibilityValidationErrors) {
  return Object.values(errors).some(Boolean);
}
