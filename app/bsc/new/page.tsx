'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Language } from '@/types/bsc';
import { EXPORT_STAGES } from '@/types/bsc';
import { tr } from '@/lib/i18n';

function NewBscForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLang: Language = searchParams.get('lang') === 'en' ? 'en' : 'ka';

  const [lang, setLang] = useState<Language>(initialLang);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [exportStage, setExportStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !companyName.trim()) {
      setError(tr('error.required', lang));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          company_name: companyName.trim(),
          industry: industry.trim() || undefined,
          export_stage: exportStage || undefined,
          language: lang,
        }),
      });
      if (!res.ok) throw new Error();
      const session = await res.json();
      router.push(`/bsc/${session.id}?step=table`);
    } catch {
      setError(lang === 'ka' ? 'შეცდომა. სცადე თავიდან.' : 'Error. Please try again.');
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm outline-none border border-gray-200 bg-white text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-semibold text-base text-gray-900">BSC Tool</a>
          <button
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-4 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50"
          >
            {lang === 'ka' ? 'EN' : 'GE'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((n, i) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={n === 1
                    ? { background: '#2563eb', color: '#fff' }
                    : { background: '#f3f4f6', color: '#9ca3af' }
                  }
                >
                  {n}
                </div>
                {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              {tr('onboard.title', lang)}
            </h1>
            <p className="text-sm text-gray-500">
              {lang === 'ka' ? 'შემდეგ ნაბიჯზე გადახვალ BSC ბილდერში.' : "Next you'll enter the BSC builder."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {lang === 'ka' ? 'სახელი და გვარი' : 'Full name'} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={lang === 'ka' ? 'მაგ: ნინო მაისურაძე' : 'e.g. John Smith'}
                className={inputClass}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {lang === 'ka' ? 'ელ-ფოსტა' : 'Email'} <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'ka' ? 'შენი@ელფოსტა.ge' : 'you@example.com'}
                className={inputClass}
                autoComplete="email"
              />
              <p className="text-xs text-gray-400 mt-1">
                {lang === 'ka'
                  ? 'შენი BSC-ის ლინკი ამ მეილზე გამოვაგზავნით.'
                  : 'We\'ll send your BSC link to this email.'}
              </p>
            </div>

            {/* Language toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tr('onboard.language', lang)}
              </label>
              <div className="flex gap-2">
                {(['ka', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all border"
                    style={lang === l
                      ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                      : { background: '#fff', color: '#374151', borderColor: '#e5e5e5' }
                    }
                  >
                    {l === 'ka' ? 'ქართული' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* Company name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {tr('onboard.company_name', lang)} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={tr('onboard.company_name_placeholder', lang)}
                className={inputClass}
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {tr('onboard.industry', lang)}
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder={tr('onboard.industry_placeholder', lang)}
                className={inputClass}
              />
            </div>

            {/* Export stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {tr('onboard.export_stage', lang)}
              </label>
              <select
                value={exportStage}
                onChange={(e) => setExportStage(e.target.value)}
                className={inputClass}
              >
                <option value="">{lang === 'ka' ? '— აირჩიე —' : '— Select —'}</option>
                {EXPORT_STAGES[lang].map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !fullName.trim() || !email.trim() || !companyName.trim()}
              className="w-full py-3 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: '#2563eb' }}
            >
              {loading
                ? (lang === 'ka' ? 'იქმნება...' : 'Creating...')
                : (lang === 'ka' ? 'შემდეგი' : 'Continue')}
            </button>

            <p className="text-center text-sm text-gray-400">
              {lang === 'ka' ? 'უკვე გაქვს BSC?' : 'Already have a BSC?'}{' '}
              <a href={`/bsc/recover${lang === 'en' ? '?lang=en' : ''}`} className="text-blue-600 hover:underline">
                {lang === 'ka' ? 'ლინკის მიღება' : 'Get my link'}
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NewBscPage() {
  return (
    <Suspense>
      <NewBscForm />
    </Suspense>
  );
}
