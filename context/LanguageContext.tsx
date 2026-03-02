'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'tr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.engineering': 'Engineering',
    'hero.title': 'Ubden® Solar FX',
    'hero.subtitle': 'Precision Solar Engineering & Simulation Portal',
    'config.panel_type': 'Panel Type',
    'config.inverter_type': 'Inverter Type',
    'config.angle': 'Tilt Angle',
    'config.azimuth': 'Azimuth',
    'stats.capacity': 'Estimated Capacity',
    'stats.efficiency': 'System Efficiency',
    'stats.output': 'Daily Output',
    'stats.degradation': 'Annual Degradation',
    'stats.weather': 'Weather Condition',
    'panel.mono': 'Monocrystalline',
    'panel.poly': 'Polycrystalline',
    'inverter.string': 'String Inverter',
    'inverter.micro': 'Micro Inverter',
    'inverter.hybrid': 'Hybrid Inverter',
    'layout.title': 'Panel Layout Placement',
    'layout.add': 'Add Panel',
    'layout.clear': 'Clear All',
    'layout.confirm_clear': 'Are you sure you want to clear all panels?',
    'layout.export': 'Export Project',
    'layout.rotate': 'Rotate Panel',
    'layout.width': 'Layout Width (m)',
    'layout.height': 'Layout Height (m)',
    'layout.dimensions': 'Layout Dimensions',
    'layout.panel_size': 'Panel Size',
    'panel.small': 'Small (300W)',
    'panel.medium': 'Medium (450W)',
    'panel.large': 'Large (600W)',
    'engineering.details': 'Technical Specifications',
    'engineering.voltage': 'System Voltage',
    'engineering.current': 'Operating Current',
    'engineering.temp': 'Cell Temperature',
    'config.degradation': 'Degradation Rate',
    'config.weather': 'Weather Factor',
    'tooltip.add_panel': 'Add a new solar panel to the layout',
    'tooltip.clear_all': 'Remove all panels from the current layout',
    'tooltip.export': 'Download project data as CSV',
    'tooltip.panel_type': 'Select the semiconductor technology for the panels',
    'tooltip.inverter': 'Select the power conversion technology',
    'tooltip.angle': 'Adjust the vertical tilt of the panels relative to the ground',
    'tooltip.azimuth': 'Adjust the horizontal orientation (North=0, East=90, South=180, West=270)',
    'tooltip.degradation': 'Simulate annual performance loss over time',
    'tooltip.weather': 'Adjust for local cloud cover and atmospheric conditions',
    'financial.title': 'Financial Analysis',
    'financial.unit_price': 'Electricity Unit Price',
    'financial.currency': 'Currency',
    'financial.consumption': 'Avg. Monthly Consumption',
    'financial.savings_daily': 'Daily Savings',
    'financial.savings_yearly': 'Yearly Savings',
    'financial.coverage': 'Consumption Coverage',
    'engineering.advanced': 'Advanced Engineering Parameters',
    'engineering.presets': 'Brand Presets',
    'engineering.temp_coeff': 'Temp. Coefficient (Pmax)',
    'engineering.soiling': 'Soiling Loss',
    'engineering.mismatch': 'Mismatch Loss',
    'engineering.dc_ohmic': 'DC Ohmic Loss',
    'engineering.shading': 'Shading Loss',
    'engineering.inverter_eff': 'Inverter Efficiency',
    'disclaimer.text': 'Note: These values are calculated based on optimum conditions and theoretical models.',
  },
  tr: {
    'nav.dashboard': 'Panel',
    'nav.projects': 'Projeler',
    'nav.engineering': 'Mühendislik',
    'hero.title': 'Ubden® Solar FX',
    'hero.subtitle': 'Hassas Güneş Enerjisi Mühendisliği ve Simülasyon Portalı',
    'config.panel_type': 'Panel Tipi',
    'config.inverter_type': 'İnverter Tipi',
    'config.angle': 'Eğim Açısı',
    'config.azimuth': 'Azimut',
    'stats.capacity': 'Tahmini Kapasite',
    'stats.efficiency': 'Sistem Verimliliği',
    'stats.output': 'Günlük Çıktı',
    'stats.degradation': 'Yıllık Kayıp',
    'stats.weather': 'Hava Durumu',
    'panel.mono': 'Monokristal',
    'panel.poly': 'Polikristal',
    'inverter.string': 'Dizi İnverter',
    'inverter.micro': 'Mikro İnverter',
    'inverter.hybrid': 'Hibrit İnverter',
    'layout.title': 'Panel Yerleşim Planı',
    'layout.add': 'Panel Ekle',
    'layout.clear': 'Hepsini Temizle',
    'layout.confirm_clear': 'Tüm panelleri temizlemek istediğinize emin misiniz?',
    'layout.export': 'Projeyi Dışa Aktar',
    'layout.rotate': 'Paneli Döndür',
    'layout.width': 'Yerleşim Genişliği (m)',
    'layout.height': 'Yerleşim Yüksekliği (m)',
    'layout.dimensions': 'Yerleşim Boyutları',
    'layout.panel_size': 'Panel Boyutu',
    'panel.small': 'Küçük (300W)',
    'panel.medium': 'Orta (450W)',
    'panel.large': 'Büyük (600W)',
    'engineering.details': 'Teknik Detaylar',
    'engineering.voltage': 'Sistem Voltajı',
    'engineering.current': 'Çalışma Akımı',
    'engineering.temp': 'Hücre Sıcaklığı',
    'config.degradation': 'Verim Kaybı Oranı',
    'config.weather': 'Hava Durumu Faktörü',
    'tooltip.add_panel': 'Yerleşime yeni bir güneş paneli ekle',
    'tooltip.clear_all': 'Mevcut yerleşimdeki tüm panelleri kaldır',
    'tooltip.export': 'Proje verilerini CSV olarak indir',
    'tooltip.panel_type': 'Paneller için yarı iletken teknolojisini seçin',
    'tooltip.inverter': 'Güç dönüştürme teknolojisini seçin',
    'tooltip.angle': 'Panellerin zemine göre dikey eğimini ayarlayın',
    'tooltip.azimuth': 'Yatay yönelimi ayarlayın (Kuzey=0, Doğu=90, Güney=180, Batı=270)',
    'tooltip.degradation': 'Zamanla oluşan yıllık performans kaybını simüle edin',
    'tooltip.weather': 'Yerel bulutluluk ve atmosferik koşullar için ayarlama yapın',
    'financial.title': 'Finansal Analiz',
    'financial.unit_price': 'Elektrik Birim Fiyatı',
    'financial.currency': 'Para Birimi',
    'financial.consumption': 'Ort. Aylık Tüketim',
    'financial.savings_daily': 'Günlük Tasarruf',
    'financial.savings_yearly': 'Yıllık Tasarruf',
    'financial.coverage': 'Tüketim Karşılama',
    'engineering.advanced': 'Gelişmiş Mühendislik Parametreleri',
    'engineering.presets': 'Marka Şablonları',
    'engineering.temp_coeff': 'Sıcaklık Katsayısı (Pmax)',
    'engineering.soiling': 'Kirlenme Kaybı',
    'engineering.mismatch': 'Uyumsuzluk Kaybı',
    'engineering.dc_ohmic': 'DC Omik Kayıp',
    'engineering.shading': 'Gölgelenme Kaybı',
    'engineering.inverter_eff': 'İnverter Verimliliği',
    'disclaimer.text': 'Not: Bu değerler optimum imkanlar ve teorik modellere göre hesaplanmıştır.',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang) {
      setTimeout(() => setLanguageState(savedLang), 0)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string) => {
    return (translations[language] as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
