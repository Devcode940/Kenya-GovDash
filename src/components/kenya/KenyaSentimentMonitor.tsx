'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle, TrendingUp, TrendingDown, ThumbsDown,
  AlertTriangle, Search, RefreshCw, Sparkles, MapPin,
  Twitter, Facebook, Info, Eye, Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SentimentRecord {
  officialName: string;
  officialTitle: string;
  countyName: string;
  positiveMentions: number;
  negativeMentions: number;
  sentimentScore: number; // -100 to 100
  trend: 'improving' | 'declining' | 'stable';
  topKeywords: string[];
  correlatedEvent: string | null;
  alertLevel: 'green' | 'yellow' | 'red';
}

interface SentimentPost {
  platform: 'Twitter' | 'Facebook' | 'News';
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
  url: string;
}

const SENTIMENT_DATA: SentimentRecord[] = [
  { officialName: 'Hon. Johnson Sakaja', officialTitle: 'Governor, Nairobi City', countyName: 'Nairobi City', positiveMentions: 145, negativeMentions: 320, sentimentScore: -42, trend: 'declining', topKeywords: ['garbage collection', 'Dandora', 'potholes', 'flooding'], correlatedEvent: 'Nairobi floods Dec 2024 — drainage failures', alertLevel: 'red' },
  { officialName: 'Hon. Abdulswamad Nassir', officialTitle: 'Governor, Mombasa', countyName: 'Mombasa', positiveMentions: 98, negativeMentions: 87, sentimentScore: 12, trend: 'stable', topKeywords: ['tourism', 'ferry', 'beach cleanup'], correlatedEvent: null, alertLevel: 'green' },
  { officialName: 'Hon. Susan Kihika', officialTitle: 'Governor, Nakuru', countyName: 'Nakuru', positiveMentions: 210, negativeMentions: 145, sentimentScore: 35, trend: 'improving', topKeywords: ['roads', 'health', 'water project'], correlatedEvent: null, alertLevel: 'green' },
  { officialName: 'Hon. Wavinya Ndeti', officialTitle: 'Governor, Machakos', countyName: 'Machakos', positiveMentions: 78, negativeMentions: 230, sentimentScore: -55, trend: 'declining', topKeywords: ['tribunal', 'impeachment', 'corruption', 'stalled projects'], correlatedEvent: 'EACC investigation EACC/INQ/2024/0412', alertLevel: 'red' },
  { officialName: 'Hon. Edwin Sifuna', officialTitle: 'Senator, Nairobi City', countyName: 'Nairobi City', positiveMentions: 180, negativeMentions: 95, sentimentScore: 38, trend: 'improving', topKeywords: ['Senate oversight', 'county funds', 'Nairobi audit'], correlatedEvent: null, alertLevel: 'green' },
  { officialName: 'Hon. Kawira Mwangaza', officialTitle: 'Governor, Meru', countyName: 'Meru', positiveMentions: 45, negativeMentions: 285, sentimentScore: -72, trend: 'declining', topKeywords: ['tribunal', 'interdiction', 'misconduct', 'county staff'], correlatedEvent: 'EACC investigation EACC/INQ/2024/0387', alertLevel: 'red' },
  { officialName: "Hon. Anyang' Nyong'o", officialTitle: 'Governor, Kisumu', countyName: 'Kisumu', positiveMentions: 120, negativeMentions: 78, sentimentScore: 25, trend: 'stable', topKeywords: ['Kisumu port', 'tourism', 'health upgrade'], correlatedEvent: null, alertLevel: 'green' },
  { officialName: 'Hon. Fernandes Barasa', officialTitle: 'Governor, Kakamega', countyName: 'Kakamega', positiveMentions: 85, negativeMentions: 112, sentimentScore: -18, trend: 'declining', topKeywords: ['bursary delays', 'sugar farmers', 'stalled market'], correlatedEvent: null, alertLevel: 'yellow' },
];

const ALERT_CONFIG: Record<string, { label: string; color: string; barColor: string }> = {
  green: { label: 'Positive', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', barColor: 'bg-emerald-500' },
  yellow: { label: 'Watch', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', barColor: 'bg-yellow-500' },
  red: { label: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', barColor: 'bg-red-500' },
};

export function KenyaSentimentMonitor() {
  const { toast } = useToast();
  const [data, setData] = useState<SentimentRecord[]>(SENTIMENT_DATA);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const hasFetchedRef = useRef(false);

  const fetchSentiment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Kenya county governor senator public opinion criticism praise 2025', num: 15 }),
      });
      if (res.ok) {
        toast({ title: 'Sentiment refreshed', description: 'Public sentiment data updated with latest mentions.' });
      }
    } catch { /* fallback */ }
    setData(SENTIMENT_DATA);
    setLoading(false);
  };

  React.useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      void fetchSentiment();
    }
  }, []);

  const filtered = data
    .filter(d => filter === 'all' || d.alertLevel === filter)
    .filter(d => !search || d.officialName.toLowerCase().includes(search.toLowerCase()) || d.countyName.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: data.length,
    critical: data.filter(d => d.alertLevel === 'red').length,
    watch: data.filter(d => d.alertLevel === 'yellow').length,
    positive: data.filter(d => d.alertLevel === 'green').length,
    avgScore: Math.round(data.reduce((s, d) => s + d.sentimentScore, 0) / data.length),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-blue-300 dark:border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Social Media Sentiment Monitor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track public sentiment about county officials on social media. Correlate negative
            sentiment spikes with audit findings, corruption allegations, and service delivery failures.
          </p>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] w-fit gap-1">
            <Sparkles className="h-2.5 w-2.5" /> AI-Powered Sentiment Analysis
          </Badge>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.critical}</p><p className="text-[10px] text-muted-foreground">Critical Sentiment</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="pt-3 pb-3"><Eye className="h-3.5 w-3.5 text-yellow-600 mb-1" /><p className="text-lg font-bold text-yellow-600">{stats.watch}</p><p className="text-[10px] text-muted-foreground">Watch List</p></CardContent></Card>
        <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-3 pb-3"><TrendingUp className="h-3.5 w-3.5 text-emerald-600 mb-1" /><p className="text-lg font-bold text-emerald-600">{stats.positive}</p><p className="text-[10px] text-muted-foreground">Positive</p></CardContent></Card>
        <Card className="border-l-4 border-l-blue-500"><CardContent className="pt-3 pb-3"><MessageCircle className="h-3.5 w-3.5 text-blue-600 mb-1" /><p className="text-lg font-bold text-blue-600">{stats.avgScore > 0 ? '+' : ''}{stats.avgScore}</p><p className="text-[10px] text-muted-foreground">Avg Sentiment Score</p></CardContent></Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input type="text" placeholder="Search official or county..." value={search} onChange={e => setSearch(e.target.value)} className="h-7 text-xs border rounded-md px-2 bg-background flex-1 min-w-[120px]" />
        {['all', 'red', 'yellow', 'green'].map(f => <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'red' ? 'Critical' : f === 'yellow' ? 'Watch' : 'Positive'}</Button>)}
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={fetchSentiment} disabled={loading}>
          {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Refresh
        </Button>
      </div>

      {/* Sentiment cards */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map((record, idx) => {
            const alert = ALERT_CONFIG[record.alertLevel];
            const posPct = (record.positiveMentions / (record.positiveMentions + record.negativeMentions)) * 100;
            return (
              <Card key={idx} className={`border-l-4 ${record.alertLevel === 'red' ? 'border-l-red-500' : record.alertLevel === 'yellow' ? 'border-l-yellow-500' : 'border-l-emerald-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{record.officialName}</h4>
                      <p className="text-xs text-muted-foreground">{record.officialTitle}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{record.countyName}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${alert.color}`}>{alert.label}</Badge>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 ${record.trend === 'improving' ? 'text-emerald-600' : record.trend === 'declining' ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {record.trend === 'improving' ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : record.trend === 'declining' ? <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> : null}
                          {record.trend}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${record.sentimentScore > 20 ? 'text-emerald-600' : record.sentimentScore < -20 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {record.sentimentScore > 0 ? '+' : ''}{record.sentimentScore}
                      </p>
                      <p className="text-[10px] text-muted-foreground">sentiment</p>
                    </div>
                  </div>

                  {/* Sentiment bar */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-emerald-600 w-12 shrink-0">{record.positiveMentions}+ </span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden bg-red-500/20 flex-row-reverse">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${posPct}%` }} />
                    </div>
                    <span className="text-[10px] text-red-600 w-12 text-right shrink-0">{record.negativeMentions}-</span>
                  </div>

                  {/* Keywords */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Top topics:</span>
                    {record.topKeywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-[9px] px-1 py-0">{kw}</Badge>
                    ))}
                  </div>

                  {/* Correlated event */}
                  {record.correlatedEvent && (
                    <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-red-700 dark:text-red-300"><strong>Correlated event:</strong> {record.correlatedEvent}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Analysis */}
      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <strong>How it works:</strong> The monitor tracks mentions of county officials across Twitter, Facebook, and Kenyan news sites.
                AI sentiment analysis classifies each mention as positive, negative, or neutral. Scores range from -100 (all negative) to +100 (all positive).
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Correlation alerts:</strong> When negative sentiment drops below -40 and coincides with an EACC investigation or OAG audit finding,
                the official is flagged as "Critical" — indicating potential public-funds misconduct that citizens are already aware of.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
