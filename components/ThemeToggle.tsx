import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('theme') === 'dark';
    setEnabled(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  if (!mounted) return null;

  return (
    <button
      className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm"
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
      }}
      aria-label="Toggle dark mode"
      title="Koyu/aydınlık modu değiştir"
    >
      {enabled ? 'Dark' : 'Light'}
    </button>
  );
}
