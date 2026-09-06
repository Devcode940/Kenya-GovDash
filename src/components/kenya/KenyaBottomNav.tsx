'use client';

import React from 'react';
import { Landmark, MapPin, FileText, Scale, Video, Rss, Newspaper, BookOpen, Sparkles, Users, ShieldAlert } from 'lucide-react';

export type BottomNavTab = 'home' | 'counties' | 'profile';
export type TopTab = 'constitution' | 'videos' | 'feeds' | 'news' | 'reports' | 'development' | 'whistleblower' | 'feedback';

const BOTTOM_ITEMS: { id: BottomNavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Landmark className="h-5 w-5" /> },
  { id: 'counties', label: 'Counties', icon: <MapPin className="h-5 w-5" /> },
  { id: 'profile', label: 'Profile', icon: <FileText className="h-5 w-5" /> },
];

const TOP_ITEMS: { id: TopTab; label: string; icon: React.ReactNode }[] = [
  { id: 'constitution', label: 'Constitution', icon: <Scale className="h-3.5 w-3.5" /> },
  { id: 'videos', label: 'Videos', icon: <Video className="h-3.5 w-3.5" /> },
  { id: 'feeds', label: 'Live Feeds', icon: <Rss className="h-3.5 w-3.5" /> },
  { id: 'news', label: 'News', icon: <Newspaper className="h-3.5 w-3.5" /> },
  { id: 'reports', label: 'Reports', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'development', label: 'Dev Feedback', icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'whistleblower', label: 'Whistleblower', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  { id: 'feedback', label: 'Feedback', icon: <Sparkles className="h-3.5 w-3.5" /> },
];

export function KenyaBottomNav({ activeTab, onTabChange, visible }: { activeTab: BottomNavTab; onTabChange: (t: BottomNavTab) => void; visible: boolean; }) {
  return (
    <nav className={`landscape:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'} pb-[env(safe-area-inset-bottom)]`} aria-label="Bottom navigation">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`} onClick={() => onTabChange(item.id)} aria-label={item.label} aria-current={isActive ? 'page' : undefined}>
              <div className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>{item.icon}</div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function KenyaTopTabBar({ activeTab, onTabChange, visible }: { activeTab: TopTab; onTabChange: (t: TopTab) => void; visible: boolean; }) {
  return (
    <div className={`landscape:hidden sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-border transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full opacity-0 pointer-events-none'}`}>
      <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hide">
        {TOP_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0 ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} onClick={() => onTabChange(item.id)}>
              {item.icon}<span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
