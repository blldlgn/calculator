import type { EstimateResponse } from '@/types/estimate';

export function downloadCsv(result: EstimateResponse) {
  const headers = ['Metric', 'Value'];
  const rows: string[][] = [
    ['Estimated Spend (Total)', String(result.totalSpend)],
    ['Estimated Revenue (Total)', String(result.totalRevenue)],
    ['ROI (%)', String(result.roiPct)],
    ['Estimated CPC', String(result.estimatedCpc)],
    ['Estimated CPM', String(result.estimatedCpm)],
  ];

  const monthlyHeaders = ['Month', 'Spend', 'Revenue'];
  const monthlyRows = result.monthlyBreakdown.map((m) => [String(m.month), String(m.spend), String(m.revenue)]);

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    '',
    monthlyHeaders.join(','),
    ...monthlyRows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'google-ads-forecast.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
