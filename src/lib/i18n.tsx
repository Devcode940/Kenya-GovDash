'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'sw';

interface LanguageContextValue {
  language: Language;
  isSwahili: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  countyName: (englishName: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'Kenya Government Accountability Dashboard',
    'app.subtitle': 'Constitution of Kenya 2010 · Devolved Governance · 47 Counties',
    'app.title.short': 'Kenya GovDash',
    'app.badge': 'Factual · Source-Cited · Data-Gap Transparent',
    'nav.home': 'Home', 'nav.counties': 'Counties', 'nav.profile': 'Profile',
    'tab.constitution': 'Constitution', 'tab.feeds': 'Live Feeds', 'tab.news': 'News',
    'sidebar.heading': 'Navigation',
    'sidebar.section.dashboard': 'Dashboard', 'sidebar.section.constitution-law': 'Constitution & Law',
    'sidebar.section.accountability': 'Accountability', 'sidebar.section.dishonesty': 'Dishonesty Tracking',
    'sidebar.section.performance': 'Performance & Ranking', 'sidebar.section.citizen-tools': 'Citizen Tools',
    'sidebar.section.engagement': 'Citizen Engagement',
    'item.home': 'Home', 'item.counties': 'Counties', 'item.profile': 'Profile',
    'item.constitution': 'Constitution', 'item.court_cases': 'Court Cases Tracker',
    'item.feeds': 'Live Feeds', 'item.news': 'Political News', 'item.videos': 'Videos', 'item.reports': 'Reports',
    'item.pending_bills': 'Pending Bills Heatmap', 'item.projects': 'Project Tracker',
    'item.wealth': 'Wealth Declarations', 'item.red_flags': 'AI Red Flag Scanner',
    'item.tenders': 'Tender Anomaly Detector', 'item.payroll_assets': 'Ghost Workers & Assets',
    'item.sentiment': 'Sentiment Monitor', 'item.travel': 'Travel & Per-Diem Audit',
    'item.ownership': 'Beneficial Ownership', 'item.revenue': 'Revenue Leakage',
    'item.contracts': 'Contract Performance', 'item.variance': 'Budget Variance',
    'item.debt': 'Debt & Borrowing', 'item.alerts': 'Expenditure Alerts',
    'item.peer_ranking': 'Peer Ranking', 'item.performance_index': 'Performance Index',
    'item.participation': 'Public Participation', 'item.budget_qa': 'AI Budget Q&A',
    'item.bursary': 'Bursary Tracker', 'item.service_delivery': 'Service Delivery',
    'item.resolutions': 'Assembly Resolutions', 'item.development': 'Constituency Dev',
    'item.whistleblower': 'Whistleblower', 'item.hotline': 'Hotline Reports', 'item.feedback': 'Feedback',
    'action.search': 'Search', 'action.admin': 'Admin', 'action.allSections': 'All Sections',
    'action.toggleRightSidebar': 'Toggle right sidebar',
    'action.expandSidebar': 'Expand sidebar', 'action.collapseSidebar': 'Collapse sidebar',
    'rightSidebar.heading': 'Quick Access', 'rightSidebar.language': 'Language',
    'rightSidebar.english': 'English', 'rightSidebar.swahili': 'Kiswahili',
    'rightSidebar.theme': 'Theme', 'rightSidebar.lightMode': 'Light Mode', 'rightSidebar.darkMode': 'Dark Mode',
    'rightSidebar.nationalStats': 'National Stats', 'rightSidebar.liveStatus': 'Live Feed Status',
    'rightSidebar.quickActions': 'Quick Actions', 'rightSidebar.pinned': 'Pinned Representatives',
    'rightSidebar.noPinned': 'No pinned representatives yet.', 'rightSidebar.feedSources': 'Feed Sources',
    'rightSidebar.refresh': 'Refresh', 'rightSidebar.lastRefresh': 'Parliament data last updated',
    'rightSidebar.never': 'Never (using cached data)', 'rightSidebar.refreshing': 'Refreshing...',
    'rightSidebar.dataQuality': 'Data Quality',
    'rightSidebar.dataQuality.complete': 'Complete', 'rightSidebar.dataQuality.partial': 'Partial',
    'rightSidebar.dataQuality.minimal': 'Minimal', 'rightSidebar.dataQuality.score': 'Data Coverage',
    'footer.title': 'Kenya Government Accountability Dashboard — 2022–2027',
    'footer.source': 'Constitution of Kenya 2010, Chapter 6 & 11',
    'footer.nonPartisan': 'Non-Partisan · Factual',
    'footer.sources': 'Live Sources: OAG · CoB · TI-Kenya · EACC · Bajeti Hub',
    // New keys for finance dashboard, alerts, representatives, bottom nav
    'nav.finance_audit': 'Finance & Audit',
    'nav.representatives': 'Representatives',
    'nav.ai': 'AI Assistant',
    'bottomnav.home': 'Home',
    'bottomnav.ai': 'AI',
    'bottomnav.profile': 'Profile',
    'finance.title': 'Finance & Audit Dashboard',
    'finance.national': 'National Government',
    'finance.countyAggregate': 'County Aggregate',
    'finance.auditDistribution': 'Audit Opinion Distribution',
    'finance.topPerformers': 'Top 5 Counties — CoG Compliance Score',
    'finance.bottomPerformers': 'Bottom 5 Counties — Needs Intervention',
    'finance.countyTable': 'County-Level Finance Detail',
    'finance.trends': 'National Budget Trends — 3-Year Comparison',
    'finance.dataSources': 'Data Sources & Methodology',
    'finance.alerts.title': 'Subscribe to Finance Alerts',
    'finance.alerts.description': 'Get notified when a county\'s finance metrics breach your threshold.',
    'finance.alerts.email': 'Email address',
    'finance.alerts.county': 'County',
    'finance.alerts.metric': 'Metric',
    'finance.alerts.threshold': 'Threshold',
    'finance.alerts.subscribe': 'Create alert subscription',
    'finance.charts.trends': 'Finance Trends Over Time',
    'finance.charts.radar': '3-County Finance Radar Comparison',
    'finance.forecast': 'Forecast',
    'reps.title': 'Representatives Directory',
    'reps.governors': 'Governors',
    'reps.senators': 'Senators',
    'reps.womenReps': 'Women Representatives',
    'reps.mps': 'Members of Parliament',
    'reps.cecms': 'County Executives (CECMs)',
    'reps.search': 'Search by name, county, or party...',
    'reps.filterByCounty': 'Filter by county',
    'reps.filterByParty': 'Filter by party',
    'reps.total': 'Total representatives',
  },
  sw: {
    'app.title': 'Dashibodi ya Uwajibikaji wa Serikali ya Kenya',
    'app.subtitle': 'Katiba ya Kenya 2010 · Utawala wa Ugatuzi · Kaunti 47',
    'app.title.short': 'Dashibodi ya Kenya',
    'app.badge': 'Ya Ukweli · Chanzo Cha Habari · Wazi Kuhusu Pengo',
    'nav.home': 'Nyumbani', 'nav.counties': 'Kaunti', 'nav.profile': 'Wasifu',
    'tab.constitution': 'Katiba', 'tab.feeds': 'Habari Muhimu', 'tab.news': 'Habari',
    'sidebar.heading': 'Uabiri',
    'sidebar.section.dashboard': 'Dashibodi', 'sidebar.section.constitution-law': 'Katiba & Sheria',
    'sidebar.section.accountability': 'Uwajibikaji', 'sidebar.section.dishonesty': 'Ufuatiliaji wa Udanganyifu',
    'sidebar.section.performance': 'Utendaji & Nafasi', 'sidebar.section.citizen-tools': 'Vyombo vya Raia',
    'sidebar.section.engagement': 'Ushiriki wa Raia',
    'item.home': 'Nyumbani', 'item.counties': 'Kaunti', 'item.profile': 'Wasifu',
    'item.constitution': 'Katiba', 'item.court_cases': 'Kifuatiliaji cha Mashauri',
    'item.feeds': 'Habari Muhimu', 'item.news': 'Habari za Siasa', 'item.videos': 'Video', 'item.reports': 'Ripoti',
    'item.pending_bills': 'Ramani ya Bili Zilizosimama', 'item.projects': 'Kifuatiliaji cha Miradi',
    'item.wealth': 'Tamko la Mali', 'item.red_flags': 'Skana ya Bendera Nyekundu',
    'item.tenders': 'Kigunduzi cha Ubaya wa Zabuni', 'item.payroll_assets': 'Wafanyakazi Wabaya & Mali',
    'item.sentiment': 'Kifuatiliaji wa Hisia', 'item.travel': 'Ukaguzi wa Safari na Per-Diem',
    'item.ownership': 'Umiliki Halisi', 'item.revenue': 'Mtiririko wa Mapato',
    'item.contracts': 'Utendaji wa Mikataba', 'item.variance': 'Tofauti ya Bajeti',
    'item.debt': 'Deni na Kukopa', 'item.alerts': 'Arifa za Matumizi',
    'item.peer_ranking': 'Nafasi kwa Wenzio', 'item.performance_index': 'Fahirisi ya Utendaji',
    'item.participation': 'Ushiriki wa Umma', 'item.budget_qa': 'Maswali ya AI kuhusu Bajeti',
    'item.bursary': 'Kifuatiliaji cha Bursary', 'item.service_delivery': 'Utoaji wa Huduma',
    'item.resolutions': 'Azimio la Bunge', 'item.development': 'Maendeleo ya Jimbo',
    'item.whistleblower': 'Mlalamishaji', 'item.hotline': 'Ripoti za Simu', 'item.feedback': 'Maoni',
    'action.search': 'Tafuta', 'action.admin': 'Msimamizi', 'action.allSections': 'Sehemu Zote',
    'action.toggleRightSidebar': 'Badilisha sidebar ya kulia',
    'action.expandSidebar': 'Panua sidebar', 'action.collapseSidebar': 'Funga sidebar',
    'rightSidebar.heading': 'Ufikiaji wa Haraka', 'rightSidebar.language': 'Lugha',
    'rightSidebar.english': 'English', 'rightSidebar.swahili': 'Kiswahili',
    'rightSidebar.theme': 'Mandhari', 'rightSidebar.lightMode': 'Hali ya Mwanga', 'rightSidebar.darkMode': 'Hali ya Giza',
    'rightSidebar.nationalStats': 'Takwimu za Kitaifa', 'rightSidebar.liveStatus': 'Hali ya Habari',
    'rightSidebar.quickActions': 'Vitendo vya Haraka', 'rightSidebar.pinned': 'Wawakilishi Waliowekwa',
    'rightSidebar.noPinned': 'Hakuna wawakilishi waliolindwa bado.', 'rightSidebar.feedSources': 'Vyanzo vya Habari',
    'rightSidebar.refresh': 'Onyesha upya', 'rightSidebar.lastRefresh': 'Data ya Bunge ilisasishwa mwisho',
    'rightSidebar.never': 'Haijawahi (data iliyohifadhiwa)', 'rightSidebar.refreshing': 'Inasasisha...',
    'rightSidebar.dataQuality': 'Ubora wa Data',
    'rightSidebar.dataQuality.complete': 'Kamili', 'rightSidebar.dataQuality.partial': 'Sehemu',
    'rightSidebar.dataQuality.minimal': 'Kidogo', 'rightSidebar.dataQuality.score': 'Ufunikaji wa Data',
    'footer.title': 'Dashibodi ya Uwajibikaji wa Serikali ya Kenya — 2022–2027',
    'footer.source': 'Katiba ya Kenya 2010, Sura ya 6 & 11',
    'footer.nonPartisan': 'Isiyo na Chama · Ya Ukweli',
    'footer.sources': 'Vyanzo Halisi: OAG · CoB · TI-Kenya · EACC · Bajeti Hub',
    // Keys mpya za dashibodi ya fedha, arifa, wawakilishi, nav ya chini
    'nav.finance_audit': 'Fedha na Ukaguzi',
    'nav.representatives': 'Wawakilishi',
    'nav.ai': 'Msaidizi wa AI',
    'bottomnav.home': 'Nyumbani',
    'bottomnav.ai': 'AI',
    'bottomnav.profile': 'Wasifu',
    'finance.title': 'Dashibodi ya Fedha na Ukaguzi',
    'finance.national': 'Serikali ya Kitaifa',
    'finance.countyAggregate': 'Jumla ya Kaunti',
    'finance.auditDistribution': 'Mgawanyiko wa Maoni ya Ukaguzi',
    'finance.topPerformers': 'Kaunti 5 Bora — Alama ya Utiifu wa CoG',
    'finance.bottomPerformers': 'Kaunti 5 za Chini — Zinahitaji Uingiliaji',
    'finance.countyTable': 'Maelezo ya Fedha za Ki-kaunti',
    'finance.trends': 'Mwelekeo wa Bajeti ya Kitaifa — Ulinganisho wa Miaka 3',
    'finance.dataSources': 'Vyanzo vya Data na Mbinu',
    'finance.alerts.title': 'Jisajili kwa Arifa za Fedha',
    'finance.alerts.description': 'Pata arifa wakati vipimo vya fedha vya kaunti vinavuka kizingiti chako.',
    'finance.alerts.email': 'Anuani ya barua pepe',
    'finance.alerts.county': 'Kaunti',
    'finance.alerts.metric': 'Kipimo',
    'finance.alerts.threshold': 'Kizingiti',
    'finance.alerts.subscribe': 'Unda usajili wa arifa',
    'finance.charts.trends': 'Mwelekeo wa Fedha kwa Muda',
    'finance.charts.radar': 'Ulinganisho wa Fedha wa Kaunti 3',
    'finance.forecast': 'Utabiri',
    'reps.title': 'Saraka ya Wawakilishi',
    'reps.governors': 'Makhalifa',
    'reps.senators': 'Maseneta',
    'reps.womenReps': 'Wawakilishi wa Wanawake',
    'reps.mps': 'Wajumbe wa Bunge',
    'reps.cecms': 'Watumishi wa Ugatuzi (CECMs)',
    'reps.search': 'Tafuta kwa jina, kaunti, au chama...',
    'reps.filterByCounty': 'Chuja kwa kaunti',
    'reps.filterByParty': 'Chuja kwa chama',
    'reps.total': 'Jumla ya wawakilishi',
  },
};

const COUNTY_NAMES_SW: Record<string, string> = {
  'Mombasa': 'Mombasa', 'Kwale': 'Kwale', 'Kilifi': 'Kilifi', 'Tana River': 'Mto Tana',
  'Lamu': 'Lamu', 'Taita Taveta': 'Taita Taveta', 'Garissa': 'Garissa', 'Wajir': 'Wajir',
  'Mandera': 'Mandera', 'Marsabit': 'Marsabit', 'Isiolo': 'Isiolo', 'Meru': 'Meru',
  'Tharaka Nithi': 'Tharaka-Nithi', 'Embu': 'Embu', 'Kitui': 'Kitui', 'Machakos': 'Machakos',
  'Makueni': 'Makueni', 'Nyandarua': 'Nyandarua', 'Nyeri': 'Nyeri', 'Kirinyaga': 'Kirinyaga',
  "Murang'a": "Murang'a", 'Kiambu': 'Kiambu', 'Turkana': 'Turkana', 'West Pokot': 'Pokot Magharibi',
  'Samburu': 'Samburu', 'Trans-Nzoia': 'Trans-Nzoia', 'Uasin Gishu': 'Uasin Gishu',
  'Elgeyo-Marakwet': 'Elgeyo-Marakwet', 'Nandi': 'Nandi', 'Baringo': 'Baringo',
  'Laikipia': 'Laikipia', 'Nakuru': 'Nakuru', 'Narok': 'Narok', 'Kajiado': 'Kajiado',
  'Kericho': 'Kericho', 'Bomet': 'Bomet', 'Kakamega': 'Kakamega', 'Vihiga': 'Vihiga',
  'Bungoma': 'Bungoma', 'Busia': 'Busia', 'Siaya': 'Siaya', 'Kisumu': 'Kisumu',
  'Homa Bay': 'Homa Bay', 'Migori': 'Migori', 'Kisii': 'Kisii', 'Nyamira': 'Nyamira',
  'Nairobi City': 'Nairobi',
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'kenya-govdash-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (!mounted) return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (saved === 'en' || saved === 'sw') setLanguageState(saved);
      } catch { /* ignore */ }
      setMounted(true);
    });
    return () => { mounted = false; };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  }, [language, setLanguage]);

  const t = useCallback((key: string): string => {
    const swValue = translations.sw[key];
    const enValue = translations.en[key];
    if (language === 'sw' && swValue) return swValue;
    if (enValue) return enValue;
    return key;
  }, [language]);

  const countyName = useCallback((englishName: string): string => {
    if (language === 'sw') return COUNTY_NAMES_SW[englishName] ?? englishName;
    return englishName;
  }, [language]);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  // ARIA live region for screen readers
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    let liveRegion = document.getElementById('language-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'language-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
      document.body.appendChild(liveRegion);
    }
    const timeoutId = setTimeout(() => {
      if (liveRegion) liveRegion.textContent = language === 'sw' ? 'Lugha imebadilishwa kuwa Kiswahili' : 'Language changed to English';
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [language, mounted]);

  const value = useMemo(() => ({ language, isSwahili: language === 'sw', toggleLanguage, setLanguage, t, countyName }), [language, toggleLanguage, setLanguage, t, countyName]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
