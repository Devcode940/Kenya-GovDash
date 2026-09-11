'use client';

import React, { useState } from 'react';
import { Home, Sparkles, User, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/i18n';
import { buildAllCountyData, ALL_GOVERNORS } from '@/lib/kenya-data';

type BottomTab = 'home' | 'ai' | 'profile';

interface KenyaBottomNav3Props {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

// ==================== AI ASSISTANT DIALOG ====================

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function AIAssistantDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Habari! I\'m the Kenya GovDash AI assistant. Ask me about counties, governors, finance data, audit opinions, or how to use the dashboard.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Which county has the best audit opinion?',
    'How do I subscribe to finance alerts?',
    'What is the absorption rate for Nairobi City?',
    'Show me counties with adverse audit opinions',
    'How do I submit whistleblower feedback?',
  ];

  const handleSubmit = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || data.error || 'Sorry, I couldn\'t process that.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Kenya GovDash AI Assistant
          </DialogTitle>
          <DialogDescription>
            Ask about counties, finance data, audit opinions, representatives, or how to use the dashboard.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-3 py-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length <= 1 && (
          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Suggested questions</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-3 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
          <Button onClick={() => handleSubmit()} disabled={loading || !input.trim()} size="icon">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== PROFILE DIALOG ====================

function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const counties = buildAllCountyData();
  const { t } = useLanguage();

  const totalReps = counties.reduce((sum, c) => {
    let n = 0;
    if (c.governor) n++;
    if (c.senator) n++;
    if (c.womanRep) n++;
    if (c.constituencyMPs) n += c.constituencyMPs.length;
    if (c.cecms) n += c.cecms.length;
    return sum + n;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            {t('bottomnav.profile')}
          </DialogTitle>
          <DialogDescription>
            Account + dashboard summary
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total counties</span>
              <strong>{counties.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total representatives</span>
              <strong>{totalReps.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Governors</span>
              <strong>{ALL_GOVERNORS.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Counties with CECMs</span>
              <strong>{counties.filter(c => c.cecms && c.cecms.length > 0).length}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Quick links</h4>
            <a href="/finance-audit" className="block rounded-md border px-3 py-2 text-sm hover:bg-muted">
              📊 Finance & Audit Dashboard
            </a>
            <a href="/representatives" className="block rounded-md border px-3 py-2 text-sm hover:bg-muted">
              👥 Representatives Directory
            </a>
            <a href="/admin" className="block rounded-md border px-3 py-2 text-sm hover:bg-muted">
              🔐 Admin Console
            </a>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Theme</h4>
            <Button
              variant="outline" size="sm" className="w-full"
              onClick={() => {
                const cls = document.documentElement.classList;
                if (cls.contains('dark')) cls.remove('dark'); else cls.add('dark');
              }}
            >
              Toggle dark/light mode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== MAIN BOTTOM NAV ====================

export function KenyaBottomNav3({ activeTab, onTabChange }: KenyaBottomNav3Props) {
  const { t } = useLanguage();
  const [aiOpen, setAiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleTabChange = (tab: BottomTab) => {
    if (tab === 'ai') {
      setAiOpen(true);
    } else if (tab === 'profile') {
      setProfileOpen(true);
    } else {
      onTabChange(tab);
      // Navigate home
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 transition ${
              activeTab === 'home' ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('bottomnav.home')}</span>
          </button>

          <button
            onClick={() => handleTabChange('ai')}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 transition ${
              activeTab === 'ai' ? 'text-purple-600' : 'text-muted-foreground'
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              activeTab === 'ai' ? 'bg-purple-100 dark:bg-purple-950' : ''
            }`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">{t('bottomnav.ai')}</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 transition ${
              activeTab === 'profile' ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('bottomnav.profile')}</span>
          </button>
        </div>
      </nav>

      <AIAssistantDialog open={aiOpen} onOpenChange={setAiOpen} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
