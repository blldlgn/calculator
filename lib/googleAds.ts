import { GoogleAdsApi } from 'google-ads-api';

export type KeywordIdea = {
  keyword: string;
  avgMonthlySearches?: number;
  avgCpc?: number; // TL
  estimatedClicks?: number;
};

export function hasGoogleAdsEnv(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
      process.env.GOOGLE_ADS_CLIENT_ID &&
      process.env.GOOGLE_ADS_CLIENT_SECRET &&
      process.env.GOOGLE_ADS_REFRESH_TOKEN &&
      process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID &&
      process.env.GOOGLE_ADS_CUSTOMER_ID,
  );
}

export async function fetchKeywordIdeas(keywords: string[]): Promise<KeywordIdea[]> {
  if (!hasGoogleAdsEnv()) {
    throw new Error('Missing Google Ads credentials');
  }

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    // OAuth client credentials are usually configured on client level in v16 via setOptions or env
    // The library reads GOOGLE_ADS_CLIENT_ID/SECRET from env by default when using refresh token
  });

  // The official client exposes services via customer, but we're simulating KeywordPlanIdeaService via GAQL for ideas
  // This call may require proper permissions; wrap in try/catch and fallback outside
  try {
    // The official client exposes KeywordPlanIdeaService via customer.keywordPlans.generateKeywordIdeas or via service call
    // Use searchStream GAQL fallback to approximate CPC from historical metrics if ideas API not available
    if (typeof (customer as any).keywordPlans?.generateKeywordIdeas === 'function') {
      const response = await (customer as any).keywordPlans.generateKeywordIdeas({
        customerId: process.env.GOOGLE_ADS_CUSTOMER_ID!,
        keywordSeed: { keywords },
      });
      const ideas: KeywordIdea[] = [];
      for (const row of response) {
        const keyword = row?.text ?? 'keyword';
        const avgMonthlySearches = Number(row?.keyword_idea_metrics?.avg_monthly_searches ?? 0);
        const microCpc = Number(row?.keyword_idea_metrics?.average_cpc_micros ?? 0);
        const avgCpc = microCpc / 1_000_000;
        ideas.push({ keyword, avgMonthlySearches, avgCpc, estimatedClicks: Math.round(avgMonthlySearches * 0.05) });
      }
      return ideas;
    }

    // Fallback GAQL via customer.query
    const gaql = `
      SELECT
        metrics.average_cpc,
        metrics.clicks
      FROM keyword_view
      WHERE segments.keyword.info.text IN (${keywords
        .map((k) => `'${k.replace(/'/g, "\\'")}'`)
        .join(', ')})
      LIMIT 50
    `;

    const rows = await (customer as any).query(gaql);
    const ideas: KeywordIdea[] = [];
    for (const row of rows || []) {
      const avgCpc = Number((row as any)?.metrics?.average_cpc ?? 0) / 1_000_000;
      const estimatedClicks = Number((row as any)?.metrics?.clicks ?? 0);
      ideas.push({ keyword: 'keyword', avgCpc, estimatedClicks });
    }
    return ideas;
  } catch (err) {
    throw new Error('Google Ads API error');
  }
}
