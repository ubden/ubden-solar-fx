'use client';

import { Globe, Moon, Sun } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[color:var(--bg)]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-linear-to-br from-accent to-amber-300 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/20">
            U
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-[color:var(--muted-text)]">
              Ubden Solar FX
            </p>
            <h1 className="font-display text-xl font-semibold tracking-tight">{t('portal.title')}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 rounded-full border border-border/80 bg-white/60 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[color:var(--muted-text)] shadow-sm dark:bg-slate-900/50 lg:flex">
          <span>{t('portal.badge.runtime')}</span>
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          <span>Node 22</span>
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          <span>{t('portal.badge.engineering')}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-[color:var(--text)] transition hover:border-accent hover:text-accent dark:bg-slate-900/60"
            aria-label={t('actions.toggle_language')}
          >
            <Globe size={18} />
          </button>
          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-[color:var(--text)] transition hover:border-accent hover:text-accent dark:bg-slate-900/60"
            aria-label={t('actions.toggle_theme')}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
