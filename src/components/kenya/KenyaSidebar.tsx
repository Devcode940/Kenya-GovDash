'use client';

import React from 'react';
import { Home, MapPin, FileText, Scale, Rss, Newspaper, Video, BookOpen, Users, Sparkles, ChevronRight, ShieldAlert, Flame, ClipboardCheck, Shield, ScanSearch, FileSearch, Building2, MessageCircle, Plane, Network, DollarSign, Gavel, Phone, FileCheck, PieChart, Landmark, Trophy, Bell, Award } from 'lucide-react';

interface KenyaSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const SIDEBAR_SECTIONS = [
  { title: 'Dashboard', items: [
    { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { id: 'counties', label: 'Counties', icon: <MapPin className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <FileText className="h-4 w-4" /> },
  ]},
  { title: 'Constitution & Law', items: [
    { id: 'constitution', label: 'Constitution', icon: <Scale className="h-4 w-4" /> },
    { id: 'court_cases', label: 'Court Cases Tracker', icon: <Gavel className="h-4 w-4" /> },
  ]},
  { title: 'Accountability', items: [
    { id: 'feeds', label: 'Live Feeds', icon: <Rss className="h-4 w-4" /> },
    { id: 'news', label: 'Political News', icon: <Newspaper className="h-4 w-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <BookOpen className="h-4 w-4" /> },
  ]},
  { title: 'Dishonesty Tracking', items: [
    { id: 'pending_bills', label: 'Pending Bills Heatmap', icon: <Flame className="h-4 w-4" /> },
    { id: 'projects', label: 'Project Tracker', icon: <ClipboardCheck className="h-4 w-4" /> },
    { id: 'wealth', label: 'Wealth Declarations', icon: <Shield className="h-4 w-4" /> },
    { id: 'red_flags', label: 'AI Red Flag Scanner', icon: <ScanSearch className="h-4 w-4" /> },
    { id: 'tenders', label: 'Tender Anomaly Detector', icon: <FileSearch className="h-4 w-4" /> },
    { id: 'payroll_assets', label: 'Ghost Workers & Assets', icon: <Building2 className="h-4 w-4" /> },
    { id: 'sentiment', label: 'Sentiment Monitor', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'travel', label: 'Travel & Per-Diem Audit', icon: <Plane className="h-4 w-4" /> },
    { id: 'ownership', label: 'Beneficial Ownership', icon: <Network className="h-4 w-4" /> },
    { id: 'revenue', label: 'Revenue Leakage', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'contracts', label: 'Contract Performance', icon: <FileCheck className="h-4 w-4" /> },
    { id: 'variance', label: 'Budget Variance', icon: <PieChart className="h-4 w-4" /> },
    { id: 'debt', label: 'Debt & Borrowing', icon: <Landmark className="h-4 w-4" /> },
    { id: 'alerts', label: 'Expenditure Alerts', icon: <Bell className="h-4 w-4" /> },
  ]},
  { title: 'Performance & Ranking', items: [
    { id: 'peer_ranking', label: 'Peer Ranking', icon: <Trophy className="h-4 w-4" /> },
    { id: 'performance_index', label: 'Performance Index', icon: <Award className="h-4 w-4" /> },
    { id: 'participation', label: 'Public Participation', icon: <Users className="h-4 w-4" /> },
  ]},
  { title: 'Citizen Engagement', items: [
    { id: 'development', label: 'Constituency Dev', icon: <Users className="h-4 w-4" /> },
    { id: 'whistleblower', label: 'Whistleblower', icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'hotline', label: 'Hotline Reports', icon: <Phone className="h-4 w-4" /> },
    { id: 'feedback', label: 'Feedback', icon: <Sparkles className="h-4 w-4" /> },
  ]},
];

export function KenyaSidebar({ activeSection, onNavigate }: KenyaSidebarProps) {
  return (
    <div className="hidden lg:flex flex-col w-60 shrink-0 border-r bg-card/50 h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-4 py-1">
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{section.title}</p>
            </div>
            {section.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left ${
                    isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}>
                  {item.icon}<span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
