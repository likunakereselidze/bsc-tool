'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Language } from '@/types/bsc';
import { EXPORT_STAGES } from '@/types/bsc';
import { tr } from '@/lib/i18n';

const STEPS: Record<Language, string>[] = [
  { ka: 'შენი მონაცემები', en: 'Your details' },
  { ka: 'კომპანია',        en: 'Your company' },
  { ka: 'ექსპორტი',        en: 'Export stage' },
];

function NewBscForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLang: Language = searchParams.get('lang') === 'en' ? 'en' : 'ka';

  const [lang, setLang] = useState<Language>(initialLang);
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [exportStage, setExportStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validateStep(): string {
    if (step === 1) {
      if (!fullName.trim())
        return lang === 'ka' ? 'სახელი სავალდებულოა' : 'Full name is required';
      if (!email.trim() || !email.includes('@'))
        return lang === 'ka' ? 'სწორი ელ-ფოსტა სავალდებულოა' : 'Valid email is required';
    }
    if (step === 2) {
      if (!companyName.trim())
        return lang === 'ka' ? 'კომპანიის სახელი სავალდებულოა' : 'Company name is required';
    }
    return '';
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  }

  function prevStep() {
    setError('');
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  const inputClass =
    'w-full px-4 py-3 rounded-lg text-sm outline-none border border-gray-200 bg-white text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-base text-gray-900">BSC Tool</Link>
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
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all"
                    style={
                      active ? { background: '#2563eb', color: '#fff' } :
                      done   ? { background: '#059669', color: '#fff' } :
                               { background: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {done ? '✓' : n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-px transition-all"
                      style={{ background: done ? '#059669' : '#e5e7eb' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step heading */}
          <div className="mb-8">
            <p className="text-xs text-blue-600 font-medium mb-1">
              {lang === 'ka' ? `ნაბიჯი ${step}/3` : `Step ${step} of 3`}
            </p>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
              {STEPS[step - 1][lang]}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Identity */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {lang === 'ka' ? 'სახელი და გვარი' : 'Full name'}{' '}
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'ka' ? 'მაგ: ნინო მაისურაძე' : 'e.g. John Smith'}
                    className={inputClass}
                    autoComplete="name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {lang === 'ka' ? 'ელ-ფოსტა' : 'Email'}{' '}
                    <span className="text-orange-500">*</span>
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
                      : "We'll send your BSC link to this email."}
                  </p>
                </div>

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
                        style={
                          lang === l
                            ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                            : { background: '#fff', color: '#374151', borderColor: '#e5e5e5' }
                        }
                      >
                        {l === 'ka' ? 'ქართული' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Company */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {tr('onboard.company_name', lang)}{' '}
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={tr('onboard.company_name_placeholder', lang)}
                    className={inputClass}
                    autoFocus
                  />
                </div>

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
              </>
            )}

            {/* Step 3: Export stage */}
            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {tr('onboard.export_stage', lang)}
                </label>
                <select
                  value={exportStage}
                  onChange={(e) => setExportStage(e.target.value)}
                  className={inputClass}
                  autoFocus
                >
                  <option value="">{lang === 'ka' ? '— აირჩიე —' : '— Select —'}</option>
                  {EXPORT_STAGES[lang].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {lang === 'ka' ? 'უკან' : 'Back'}
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-colors"
                  style={{ background: '#2563eb' }}
                >
                  {lang === 'ka' ? 'შემდეგი' : 'Continue'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-40"
                  style={{ background: '#2563eb' }}
                >
                  {loading
                    ? (lang === 'ka' ? 'იქმნება...' : 'Creating...')
                    : (lang === 'ka' ? 'BSC-ის შექმნა' : 'Create my BSC')}
                </button>
              )}
            </div>

            <p className="text-center text-sm text-gray-400">
              {lang === 'ka' ? 'უკვე გაქვს BSC?' : 'Already have a BSC?'}{' '}
              <Link
                href={`/bsc/recover${lang === 'en' ? '?lang=en' : ''}`}
                className="text-blue-600 hover:underline"
              >
                {lang === 'ka' ? 'ლინკის მიღება' : 'Get my link'}
              </Link>
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
