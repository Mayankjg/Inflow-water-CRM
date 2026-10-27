'use client';

import { useEffect, useState } from 'react';
import Shell from '../../components/Shell';
import { api, Lead } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

const statuses = ['NEW', 'INTERESTED', 'CONTACTED', 'CONVERTED', 'LOST'];

export default function LeadsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await api<Lead[]>('/leads'));
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { void load(); }, []);
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.trim().toLowerCase()));

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function deleteLead(id: string, name: string) {
    if (!window.confirm(`Delete lead "${name}"? This action cannot be undone.`)) return;

    setDeletingId(id);
    setError('');
    try {
      await api(`/leads/${id}`, { method: 'DELETE' });
      setItems(current => current.filter(item => item.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  function openLead(id: string) { router.push(`/leads/${id}`); }

  return <Shell>
    <section className="leads-panel min-w-0">
      <div className="leads-toolbar">
        <h2 className="leads-title">All leads</h2>
        <div className="leads-actions">
          <input type="search" aria-label="Search customer name" placeholder="Search customer name..." value={search} onChange={e => setSearch(e.target.value)} className="lead-search" />
          <Link href="/leads/new" className="lead-add-button"><Plus size={17} strokeWidth={2.5} />Add Lead</Link>
        </div>
      </div>
      {error && <p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="lead-table-scroll">
        <table className="lead-table">
          <thead><tr>{['Customer', 'Company', 'City', 'State', 'Address', 'Phone / Email', 'Enquiry details', 'Source', 'Status', 'Received', ''].map((x, i) => <th key={x || `action-${i}`}>{x}</th>)}</tr></thead>
          <tbody>{filteredItems.map(x => <tr key={x.id} role="link" tabIndex={0} aria-label={`Open follow-ups and reminders for ${x.name}`} onClick={() => openLead(x.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLead(x.id); } }} className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500">
            <td className="lead-customer">{x.name}</td><td>{x.company || '—'}</td><td>{x.city || '—'}</td><td>{x.state || '—'}</td><td className="max-w-48 truncate" title={x.address || ''}>{x.address || '—'}</td><td>{x.phone || '—'}{x.email && <div className="mt-0.5 text-xs text-slate-500">{x.email}</div>}</td><td className="max-w-64 whitespace-pre-wrap" title={x.requirement || ''}>{x.requirement || '—'}</td><td>{x.source}</td>
            <td><select aria-label={`Status for ${x.name}`} value={x.status} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} onChange={e => updateStatus(x.id, e.target.value)} className="lead-status-select">{statuses.map(s => <option key={s} value={s}>{s === 'NEW' ? 'New' : s === 'INTERESTED' ? 'Interested' : s === 'CONTACTED' ? 'Contacted' : s === 'CONVERTED' ? 'Converted' : 'Lost'}</option>)}</select></td><td className="whitespace-nowrap">{new Date(x.createdAt).toLocaleDateString()}</td>
            <td><button type="button" aria-label={`Delete ${x.name}`} title="Delete lead" disabled={deletingId === x.id} onClick={e => { e.stopPropagation(); void deleteLead(x.id, x.name); }} onKeyDown={e => e.stopPropagation()} className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={17} /></button></td>
          </tr>)}{!filteredItems.length && <tr><td colSpan={11} className="lead-empty">{search.trim() ? 'No customers match that name.' : 'No leads found.'}</td></tr>}</tbody>
        </table>
      </div>
    </section>
  </Shell>;
}
