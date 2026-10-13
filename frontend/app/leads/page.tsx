'use client';

import { FormEvent, useEffect, useState } from 'react';
import Shell from '../../components/Shell';
import { api, Lead } from '../../lib/api';

const statuses = ['NEW', 'INTERESTED', 'CONTACTED', 'CONVERTED', 'LOST'];
const emptyForm = { name: '', company: '', address: '', phone: '', email: '', requirement: '', source: 'MANUAL' };

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      setItems(await api<Lead[]>('/leads'));
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/leads', { method: 'POST', body: JSON.stringify(form) });
      setForm({ ...emptyForm });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-blue-500';
  const labelClass = 'block min-w-0 text-sm font-medium';

  return <Shell>
    <div className="grid min-w-0 gap-6">
      <section className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">Add inquiry</h2>
        <p className="mb-5 text-sm text-slate-500">Record a lead manually or receive one through an approved integration.</p>
        <form onSubmit={submit} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>Customer name<input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} /></label>
          <label className={labelClass}>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} /></label>
          <label className={labelClass}>Company name<input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={inputClass} /></label>
          <label className={labelClass}>Mobile no<input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} /></label>
          <label className={`${labelClass} sm:col-span-2`}>Address<textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className={inputClass} /></label>
          <label className={labelClass}>Requirement<input type="text" value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} className={inputClass} /></label>
          <label className={labelClass}>Source<select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className={inputClass}><option value="MANUAL">Manual</option><option value="JUSTDIAL">Justdial</option><option value="WEBSITE">Website</option><option value="REFERRAL">Referral</option><option value="OTHER">Other</option></select></label>
          <div className="flex justify-end sm:col-span-2"><button disabled={busy} className="w-full rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white disabled:opacity-50 sm:w-auto">{busy ? 'Saving...' : 'Save inquiry'}</button></div>
        </form>
      </section>

      <section className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">All leads</h2>
        {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b text-slate-500"><tr>{['Customer', 'Company', 'Address', 'Phone', 'Requirement', 'Source', 'Status'].map(x => <th key={x} className="px-2 py-3 font-medium">{x}</th>)}</tr></thead>
            <tbody>{items.map(x => <tr key={x.id} className="border-b last:border-0">
              <td className="px-2 py-3 font-medium">{x.name}</td><td className="px-2 py-3">{x.company || '—'}</td><td className="max-w-48 truncate px-2 py-3" title={x.address || ''}>{x.address || '—'}</td><td className="px-2 py-3">{x.phone || '—'}</td><td className="px-2 py-3">{x.requirement || '—'}</td><td className="px-2 py-3">{x.source}</td>
              <td className="px-2 py-3"><select aria-label={`Status for ${x.name}`} value={x.status} onChange={e => updateStatus(x.id, e.target.value)} className="rounded-lg border p-2">{statuses.map(s => <option key={s} value={s}>{s === 'NEW' ? 'New' : s === 'INTERESTED' ? 'Interested' : s === 'CONTACTED' ? 'Contacted' : s === 'CONVERTED' ? 'Converted' : 'Lost'}</option>)}</select></td>
            </tr>)}{!items.length && <tr><td colSpan={7} className="px-2 py-10 text-center text-slate-500">No leads found.</td></tr>}</tbody>
          </table>
        </div>
      </section>
    </div>
  </Shell>;
}
