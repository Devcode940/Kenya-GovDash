import { NextRequest, NextResponse } from 'next/server';
import {
  buildAllCountyData,
  ALL_GOVERNORS,
} from '@/lib/kenya-data';
import {
  ALL_COUNTY_FINANCE,
  NATIONAL_FINANCE,
  getAggregateStats,
  getCountiesWithFinanceData,
} from '@/lib/finance-audit-data';

export const maxDuration = 60;

// POST /api/ai-assistant — answer questions using real LLM (z-ai-web-dev-sdk)
// with structured Kenya government data as context.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = (body.question || '').trim();
    const history = body.history || [];

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    // Build context from structured data
    const context = buildDataContext();

    // System prompt with data context
    const systemPrompt = `You are the Kenya GovDash AI assistant — an expert on Kenya's 47 county governments, finance data, audit opinions, elected representatives, and oversight institutions.

Your role:
- Answer questions about Kenya counties, governors, senators, MPs, CECMs, finance, audit opinions, budgets, pending bills
- Help users navigate the dashboard, subscribe to alerts, submit whistleblower reports, find representatives
- Be factual, concise, and cite sources (OAG, CoB, CoG, KNBS) where possible
- If data is not available, say so rather than inventing numbers
- Suggest relevant pages on the dashboard when appropriate

Available dashboard pages:
- / — main dashboard with 47 counties
- /finance-audit — finance + audit dashboard with national + county data
- /finance-audit/county/[name] — per-county drill-down with forecast
- /representatives — directory of all elected officials (governors, senators, women reps, MPs, CECMs)
- /feedback — public feedback list
- /admin — admin console (password: kenya-oversight-2026)

Current data context (use this to answer questions):

${context}

Answer in clear, helpful language. If asked about a specific county, provide the most recent fiscal year data available. Format responses with bullet points where appropriate.`;

    // Try real LLM first
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const messages = [
        { role: 'assistant', content: systemPrompt },
        ...history.map((h: any) => ({
          role: h.role,
          content: h.content,
        })),
        { role: 'user', content: question },
      ];

      const response = await zai.chat.completions.create({
        messages,
        stream: false,
        thinking: { type: 'disabled' },
      });

      const reply = response.choices?.[0]?.message?.content;
      if (reply) {
        return NextResponse.json({ answer: reply, question, source: 'llm' });
      }
    } catch (llmErr) {
      console.warn('[ai-assistant] LLM failed, falling back to rule-based:', llmErr);
    }

    // Fallback to rule-based answers
    const fallbackAnswer = answerQuestionRuleBased(question.toLowerCase());
    return NextResponse.json({ answer: fallbackAnswer, question, source: 'rule-based' });
  } catch (err) {
    console.error('AI assistant error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

// Build a compact data context for the LLM
function buildDataContext(): string {
  const counties = buildAllCountyData();
  const stats = getAggregateStats('2023/24');
  const national = NATIONAL_FINANCE[0];

  const lines: string[] = [];

  // National summary
  lines.push('=== NATIONAL GOVERNMENT (FY ' + national.fiscalYear + ') ===');
  lines.push(`Approved budget: Kshs ${(national.approvedBudget! / 1_000_000).toFixed(2)}T`);
  lines.push(`Actual expenditure: Kshs ${(national.actualExpenditure! / 1_000_000).toFixed(2)}T`);
  lines.push(`Overall absorption: ${national.overallAbsorption}%`);
  lines.push(`Pending bills: Kshs ${(national.pendingBills! / 1_000_000).toFixed(2)}T`);
  lines.push(`Public debt: Kshs ${(national.totalDebt! / 1_000_000).toFixed(2)}T`);
  lines.push(`Audit opinion: ${national.auditOpinion}`);
  lines.push('');

  // County aggregates
  lines.push('=== COUNTY AGGREGATES (FY 2023/24, 20 tracked counties) ===');
  lines.push(`Total approved budget: Kshs ${(stats.totalApprovedBudget / 1000).toFixed(2)}B`);
  lines.push(`Total equitable share: Kshs ${(stats.totalEquitableShare / 1000).toFixed(2)}B`);
  lines.push(`Total pending bills: Kshs ${(stats.totalPendingBills / 1000).toFixed(2)}B`);
  lines.push(`Avg overall absorption: ${stats.avgOverallAbsorption.toFixed(1)}%`);
  lines.push(`Audit opinions: ${Object.entries(stats.auditOpinionCounts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  lines.push('');

  // Top + bottom performers
  lines.push('Top 5 by CoG compliance: ' + stats.topPerformers.map(c => `${c.countyName} (${c.complianceScore})`).join(', '));
  lines.push('Bottom 5 by CoG compliance: ' + stats.bottomPerformers.map(c => `${c.countyName} (${c.complianceScore})`).join(', '));
  lines.push('');

  // Per-county finance data (compact)
  lines.push('=== COUNTY FINANCE DETAIL (FY 2023/24) ===');
  for (const r of ALL_COUNTY_FINANCE.filter(r => r.fiscalYear === '2023/24')) {
    lines.push(`${r.countyName}: budget=${r.approvedBudget}M, absorption=${r.overallAbsorption}%, dev=${r.developmentAbsorption}%, audit=${r.auditOpinion}, pending=${r.pendingBills || 'N/A'}M, cog=${r.complianceScore || 'N/A'}/100`);
  }
  lines.push('');

  // Governors (compact)
  lines.push('=== GOVERNORS (all 47) ===');
  for (const g of ALL_GOVERNORS) {
    lines.push(`${g.countyName}: ${g.governorName} (${g.party}, ${g.coalition})`);
  }
  lines.push('');

  // CECM summary
  const countiesWithCecms = counties.filter(c => c.cecms && c.cecms.length > 0).length;
  lines.push(`=== CECMs ===`);
  lines.push(`${countiesWithCecms} counties have CECM data (~10 portfolios each: Finance, Health, Education, Lands, Transport, Water, Environment, Trade, Agriculture, Social Services)`);
  lines.push('');

  // How-to summaries
  lines.push('=== HOW TO USE ===');
  lines.push('- Subscribe to alerts: /finance-audit → scroll to "Subscribe to Finance Alerts" → enter email + county + metric + threshold');
  lines.push('- Submit whistleblower: sidebar → "Secure Whistleblower" → encrypt + submit (save passphrase + ticket number)');
  lines.push('- View representative: /representatives → search by name/county/party');
  lines.push('- Submit feedback: sidebar → "Feedback" → fill form');
  lines.push('- Toggle language: right sidebar → English/Kiswahili');

  return lines.join('\n');
}

// Rule-based fallback (used if LLM fails)
function answerQuestionRuleBased(q: string): string {
  const counties = buildAllCountyData();
  const stats = getAggregateStats('2023/24');

  if (q.includes('best audit') || q.includes('unmodified')) {
    const unmodified = ALL_COUNTY_FINANCE.filter(r => r.fiscalYear === '2023/24' && r.auditOpinion === 'Unmodified');
    return `Counties with Unmodified (best) audit opinions in FY 2023/24:\n\n${unmodified.map(c => `• ${c.countyName} — CoG score ${c.complianceScore}/100`).join('\n')}\n\nSource: OAG County Audit Reports.`;
  }

  if (q.includes('adverse')) {
    const adverse = ALL_COUNTY_FINANCE.filter(r => r.fiscalYear === '2023/24' && r.auditOpinion === 'Adverse');
    return `Counties with Adverse audit opinions in FY 2023/24:\n\n${adverse.map(c => `• ${c.countyName}`).join('\n')}\n\nSource: OAG.`;
  }

  if (q.includes('top') || q.includes('best county')) {
    return `Top 5 counties by CoG Compliance Score:\n\n${stats.topPerformers.map((c, i) => `${['🥇', '🥈', '🥉', '4', '5'][i]} ${c.countyName} — ${c.complianceScore}/100`).join('\n')}`;
  }

  // County-specific
  const countyMatch = counties.find(c => q.includes(c.name.toLowerCase()));
  if (countyMatch && (q.includes('absorption') || q.includes('budget'))) {
    const finRec = ALL_COUNTY_FINANCE.find(r => r.countyName === countyMatch.name && r.fiscalYear === '2023/24');
    if (finRec) {
      return `${countyMatch.name} County FY 2023/24:\n• Budget: Kshs ${finRec.approvedBudget}M\n• Absorption: ${finRec.overallAbsorption}%\n• Audit: ${finRec.auditOpinion}\nSource: ${finRec.source}`;
    }
  }

  return `I can help with counties, finance, audit opinions, representatives, and how to use the dashboard. Try asking about a specific county, "best audit opinions," "top performers," or "how to subscribe to alerts."`;
}
