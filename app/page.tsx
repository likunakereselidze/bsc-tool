import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className="font-semibold text-base text-gray-900">BSC Tool</span>
          <div className="flex items-center gap-3">
            <Link
              href="/bsc/new?lang=en"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-4 py-2"
            >
              English
            </Link>
            <Link
              href="/bsc/new"
              className="text-sm font-medium text-white px-5 py-2 rounded-full transition-colors hover:opacity-90"
              style={{ background: '#2563eb' }}
            >
              დაწყება
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1 rounded-full"
            style={{ background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}
          >
            უფასო &bull; Free
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight text-gray-900 mb-6 max-w-2xl mx-auto">
            Export Balanced Scorecard
            <br />
            <span style={{ color: '#f97316' }}>20 წუთში</span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-10">
            Build your export department&apos;s strategic plan — objectives, KPIs, initiatives, and strategy map.
            GEC charges 40–50K GEL for this. You pay nothing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/bsc/new"
              className="text-base font-medium text-white px-7 py-3 rounded-full transition-colors"
              style={{ background: '#2563eb' }}
            >
              BSC-ის შექმნა
            </Link>
            <Link
              href="/bsc/new?lang=en"
              className="text-base font-medium text-gray-700 px-7 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Create in English
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Features */}
        <section className="max-w-5xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: '4 Perspectives',
                title_ka: '4 პერსპექტივა',
                desc_ka: 'ფინანსური, კლიენტი, შიდა პროცესები, სწავლა და ზრდა',
                desc: 'Financial, Customer, Internal Processes, Learning & Capacity',
              },
              {
                title: 'KPIs & Initiatives',
                title_ka: 'KPI და ინიციატივები',
                desc_ka: 'სამიზნეები, ვადები, პასუხისმგებელი პირები',
                desc: 'Targets, deadlines, owners — structured per objective',
              },
              {
                title: 'Shareable Link',
                title_ka: 'პირადი ლინკი',
                desc_ka: 'შეინახე და გააზიარე. რეგისტრაცია არ სჭირდება.',
                desc: 'UUID-based link. No account needed. Save and share.',
              },
            ].map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="w-8 h-0.5 mb-4" style={{ background: '#f97316' }} />
                <h3 className="font-semibold text-gray-900 text-base">{f.title_ka}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc_ka}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Pricing tiers */}
        <section className="max-w-5xl mx-auto px-8 py-20">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-12 text-center">სამი ეტაპი</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                tier: 'უფასო',
                price: '0 GEL',
                desc: 'სრული BSC — მიზნები, KPI, ინიციატივები, სტრატეგიული რუქა',
                cta: 'დაწყება',
                href: '/bsc/new',
                primary: false,
              },
              {
                tier: 'სამოქმედო გეგმა',
                price: '150–500 GEL',
                desc: 'AI-გენერირებული 90-დღიანი გეგმა, დავალებები, PDF ანგარიში',
                cta: 'მალე',
                href: '#',
                primary: true,
              },
              {
                tier: 'კონსულტაცია',
                price: '1,500–3,000 GEL',
                desc: '3–4 სესია ლიასთან — BSC-ის განხილვა, დავალიდება, გეგმა',
                cta: 'დაკავშირება',
                href: '#',
                primary: false,
              },
            ].map((t) => (
              <div
                key={t.tier}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  border: t.primary ? '1.5px solid #2563eb' : '1px solid #e5e5e5',
                  background: t.primary ? '#eff6ff' : '#fff',
                }}
              >
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{t.tier}</p>
                  <p className="text-2xl font-bold text-gray-900">{t.price}</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{t.desc}</p>
                <Link
                  href={t.href}
                  className="text-sm font-medium px-5 py-2.5 rounded-full text-center transition-colors"
                  style={t.primary
                    ? { background: '#2563eb', color: '#fff' }
                    : { background: 'transparent', color: '#374151', border: '1px solid #e5e5e5' }
                  }
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-8 text-center text-xs text-gray-400">
          Digital Export Manager &mdash; Lia Kereselidze
        </div>
      </footer>
    </div>
  );
}
