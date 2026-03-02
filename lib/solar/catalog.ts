import { PanelCatalogItem, PanelSizeId } from '@/lib/solar/types';

export const PANEL_CATALOG: Record<PanelSizeId, PanelCatalogItem> = {
  small: {
    id: 'small',
    label: 'Compact 430W',
    labelKey: 'panel.small',
    widthM: 1.72,
    heightM: 1.13,
    wattsStc: 430,
    cellColumns: 6,
    cellRows: 12,
  },
  medium: {
    id: 'medium',
    label: 'Prime 550W',
    labelKey: 'panel.medium',
    widthM: 2.09,
    heightM: 1.13,
    wattsStc: 550,
    cellColumns: 6,
    cellRows: 12,
  },
  large: {
    id: 'large',
    label: 'Utility 610W',
    labelKey: 'panel.large',
    widthM: 2.38,
    heightM: 1.13,
    wattsStc: 610,
    cellColumns: 6,
    cellRows: 14,
  },
};

export const PANEL_SPECS = Object.values(PANEL_CATALOG);

export function getPanelSpec(panelSpecId: PanelSizeId): PanelCatalogItem {
  return PANEL_CATALOG[panelSpecId];
}
