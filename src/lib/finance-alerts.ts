// Finance Alert system — checks published FinanceAuditSnapshots + static data
// against subscriber thresholds, and queues notifications.

import { db } from './db';
import { ALL_COUNTY_FINANCE } from './finance-audit-data';
import { buildUnsubscribeUrl } from './unsubscribe-token';

export interface AlertCheck {
  subscriptionId: string;
  email: string;
  countyName: string;
  metric: string;
  triggerValue: number;
  threshold: number | null;
  message: string;
}

// Check all active subscriptions against the latest finance data.
// Returns the list of alerts that should fire (and haven't fired yet).
export async function checkAlerts(): Promise<AlertCheck[]> {
  const subscriptions = await db.financeAlertSubscription.findMany({
    where: { active: true, confirmedAt: { not: null } },
  });

  const triggers: AlertCheck[] = [];

  for (const sub of subscriptions) {
    // Find the latest record for this county + metric
    const records = ALL_COUNTY_FINANCE
      .filter(r => r.countyName.toLowerCase() === sub.countyName.toLowerCase())
      .sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
    if (records.length === 0) continue;
    const latest = records[records.length - 1];

    const metricValue = (latest as any)[sub.metric] as number | undefined;
    if (metricValue == null) continue;

    let shouldFire = false;
    if (sub.metric === 'pendingBills') {
      // For pending bills, alert when value goes ABOVE threshold
      if (sub.threshold != null && metricValue > sub.threshold) shouldFire = true;
    } else if (sub.metric === 'auditOpinion') {
      // For audit opinion, we don't have a numeric threshold — alert on any change
      // Compare against lastTriggeredValue (encoded as opinion rank)
      const opinionRank: Record<string, number> = {
        'Unmodified': 4, 'Qualified': 3, 'Adverse': 2, 'Disclaimer': 1, 'Not Audited': 0,
      };
      const rank = opinionRank[latest.auditOpinion] ?? 0;
      if (sub.lastTriggeredValue != null && rank < sub.lastTriggeredValue) {
        shouldFire = true; // opinion worsened
      } else if (sub.lastTriggeredValue == null) {
        shouldFire = true; // first check
      }
    } else {
      // For absorption metrics, alert when value drops BELOW threshold
      if (sub.threshold != null && metricValue < sub.threshold) shouldFire = true;
    }

    if (!shouldFire) continue;

    // Avoid re-triggering for the same value (dedup by lastTriggeredValue)
    if (sub.lastTriggeredValue === metricValue && sub.metric !== 'auditOpinion') continue;

    let message: string;
    if (sub.metric === 'pendingBills') {
      message = `⚠ ${sub.countyName} County pending bills have risen to Kshs ${metricValue}M (above your threshold of Kshs ${sub.threshold}M). Latest data from FY ${latest.fiscalYear}.`;
    } else if (sub.metric === 'auditOpinion') {
      message = `⚠ ${sub.countyName} County audit opinion worsened to "${latest.auditOpinion}" in FY ${latest.fiscalYear}. This indicates deteriorating financial management.`;
    } else {
      const metricLabel = sub.metric === 'overallAbsorption' ? 'Overall absorption' : 'Development absorption';
      message = `⚠ ${sub.countyName} County ${metricLabel.toLowerCase()} dropped to ${metricValue.toFixed(1)}% in FY ${latest.fiscalYear}, below your threshold of ${sub.threshold}%.`;
    }

    triggers.push({
      subscriptionId: sub.id,
      email: sub.email,
      countyName: sub.countyName,
      metric: sub.metric,
      triggerValue: metricValue,
      threshold: sub.threshold,
      message,
    });
  }

  return triggers;
}

// Process all triggered alerts: log them + (in dev) print to console.
// In production with RESEND_API_KEY, this is where we'd send real emails.
export async function processAlerts(): Promise<{ triggered: number; failed: number }> {
  const triggers = await checkAlerts();
  let triggered = 0;
  let failed = 0;

  for (const t of triggers) {
    try {
      // Log the alert
      await db.financeAlertLog.create({
        data: {
          subscriptionId: t.subscriptionId,
          email: t.email,
          countyName: t.countyName,
          metric: t.metric,
          triggerValue: t.triggerValue,
          threshold: t.threshold,
          message: t.message,
        },
      });

      // Update subscription's last triggered state
      await db.financeAlertSubscription.update({
        where: { id: t.subscriptionId },
        data: {
          lastTriggeredAt: new Date(),
          lastTriggeredValue: t.triggerValue,
        },
      });

      // Send email (or log in dev)
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
      let manageLine: string;
      try {
        manageLine = `Unsubscribe: ${buildUnsubscribeUrl(t.email, t.subscriptionId)}`;
      } catch {
        // Signed links require JWT_SECRET; fall back to the manage page.
        manageLine = `Manage your subscriptions: ${baseUrl}/finance-audit`;
      }
      console.log(`\n========== FINANCE ALERT EMAIL ==========`);
      console.log(`To: ${t.email}`);
      console.log(`Subject: Kenya GovDash Alert — ${t.countyName} County`);
      console.log(`---`);
      console.log(t.message);
      console.log(`\n${manageLine}`);
      console.log(`==========================================\n`);

      triggered++;
    } catch (err) {
      console.error('Alert processing failed:', err);
      failed++;
    }
  }

  return { triggered, failed };
}
