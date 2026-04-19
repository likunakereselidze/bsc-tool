import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function getAllSessions() {
  const res = await pool.query(`
    SELECT
      id, full_name, email, company_name, industry, export_stage,
      language, paid_tier, ai_generations_used,
      created_at, updated_at,
      (SELECT COUNT(*) FROM bsc_objectives WHERE session_id = s.id) AS obj_count,
      (SELECT COUNT(*) FROM bsc_kpis k JOIN bsc_objectives o ON o.id = k.objective_id WHERE o.session_id = s.id) AS kpi_count
    FROM bsc_sessions s
    ORDER BY created_at DESC
  `);
  return res.rows;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}) {
  const { pw } = await searchParams;
  const cookieStore = await cookies();
  const authed = cookieStore.get('admin_authed')?.value === '1' || pw === ADMIN_PASSWORD;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <form action="/admin" method="get" className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm space-y-4">
          <h1 className="text-lg font-bold text-gray-900">Admin</h1>
          <input
            name="pw"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: '#2563eb' }}
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  const sessions = await getAllSessions();
  const totalWithEmail = sessions.filter((s) => s.email).length;
  const totalPaid = sessions.filter((s) => s.paid_tier).length;
  const totalAiUsed = sessions.filter((s) => s.ai_generations_used > 0).length;

  const STAGE_LABELS: Record<string, string> = {
    pre_export: 'Pre-Export',
    first_export: 'First Export',
    active_export: 'Active',
    scaling: 'Scaling',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Leads & Sessions</h1>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">&larr; Site</a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total sessions', value: sessions.length },
            { label: 'With email', value: totalWithEmail },
            { label: 'Used AI', value: totalAiUsed },
            { label: 'Paid', value: totalPaid },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm border-collapse" style={{ minWidth: 900 }}>
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Email', 'Company', 'Industry', 'Stage', 'Lang', 'Obj', 'KPI', 'AI', 'Paid', 'Created'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    <a href={`/bsc/${s.id}`} className="hover:text-blue-600 transition-colors">
                      {s.full_name || <span className="text-gray-300">—</span>}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.email
                      ? <a href={`mailto:${s.email}`} className="hover:text-blue-600">{s.email}</a>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{s.company_name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.industry || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {s.export_stage ? STAGE_LABELS[s.export_stage] || s.export_stage : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 uppercase text-xs">{s.language}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{s.obj_count}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{s.kpi_count}</td>
                  <td className="px-4 py-3 text-center">
                    {s.ai_generations_used > 0
                      ? <span className="text-purple-600 font-semibold">{s.ai_generations_used}</span>
                      : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.paid_tier
                      ? <span className="text-green-600 font-semibold">✓</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No sessions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
