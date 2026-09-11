'use client';

import React, { memo, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/i18n';
import {
  X, Sun, Moon, Languages, Landmark, Scale, Rss, Clock, Star,
  Activity, Settings, ExternalLink, Users, Building2, ShieldCheck,
  AlertTriangle, MapPin,
} from 'lucide-react';

// ==================== TYPES ====================

interface KenyaRightSidebarProps {
  open: boolean;
  onClose: () => void;
  pinnedRepIds: string[];
  onSelectPinned?: (repId: string) => void;
  onAllSections?: () => void;
}

// ==================== THEME EXTERNAL STORE ====================
// Hoisted for stable function identity → avoids resubscribing on every render.
// Tracks the `dark` class on <html> via MutationObserver and surfaces the
// current value through useSyncExternalStore so the Switch stays in sync with
// any other theme toggles mounted in the app (e.g. the header ThemeToggle).

function subscribeTheme(callback: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  );
}

function getThemeServerSnapshot(): boolean {
  return false;
}

// ==================== MOUNTED EXTERNAL STORE ====================
// SSR-safe "is this mounted on the client" check via useSyncExternalStore.
// getServerSnapshot returns false during SSR + initial hydration render so
// the server output matches the first client render (no hydration mismatch);
// once hydrated, getSnapshot returns true and triggers a re-render.
// Hoisted for stable function identity (avoids resubscribing on every render).

function subscribeNoop(): () => void {
  return () => {};
}
function getMountedSnapshot(): boolean {
  return true;
}
function getMountedServerSnapshot(): boolean {
  return false;
}

// ==================== PARLIAMENT LAST-REFRESH STORE ====================
// Subscribes to localStorage 'kenya-parliament-last-refresh' via useSyncExternalStore
// so the sidebar re-renders immediately when the value changes (cross-tab via
// the 'storage' event). Avoids setState-in-effect lint rule.

const LAST_REFRESH_KEY = 'kenya-parliament-last-refresh';

function subscribeRefresh(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === LAST_REFRESH_KEY || e.key === null) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

function getRefreshSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_REFRESH_KEY);
  } catch {
    return null;
  }
}

function getRefreshServerSnapshot(): null {
  return null;
}

// ==================== 1. LANGUAGE TOGGLE ====================

function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <span className="text-xs text-muted-foreground flex-1">{t('rightSidebar.language')}</span>
      <div
        className="inline-flex rounded-md border overflow-hidden"
        role="group"
        aria-label={t('rightSidebar.language')}
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-medium transition-colors ${
            language === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
          aria-pressed={language === 'en'}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('sw')}
          className={`px-2.5 py-1 text-xs font-medium transition-colors border-l ${
            language === 'sw'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
          aria-pressed={language === 'sw'}
        >
          SW
        </button>
      </div>
    </div>
  );
}

// ==================== 2. MINI THEME TOGGLE ====================

function MiniThemeToggle() {
  const { t } = useLanguage();
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const isMounted = useSyncExternalStore(subscribeNoop, getMountedSnapshot, getMountedServerSnapshot);

  const toggleTheme = () => {
    const cls = document.documentElement.classList;
    if (cls.contains('dark')) cls.remove('dark');
    else cls.add('dark');
  };

  return (
    <div className="flex items-center gap-2">
      {isMounted && isDark ? (
        <Moon className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-500 shrink-0" aria-hidden="true" />
      )}
      <span className="text-xs text-muted-foreground flex-1">{t('rightSidebar.theme')}</span>
      <Switch
        checked={isMounted && isDark}
        onCheckedChange={toggleTheme}
        aria-label={isDark ? t('rightSidebar.darkMode') : t('rightSidebar.lightMode')}
        disabled={!isMounted}
      />
    </div>
  );
}

// ==================== 3. NATIONAL STATS MINI ====================

function NationalStatsMini() {
  const { t } = useLanguage();
  const stats = [
    { label: t('nav.counties'), value: 47, Icon: MapPin, color: 'text-emerald-600' },
    { label: t('tab.constitution'), value: 2010, Icon: Scale, color: 'text-primary' },
    { label: t('tab.feeds'), value: 4, Icon: Rss, color: 'text-orange-600' },
    { label: t('sidebar.section.dishonesty'), value: 14, Icon: AlertTriangle, color: 'text-red-600' },
  ];
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Landmark className="h-3.5 w-3.5 text-primary" />
          {t('rightSidebar.nationalStats')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(({ label, value, Icon, color }) => (
            <div key={label} className="rounded-md border bg-muted/30 p-2">
              <Icon className={`h-3.5 w-3.5 mb-1 ${color}`} aria-hidden="true" />
              <p className="text-base font-bold leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 4. LAST UPDATED MINI ====================

function LastUpdatedMini() {
  const { t } = useLanguage();
  const lastRefresh = useSyncExternalStore(subscribeRefresh, getRefreshSnapshot, getRefreshServerSnapshot);
  const isMounted = useSyncExternalStore(subscribeNoop, getMountedSnapshot, getMountedServerSnapshot);

  const formatted = useMemo(() => {
    if (!isMounted) return '\u00A0';
    if (!lastRefresh) return t('rightSidebar.never');
    try {
      const d = new Date(lastRefresh);
      if (Number.isNaN(d.getTime())) return t('rightSidebar.never');
      return d.toLocaleString();
    } catch {
      return t('rightSidebar.never');
    }
  }, [lastRefresh, isMounted, t]);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
              {t('rightSidebar.lastRefresh')}
            </p>
            <p className="text-xs font-medium mt-0.5 break-words">{formatted}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 5. LIVE FEED STATUS MINI ====================

function LiveFeedStatusMini() {
  const { t } = useLanguage();
  const feeds = [
    { id: 'oag', label: 'OAG', color: 'bg-blue-500' },
    { id: 'cob', label: 'CoB', color: 'bg-emerald-500' },
    { id: 'cog', label: 'CoG', color: 'bg-indigo-500' },
    { id: 'ti-kenya', label: 'TI-Kenya', color: 'bg-orange-500' },
    { id: 'eacc', label: 'EACC', color: 'bg-purple-500' },
  ];
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-primary" />
          {t('rightSidebar.liveStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        {feeds.map(({ id, label, color }) => (
          <div key={id} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
            <span className="text-xs flex-1">{label}</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">cached</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ==================== 6. PINNED REPS MINI ====================

function PinnedRepsMini({
  pinnedRepIds,
  onSelectPinned,
}: {
  pinnedRepIds: string[];
  onSelectPinned?: (repId: string) => void;
}) {
  const { t } = useLanguage();
  const displayed = pinnedRepIds.slice(0, 5);
  const overflow = pinnedRepIds.length - displayed.length;

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-primary" />
          {t('rightSidebar.pinned')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {displayed.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-1 py-2">
            {t('rightSidebar.noPinned')}
          </p>
        ) : (
          <ul className="space-y-1">
            {displayed.map((repId) => {
              const interactive = Boolean(onSelectPinned);
              return (
                <li key={repId}>
                  <button
                    type="button"
                    onClick={() => onSelectPinned?.(repId)}
                    disabled={!interactive}
                    className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md transition-colors ${
                      interactive ? 'hover:bg-accent/60 cursor-pointer' : 'cursor-default'
                    }`}
                    aria-label={repId}
                  >
                    <Star className="h-3 w-3 text-primary fill-primary shrink-0" aria-hidden="true" />
                    <span className="text-xs truncate flex-1">{repId}</span>
                  </button>
                </li>
              );
            })}
            {overflow > 0 && (
              <li className="text-[10px] text-muted-foreground pt-1 px-2">+{overflow} more</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== 7. QUICK ACTIONS MINI ====================

function QuickActionsMini({ onAllSections }: { onAllSections?: () => void }) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Settings className="h-3.5 w-3.5 text-primary" />
          {t('rightSidebar.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        <Button
          type="button"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => onAllSections?.()}
          disabled={!onAllSections}
        >
          <Scale className="h-3.5 w-3.5" />
          {t('action.allSections')}
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
          <a href="/admin" aria-label={t('action.admin')}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('action.admin')}
            <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
          <a
            href="https://www.parliament.go.ke/the-national-assembly"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Parliament MPs"
          >
            <Users className="h-3.5 w-3.5" />
            Parliament MPs
            <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
          <a
            href="https://www.parliament.go.ke/the-senate"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Parliament Senators"
          >
            <Building2 className="h-3.5 w-3.5" />
            Parliament Senators
            <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// ==================== FOOTER ATTRIBUTION ====================

function FooterAttribution() {
  const { t } = useLanguage();
  return (
    <div className="mt-auto px-3 py-3 border-t bg-muted/20 shrink-0">
      <p className="text-[10px] font-medium text-foreground/80 leading-snug">{t('footer.title')}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t('footer.sources')}</p>
    </div>
  );
}

// ==================== MAIN ====================

function KenyaRightSidebarImpl({
  open,
  onClose,
  pinnedRepIds,
  onSelectPinned,
  onAllSections,
}: KenyaRightSidebarProps) {
  const { t } = useLanguage();
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 landscape:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-40 h-screen w-[280px] sm:w-[320px] bg-card border-l shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
        aria-label={t('rightSidebar.heading')}
      >
        <div className="flex items-center justify-between p-3 border-b shrink-0">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('rightSidebar.heading')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClose}
            aria-label="Close right sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            <Card>
              <CardContent className="p-3 space-y-2.5">
                <LanguageToggle />
                <Separator />
                <MiniThemeToggle />
              </CardContent>
            </Card>
            <NationalStatsMini />
            <LastUpdatedMini />
            <LiveFeedStatusMini />
            <PinnedRepsMini pinnedRepIds={pinnedRepIds} onSelectPinned={onSelectPinned} />
            <QuickActionsMini onAllSections={onAllSections} />
          </div>
        </ScrollArea>
        <FooterAttribution />
      </aside>
    </>
  );
}

const KenyaRightSidebar = memo(
  KenyaRightSidebarImpl,
  (prev, next) => {
    if (prev.open !== next.open) return false;
    if (prev.onClose !== next.onClose) return false;
    if (prev.onSelectPinned !== next.onSelectPinned) return false;
    if (prev.onAllSections !== next.onAllSections) return false;
    if (prev.pinnedRepIds.length !== next.pinnedRepIds.length) return false;
    for (let i = 0; i < prev.pinnedRepIds.length; i++) {
      if (prev.pinnedRepIds[i] !== next.pinnedRepIds[i]) return false;
    }
    return true;
  },
);

export { KenyaRightSidebar };
export default KenyaRightSidebar;
