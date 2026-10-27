'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../../../components/Shell';
import { api } from '../../../lib/api';

const emptyForm = { name: '', company: '', address: '', city: '', state: '', phone: '', email: '', requirement: '', source: 'MANUAL' };

export default function AddLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputClass = 'mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-blue-500';
  const labelClass = 'block min-w-0 text-sm font-medium';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/leads', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          company: form.company.trim() || undefined,
          email: form.email.trim() || undefined,
        }),
      });
      router.push('/leads');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }

  return <Shell>
    <section className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Add Lead</h2><p className="text-sm text-slate-500">Enter the lead details and save.</p></div><Link href="/leads" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50">All Leads</Link></div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>Customer name<input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} /></label>
        <label className={labelClass}>Email (optional)<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} /></label>
        <label className={labelClass}>Company name (optional)<input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={inputClass} /></label>
        <label className={labelClass}>Mobile no<input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} /></label>
        <label className={labelClass}>City<input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass} /></label>
        <label className={labelClass}>State<input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inputClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Address<textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className={inputClass} /></label>
        <label className={labelClass}>Requirement<input type="text" value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} className={inputClass} /></label>
        <label className={labelClass}>Source<select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className={inputClass}><option value="MANUAL">Manual</option><option value="JUSTDIAL">Justdial</option><option value="WEBSITE">Website</option><option value="REFERRAL">Referral</option><option value="OTHER">Other</option></select></label>
        <div className="flex justify-end gap-3 sm:col-span-2"><Link href="/leads" className="rounded-lg border px-5 py-2.5 font-medium">Cancel</Link><button disabled={busy} className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save Lead'}</button></div>
      </form>
    </section>
  </Shell>;
}
