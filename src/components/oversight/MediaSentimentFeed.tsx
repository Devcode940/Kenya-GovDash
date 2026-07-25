"use client";

import { Newspaper, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type MediaSentiment, type SentimentType, mediaSentiments, getMediaSentimentForRep } from "@/lib/data";

function sentimentColor(sentiment: SentimentType): string {
  if (sentiment === "Positive") return "#22c55e";
  if (sentiment === "Negative") return "#ef4444";
  if (sentiment === "Mixed") return "#eab308";
  return "#94a3b8";
}

function sentimentIcon(sentiment: SentimentType) {
  if (sentiment === "Positive") return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (sentiment === "Negative") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  if (sentiment === "Mixed") return <Minus className="h-3.5 w-3.5 text-yellow-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

function scoreToBar(score: number): string {
  // score is -100 to 100, normalize to 0-100
  const normalized = ((score + 100) / 200) * 100;
  return `${Math.max(Math.min(normalized, 100), 5)}%`;
}

export function MediaSentimentFeed({ rep }: { rep: Representative }) {
  const repSentiments = getMediaSentimentForRep(rep.id);

  // Overall sentiment score for this rep
  const overallScore = repSentiments.length > 0
    ? Math.round(repSentiments.reduce((sum, m) => sum + m.sentimentScore, 0) / repSentiments.length)
    : 0;

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  repSentiments.forEach((m) => {
    sourceCounts[m.source] = (sourceCounts[m.source] || 0) + 1;
  });

  // Sentiment distribution
  const sentimentCounts: Record<SentimentType, number> = { "Positive": 0, "Neutral": 0, "Negative": 0, "Mixed": 0 };
  repSentiments.forEach((m) => {
    sentimentCounts[m.sentiment]++;
  });

  const totalMentions = repSentiments.reduce((sum, m) => sum + m.mentionsCount, 0);

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold" style={{ backgroundColor: overallScore > 30 ? "#22c55e20" : overallScore > 0 ? "#eab30820" : "#ef444420", color: overallScore > 30 ? "#22c55e" : overallScore > 0 ? "#eab308" : "#ef4444" }}>
            {overallScore}
          </div>
          <div>
            <div className="text-sm font-semibold">Overall Sentiment Score</div>
            <div className="text-xs text-muted-foreground">{totalMentions.toLocaleString()} total mentions across {repSentiments.length} articles</div>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Sentiment Distribution</h4>
        <div className="flex gap-2">
          {(["Positive", "Neutral", "Mixed", "Negative"] as SentimentType[]).map((s) => (
            <div key={s} className="flex-1 rounded-md p-2 text-center" style={{ backgroundColor: sentimentColor(s) + "15%" }}>
              {sentimentIcon(s)}
              <div className="text-sm font-bold mt-1" style={{ color: sentimentColor(s) }}>{sentimentCounts[s]}</div>
              <div className="text-[10px] text-muted-foreground">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Breakdown */}
      {Object.keys(sourceCounts).length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">Source Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(sourceCounts).map(([source, count]) => (
              <div key={source} className="flex items-center gap-2">
                <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs flex-1">{source}</span>
                <span className="text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment Trend (simple bars) */}
      {repSentiments.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">Sentiment Over Time</h4>
          <div className="flex items-end gap-1.5 h-24">
            {repSentiments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((ms) => {
              const barHeight = Math.abs(ms.sentimentScore);
              const maxBarHeight = 100;
              const normalizedHeight = (barHeight / 100) * 100;
              return (
                <div key={ms.id} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-bold" style={{ color: sentimentColor(ms.sentiment) }}>{ms.sentimentScore > 0 ? "+" : ""}{ms.sentimentScore}</span>
                  <div className="w-full rounded-t-md" style={{ height: `${Math.max(normalizedHeight, 5)}%`, backgroundColor: sentimentColor(ms.sentiment) + "80%" }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Recent Media Mentions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">Recent Media for {rep.name}</h4>
        {repSentiments.length > 0 ? (
          repSentiments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((ms) => (
            <div key={ms.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-start gap-2">
                {sentimentIcon(ms.sentiment)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{ms.headline}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: sentimentColor(ms.sentiment), color: sentimentColor(ms.sentiment) }}>
                      {ms.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <Newspaper className="h-3 w-3" />
                    <span>{ms.source}</span>
                    <span>•</span>
                    <span>{ms.date}</span>
                    <span>•</span>
                    <MessageSquare className="h-3 w-3" />
                    <span>{ms.mentionsCount.toLocaleString()} mentions</span>
                  </div>
                </div>
                <div className="text-sm font-bold shrink-0" style={{ color: overallScore > 0 ? sentimentColor(ms.sentiment) : "#94a3b8" }}>
                  {ms.sentimentScore > 0 ? "+" : ""}{ms.sentimentScore}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center">
            <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No media sentiment data for this representative</p>
          </div>
        )}
      </div>
    </div>
  );
}
