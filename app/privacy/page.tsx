export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="text-sm text-blue-600 hover:underline mb-8 block">&larr; BSC Tool</a>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm text-gray-700 space-y-8">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who we are</h2>
            <p>This BSC Tool is operated by Digital Export Manager, a service of Lia Kereselidze. Contact: <a href="mailto:likunakereselidze@gmail.com" className="text-blue-600">likunakereselidze@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. What data we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Company name, industry, and export stage you enter</li>
              <li>Strategic objectives, KPIs, and initiatives you create</li>
              <li>Email and name (when provided at registration)</li>
              <li>Usage data: which features you use, when you last used the tool</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> collect payment card data directly — payments are processed by a third-party payment provider.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the BSC Tool</li>
              <li>To generate AI-powered content using your company context (sent to Anthropic API — see below)</li>
              <li>To contact you about your account or new features (only if you provided your email)</li>
              <li>To understand usage patterns and improve the product</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. AI generation</h2>
            <p>When you use the &ldquo;Generate with AI&rdquo; feature, your company name, industry, and export stage are sent to Anthropic&apos;s Claude API to generate strategic content. Anthropic&apos;s privacy policy applies to this data. We do not send your objectives, KPIs, or financial data to any AI service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data storage</h2>
            <p>Your data is stored on a secure server in the European Union. We retain your data for as long as your account is active. You can request deletion at any time by emailing us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Sharing with third parties</h2>
            <p>We do not sell your data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Anthropic</strong> — for AI generation (company name, industry, stage only)</li>
              <li><strong>Payment provider</strong> — for processing payments (name, email, transaction data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your rights</h2>
            <p>You have the right to access, correct, or delete your data at any time. Email us at <a href="mailto:likunakereselidze@gmail.com" className="text-blue-600">likunakereselidze@gmail.com</a> and we will respond within 5 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Cookies</h2>
            <p>We use only essential session cookies required to keep you logged in. We do not use tracking or advertising cookies.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
