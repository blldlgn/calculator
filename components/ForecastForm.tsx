import { useMemo, useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import type { EstimateRequest } from '@/types/estimate';

export function ForecastForm({
  onSubmit,
  loading,
}: {
  onSubmit: (payload: EstimateRequest) => Promise<void>;
  loading: boolean;
}) {
  const [keywords, setKeywords] = useState('');
  const [cpc, setCpc] = useState<number>(2);
  const [monthlyClicks, setMonthlyClicks] = useState<number>(500);
  const [conversionRate, setConversionRate] = useState<number>(3);
  const [roas, setRoas] = useState<number>(4);
  const [months, setMonths] = useState<number>(3);

  const disabled = useMemo(() => {
    if (loading) return true;
    if (cpc <= 0 || monthlyClicks <= 0 || conversionRate <= 0 || roas <= 0 || months <= 0) {
      return true;
    }
    return false;
  }, [loading, cpc, monthlyClicks, conversionRate, roas, months]);

  return (
    <form
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        const payload: EstimateRequest = {
          keywords: keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          targetCpc: cpc,
          estimatedMonthlyClicks: monthlyClicks,
          conversionRatePct: conversionRate,
          targetRoas: roas,
          campaignMonths: months,
        };
        trackEvent('calculate_click', payload);
        void onSubmit(payload);
      }}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium">Keywords</label>
        <input
          type="text"
          placeholder="shoes, running shoes"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 bg-white dark:bg-slate-800"
          title="Anahtar kelimelerinizi virgülle ayırarak girin"
        />
        <p className="text-xs text-slate-500" title="Tahminleri daha gerçekçi kılar">Türkçe ipucu: Anahtar kelimeleri doğru seçmek sonuçları etkiler.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Target CPC (TL)</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={cpc}
          onChange={(e) => setCpc(parseFloat(e.target.value))}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 bg-white dark:bg-slate-800"
          title="Hedef tıklama başı maliyet (1-5 TL aralığı önerilir)"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Estimated Monthly Clicks</label>
        <input
          type="number"
          min={1}
          step={1}
          value={monthlyClicks}
          onChange={(e) => setMonthlyClicks(parseInt(e.target.value))}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 bg-white dark:bg-slate-800"
          title="Aylık beklenen tıklama sayısı (100-1000 aralığı)"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Conversion Rate (%)</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={conversionRate}
          onChange={(e) => setConversionRate(parseFloat(e.target.value))}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 bg-white dark:bg-slate-800"
          title="Dönüşüm oranı yüzdesi (2-5%)"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Target ROAS (x)</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={roas}
          onChange={(e) => setRoas(parseFloat(e.target.value))}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 bg-white dark:bg-slate-800"
          title="Hedef reklam harcaması getirisi (ör. 4x)"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Campaign Duration (months)</label>
        <select
          value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 bg-white dark:bg-slate-800"
          title="Kampanya süresi: 1-12 ay arası"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={disabled}
          className="h-[42px] px-5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Hesapla: Backend'e istek atar ve sonuçları gösterir"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>
    </form>
  );
}
