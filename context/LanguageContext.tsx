'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'tr' | 'en';
type TranslationDictionary = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, TranslationDictionary> = {
  en: {
    'portal.title': 'Solar Engineering Portal',
    'portal.badge.runtime': 'Runtime',
    'portal.badge.engineering': 'Deterministic Model',
    'actions.toggle_language': 'Toggle language',
    'actions.toggle_theme': 'Toggle theme',
    'actions.add_panel': 'Add Panel',
    'actions.rotate': 'Rotate',
    'actions.delete': 'Delete',
    'actions.clear': 'Clear',
    'actions.export': 'Export CSV',
    'panel.mono': 'Monocrystalline',
    'panel.poly': 'Polycrystalline',
    'panel.small': 'Compact 430W',
    'panel.medium': 'Prime 550W',
    'panel.large': 'Utility 610W',
    'inverter.string': 'String Inverter',
    'inverter.micro': 'Micro Inverter',
    'inverter.hybrid': 'Hybrid Inverter',
    'metrics.daily_energy': 'Daily Energy',
    'metrics.daily_hint': 'Based on peak sun hours and deterministic loss stack',
    'metrics.annual_energy': 'Annual Energy',
    'metrics.annual_hint': 'Year-0 projection before degradation',
    'metrics.fill_factor': 'Fill Factor',
    'metrics.electrical_consistency': 'Electrical Consistency',
    'metrics.monthly_savings': 'Monthly Savings',
    'metrics.coverage': 'coverage',
    'chart.label': 'Production Curve',
    'chart.title': 'Daily Power Shape',
    'chart.summary': 'Peak {peak} kWp | weather {weather} | loss factor {loss}',
    'chart.placeholder': 'Preparing live production chart...',
    'sidebar.layout_label': 'Project Envelope',
    'sidebar.layout_title': 'Layout + Resource Inputs',
    'sidebar.engineering_label': 'Electrical Model',
    'sidebar.engineering_title': 'Engineering Constraints',
    'sidebar.financial_label': 'Commercial Layer',
    'sidebar.financial_title': 'Financial Inputs',
    'sidebar.summary_label': 'Decision Snapshot',
    'sidebar.summary_title': 'Quick Summary',
    'fields.layout_width': 'Layout Width',
    'fields.layout_height': 'Layout Height',
    'fields.panel_type': 'Panel Type',
    'fields.inverter_type': 'Inverter',
    'fields.tilt': 'Tilt',
    'fields.azimuth': 'Azimuth',
    'fields.weather_factor': 'Weather Factor',
    'fields.peak_sun_hours': 'Peak Sun Hours',
    'fields.degradation': 'Degradation',
    'fields.system_voltage': 'System Voltage',
    'fields.operating_current': 'Operating Current',
    'fields.cell_temp': 'Cell Temp',
    'fields.temp_coeff': 'Temp Coeff',
    'fields.soiling': 'Soiling',
    'fields.mismatch': 'Mismatch',
    'fields.dc_ohmic': 'DC Ohmic',
    'fields.shading': 'Shading',
    'fields.inverter_efficiency': 'Inverter Eff.',
    'fields.unit_price': 'Unit Price',
    'fields.currency': 'Currency',
    'fields.monthly_consumption': 'Monthly Consumption',
    'summary.year_one_factor': 'Year-1 retained output',
    'summary.coverage': 'Consumption coverage',
    'summary.annual_savings': 'Annual savings',
    'warnings.title': 'Engineering Warnings',
    'warnings.invalid_panels': '{count} panels violate the current placement rules.',
    'warnings.electrical_mismatch': 'Electrical reference differs by {mismatch}% (reference {ref} kW).',
    'workspace.label': 'Placement Workspace',
    'workspace.title': 'Precision Nesting + 3D Review',
    'workspace.precision': 'Top / Precision',
    'workspace.review': '3D / Review',
    'workspace.panel_gap': 'Panel Gap',
    'workspace.edge_gap': 'Edge Gap',
    'workspace.auto_nest': 'Auto Nest',
    'workspace.panels': 'panels',
    'workspace.selected': 'selected',
    'workspace.invalid': 'invalid',
    'camera.fit': 'Fit',
    'camera.iso': 'Iso',
    'camera.top': 'Top',
    'camera.front': 'Front',
    'camera.reset': 'Reset',
    'notices.layout_full': 'No valid placement remains inside the current envelope.',
    'notices.auto_nested': 'Panel inserted at the nearest valid packing position.',
    'notices.panel_added': 'Panel added to the current work envelope.',
    'notices.select_panel': 'Select a panel before using this action.',
    'notices.rotation_blocked': 'Rotation would violate spacing or bounds.',
    'notices.rotation_relocated': 'Panel rotated and moved to the nearest valid position.',
    'notices.rotation_ok': 'Panel rotation updated.',
    'notices.panel_deleted': 'Selected panel removed.',
    'notices.layout_cleared': 'All panels removed from the work envelope.',
    'notices.exported': 'Project data exported as CSV.',
  },
  tr: {
    'portal.title': 'Güneş Mühendisliği Portalı',
    'portal.badge.runtime': 'Çalışma Ortamı',
    'portal.badge.engineering': 'Deterministik Model',
    'actions.toggle_language': 'Dili değiştir',
    'actions.toggle_theme': 'Temayı değiştir',
    'actions.add_panel': 'Panel Ekle',
    'actions.rotate': 'Döndür',
    'actions.delete': 'Sil',
    'actions.clear': 'Temizle',
    'actions.export': 'CSV Aktar',
    'panel.mono': 'Monokristal',
    'panel.poly': 'Polikristal',
    'panel.small': 'Kompakt 430W',
    'panel.medium': 'Prime 550W',
    'panel.large': 'Utility 610W',
    'inverter.string': 'String İnverter',
    'inverter.micro': 'Mikro İnverter',
    'inverter.hybrid': 'Hibrit İnverter',
    'metrics.daily_energy': 'Günlük Enerji',
    'metrics.daily_hint': 'Pik güneş saati ve deterministik kayıp modeli ile',
    'metrics.annual_energy': 'Yıllık Enerji',
    'metrics.annual_hint': 'Bozulma uygulanmadan ilk yıl projeksiyonu',
    'metrics.fill_factor': 'Doluluk Oranı',
    'metrics.electrical_consistency': 'Elektriksel Tutarlılık',
    'metrics.monthly_savings': 'Aylık Tasarruf',
    'metrics.coverage': 'karşılama',
    'chart.label': 'Üretim Eğrisi',
    'chart.title': 'Günlük Güç Profili',
    'chart.summary': 'Tepe {peak} kWp | hava {weather} | kayıp katsayısı {loss}',
    'chart.placeholder': 'Canlı üretim grafiği hazırlanıyor...',
    'sidebar.layout_label': 'Proje Zarfı',
    'sidebar.layout_title': 'Yerleşim + Kaynak Girdileri',
    'sidebar.engineering_label': 'Elektrik Modeli',
    'sidebar.engineering_title': 'Mühendislik Kısıtları',
    'sidebar.financial_label': 'Ticari Katman',
    'sidebar.financial_title': 'Finansal Girdiler',
    'sidebar.summary_label': 'Karar Özeti',
    'sidebar.summary_title': 'Hızlı Durum',
    'fields.layout_width': 'Yerleşim Genişliği',
    'fields.layout_height': 'Yerleşim Yüksekliği',
    'fields.panel_type': 'Panel Tipi',
    'fields.inverter_type': 'İnverter',
    'fields.tilt': 'Eğim',
    'fields.azimuth': 'Azimut',
    'fields.weather_factor': 'Hava Faktörü',
    'fields.peak_sun_hours': 'Pik Güneş Saati',
    'fields.degradation': 'Bozulma',
    'fields.system_voltage': 'Sistem Gerilimi',
    'fields.operating_current': 'Çalışma Akımı',
    'fields.cell_temp': 'Hücre Sıcaklığı',
    'fields.temp_coeff': 'Sıcaklık Katsayısı',
    'fields.soiling': 'Kirlenme',
    'fields.mismatch': 'Uyumsuzluk',
    'fields.dc_ohmic': 'DC Omik',
    'fields.shading': 'Gölgelenme',
    'fields.inverter_efficiency': 'İnverter Verimi',
    'fields.unit_price': 'Birim Fiyat',
    'fields.currency': 'Para Birimi',
    'fields.monthly_consumption': 'Aylık Tüketim',
    'summary.year_one_factor': '1. yıl kalan üretim',
    'summary.coverage': 'Tüketim karşılama',
    'summary.annual_savings': 'Yıllık tasarruf',
    'warnings.title': 'Mühendislik Uyarıları',
    'warnings.invalid_panels': '{count} panel mevcut yerleşim kurallarını ihlal ediyor.',
    'warnings.electrical_mismatch': 'Elektriksel referans {mismatch}% sapıyor (referans {ref} kW).',
    'workspace.label': 'Yerleşim Çalışma Alanı',
    'workspace.title': 'Hassas Nesting + 3D İnceleme',
    'workspace.precision': 'Üst / Hassas',
    'workspace.review': '3D / İnceleme',
    'workspace.panel_gap': 'Panel Aralığı',
    'workspace.edge_gap': 'Kenar Payı',
    'workspace.auto_nest': 'Oto Nest',
    'workspace.panels': 'panel',
    'workspace.selected': 'seçili',
    'workspace.invalid': 'hatalı',
    'camera.fit': 'Kadraj',
    'camera.iso': 'İzo',
    'camera.top': 'Üst',
    'camera.front': 'Ön',
    'camera.reset': 'Sıfırla',
    'notices.layout_full': 'Mevcut zarf içinde geçerli boş yer kalmadı.',
    'notices.auto_nested': 'Panel en yakın geçerli paketleme noktasına yerleştirildi.',
    'notices.panel_added': 'Panel çalışma alanına eklendi.',
    'notices.select_panel': 'Bu işlem için önce bir panel seçin.',
    'notices.rotation_blocked': 'Döndürme boşluk veya sınır kuralını bozuyor.',
    'notices.rotation_relocated': 'Panel döndürüldü ve en yakın geçerli konuma taşındı.',
    'notices.rotation_ok': 'Panel rotasyonu güncellendi.',
    'notices.panel_deleted': 'Seçili panel silindi.',
    'notices.layout_cleared': 'Tüm paneller çalışma alanından kaldırıldı.',
    'notices.exported': 'Proje verileri CSV olarak dışa aktarıldı.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang === 'tr' || savedLang === 'en') {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    const template = translations[language][key] ?? translations.en[key] ?? key;
    return interpolate(template, params);
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
