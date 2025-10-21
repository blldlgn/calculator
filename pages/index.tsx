import Head from 'next/head';
import { useState } from 'react';
import { ForecastForm } from '@/components/ForecastForm';
import { Results } from '@/components/Results';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { EstimateResponse } from '@/types/estimate';
import { getAnalyticsSummary } from '@/utils/analytics';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Google Ads Forecast Tool</title>
        <meta name="description" content="Estimate budget and ROI from your keywords" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <header className="sticky top-0 z-10 backdrop-blur border-b border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70">
          <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
            <div className="font-semibold">Google Ads Forecast Tool</div>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6">
          <section className="text-center py-10">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Google Ads Tahmin Aracı
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Anahtar kelimelerinize göre tahmini bütçe ve ROI hesaplayın
            </p>
          </section>

          <ForecastForm
            onSubmit={async (payload) => {
              setLoading(true);
              setError(null);
              setResult(null);
              try {
                const res = await fetch('/api/estimate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) {
                  const message = await res.text();
                  throw new Error(message || 'Failed to estimate');
                }
                const data: EstimateResponse = await res.json();
                setResult(data);
              } catch (err: any) {
                setError(err.message || 'Unknown error');
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
          />

          <div className="mt-10">
            {error && (
              <div className="p-4 rounded border border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            {result && <Results result={result} />}
          </div>

          <section className="mt-12 text-sm text-slate-500 dark:text-slate-400">
            <details>
              <summary>Local analytics (anonymous, stored in your browser)</summary>
              <pre className="mt-2 p-3 rounded bg-slate-100 dark:bg-slate-800 overflow-auto">
                {JSON.stringify(getAnalyticsSummary(), null, 2)}
              </pre>
            </details>
          </section>
        </main>
        <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Built with Next.js, Tailwind, and Google APIs
        </footer>
      </div>
    </>
  );
}
