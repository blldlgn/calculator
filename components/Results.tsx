import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EstimateResponse } from '@/types/estimate';
import { downloadCsv } from '@/utils/csv';

export function Results({ result }: { result: EstimateResponse }) {
  const chartData = useMemo(() => {
    return result.monthlyBreakdown.map((m) => ({
      name: `Month ${m.month}`,
      spend: m.spend,
      revenue: m.revenue,
    }));
  }, [result.monthlyBreakdown]);

  return (
    <div className="grid gap-8">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-3 py-2 text-left">Metric</th>
              <th className="px-3 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2">Estimated Spend (Total)</td>
              <td className="px-3 py-2 text-right">{result.totalSpend.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Estimated Revenue (Total)</td>
              <td className="px-3 py-2 text-right">{result.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">ROI (%)</td>
              <td className="px-3 py-2 text-right">{result.roiPct.toFixed(2)}%</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Estimated CPC</td>
              <td className="px-3 py-2 text-right">{result.estimatedCpc.toFixed(2)} TL</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Estimated CPM</td>
              <td className="px-3 py-2 text-right">{result.estimatedCpm.toFixed(2)} TL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-700"
          onClick={() => downloadCsv(result)}
          title="Sonuçları CSV olarak indir"
        >
          Export CSV
        </button>
        <form method="post" action="/api/export">
          <input type="hidden" name="payload" value={encodeURIComponent(JSON.stringify(result))} />
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            title="Looker Studio için Google Sheets'e gönderin. İpucu: Looker Studio'da yeni bir rapor oluşturun ve Sheets bağlayıcısını ekleyin."
          >
            Send to Looker Studio (Sheets)
          </button>
        </form>
      </div>
    </div>
  );
}
