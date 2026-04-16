'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Language } from '@/types/bsc';

function RecoverForm() {
  const searchParams = useSearchParams();
  const initialLang: Language = searchParams.get('lang') === 'en' ? 'en' : 'ka';

  const [lang, setLang] = useState<Language>(initialLang);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sessions/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), language: lang }),
      });
      if (res.status === 404) {
        setError(lang === 'ka' ? 'ამ მეილზე BSC ვერ მოიძებნა.' : 'No BSC found for this email.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error();
      setSuccess(true);
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {lang === 'ka' ? 'შეამოწმე შენი ელ-ფოსტა' : 'Check your inbox'}
              </h1>
              <p className="text-sm text-gray-500">
                {lang === 'ka'
                  ? 'შენი BSC ლინკი გამოვაგზავნეთ.'
                  : 'We sent your BSC link.'}
              </p>
              <a
                href={`/bsc/new${lang === 'en' ? '?lang=en' : ''}`}
                className="inline-block mt-4 text-sm text-blue-600 hover:underline"
              >
                {lang === 'ka' ? '← ახალი BSC-ის შექმნა' : '← Create a new BSC'}
              </a>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  {lang === 'ka' ? 'ლინკის აღდგენა' : 'Recover my BSC link'}
                </h1>
                <p className="text-sm text-gray-500">
                  {lang === 'ka'
                    ? 'შეიყვანე შენი ელ-ფოსტა და BSC ლინკს გამოვაგზავნით.'
                    : "Enter your email and we'll send you your BSC link."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoFocus
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-40"
                  style={{ background: '#2563eb' }}
                >
                  {loading
                    ? (lang === 'ka' ? 'იგზავნება...' : 'Sending...')
                    : (lang === 'ka' ? 'ლინკის გამოგზავნა' : 'Send my link')}
                </button>

                <p className="text-center text-sm text-gray-400">
                  {lang === 'ka' ? 'ჯერ არ გაქვს BSC?' : "Don't have a BSC yet?"}{' '}
                  <a
                    href={`/bsc/new${lang === 'en' ? '?lang=en' : ''}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lang === 'ka' ? 'შექმნა' : 'Create one'}
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RecoverPage() {
  return (
    <Suspense>
      <RecoverForm />
    </Suspense>
  );
}
