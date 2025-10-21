import type { NextApiRequest, NextApiResponse } from 'next';
import type { EstimateRequest, EstimateResponse, MonthlyBreakdown } from '@/types/estimate';
import { fetchKeywordIdeas, hasGoogleAdsEnv } from '@/lib/googleAds';
import fallbackData from '@/data/fallback.json';

function validate(req: any): req is EstimateRequest {
  if (!req) return false;
  if (!Array.isArray(req.keywords)) return false;
  if (typeof req.targetCpc !== 'number' || req.targetCpc <= 0) return false;
  if (typeof req.estimatedMonthlyClicks !== 'number' || req.estimatedMonthlyClicks <= 0) return false;
  if (typeof req.conversionRatePct !== 'number' || req.conversionRatePct <= 0) return false;
  if (typeof req.targetRoas !== 'number' || req.targetRoas <= 0) return false;
  if (typeof req.campaignMonths !== 'number' || req.campaignMonths <= 0) return false;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EstimateResponse | { error: string }>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as EstimateRequest;
  if (!validate(body)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { keywords, targetCpc, estimatedMonthlyClicks, conversionRatePct, targetRoas, campaignMonths } = body;

  try {
    let usedApi = false;
    let effectiveCpc = targetCpc;
    let effectiveMonthlyClicks = estimatedMonthlyClicks;

    if (keywords.length > 0) {
      try {
        if (hasGoogleAdsEnv()) {
          const ideas = await fetchKeywordIdeas(keywords);
          // average over provided ideas
          if (ideas.length > 0) {
            const avgCpc = ideas.reduce((sum, k) => sum + (k.avgCpc ?? targetCpc), 0) / ideas.length;
            const avgClicks = ideas.reduce((sum, k) => sum + (k.estimatedClicks ?? 0), 0) / ideas.length;
            if (avgCpc > 0) effectiveCpc = avgCpc;
            if (avgClicks > 0) effectiveMonthlyClicks = avgClicks;
            usedApi = true;
          }
        } else {
          // fallback to local data
          for (const k of keywords) {
            const f = (fallbackData as any).keywords[k.toLowerCase()];
            if (f) {
              effectiveCpc = f.avgCpc;
              effectiveMonthlyClicks = f.estimatedClicks;
              break;
            }
          }
        }
      } catch (err: any) {
        // API error: fall back to local sample data
        for (const k of keywords) {
          const f = (fallbackData as any).keywords[k.toLowerCase()];
          if (f) {
            effectiveCpc = f.avgCpc;
            effectiveMonthlyClicks = f.estimatedClicks;
            break;
          }
        }
      }
    }

    const monthlySpend = effectiveMonthlyClicks * effectiveCpc;
    const totalSpend = monthlySpend * campaignMonths;
    const totalRevenue = totalSpend * targetRoas;
    const roiPct = ((totalRevenue - totalSpend) / totalSpend) * 100;

    const monthlyBreakdown: MonthlyBreakdown[] = Array.from({ length: campaignMonths }).map((_, i) => ({
      month: i + 1,
      spend: monthlySpend,
      revenue: monthlySpend * targetRoas,
    }));

    const estimatedCpc = effectiveCpc;
    const estimatedCpm = effectiveCpc * 1000 * (1 / (effectiveMonthlyClicks || 1));

    return res.status(200).json({
      totalSpend,
      totalRevenue,
      roiPct,
      estimatedCpc,
      estimatedCpm,
      monthlyBreakdown,
      usedApi,
      notes: usedApi ? undefined : 'Used fallback sample data when API not available',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
