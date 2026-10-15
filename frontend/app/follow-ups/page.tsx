'use client';
import { FormEvent, useEffect, useState } from 'react';
import Shell from '../../components/Shell';
import { api, FollowUp, Lead, Reminder } from '../../lib/api';

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', dueAt: '', notes: '', leadId: '' });
  const [reminderForm, setReminderForm] = useState({ title: '', dueAt: '' });
  const [editing, setEditing] = useState<{ id: string; kind: 'follow-up' | 'reminder' } | null>(null);
  const [editForm, setEditForm] = useState({ title: '', dueAt: '' });
  async function load() {
    try {
      const [f, l, r] = await Promise.all([api<FollowUp[]>('/follow-ups'), api<Lead[]>('/leads'), api<Reminder[]>('/reminders')]);
      setItems(f); setLeads(l); setReminders(r); setError('');
    } catch (e) { setError((e as Error).message); }
  }
  useEffect(() => { load(); }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try { await api('/follow-ups', { method: 'POST', body: JSON.stringify({ ...form, dueAt: new Date(form.dueAt).toISOString(), leadId: form.leadId || undefined }) }); setForm({ title: '', dueAt: '', notes: '', leadId: '' }); await load(); }
    catch (e) { setError((e as Error).message); }
  }
  async function createReminder(e: FormEvent) {
    e.preventDefault();
    try { await api('/reminders', { method: 'POST', body: JSON.stringify({ ...reminderForm, dueAt: new Date(reminderForm.dueAt).toISOString() }) }); setReminderForm({ title: '', dueAt: '' }); await load(); }
    catch (e) { setError((e as Error).message); }
  }
  async function complete(path: string) { try { await api(path, { method: 'PATCH' }); await load(); } catch (e) { setError((e as Error).message); } }
  const dateInput = (value: string) => new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  function startEdit(item: FollowUp | Reminder, kind: 'follow-up' | 'reminder') { setEditing({ id: item.id, kind }); setEditForm({ title: item.title, dueAt: dateInput(item.dueAt) }); }
  async function saveEdit() {
    if (!editing) return;
    const path = editing.kind === 'follow-up' ? `/follow-ups/${editing.id}` : `/reminders/${editing.id}`;
    try { await api(path, { method: 'PATCH', body: JSON.stringify({ ...editForm, dueAt: new Date(editForm.dueAt).toISOString() }) }); setEditing(null); await load(); }
    catch (e) { setError((e as Error).message); }
  }
  function editFields(itemId: string, kind: 'follow-up' | 'reminder') {
    return editing?.id === itemId && editing.kind === kind ? <div className="mt-3 space-y-2"><input aria-label="Title" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-lg border px-3 py-2"/><input aria-label="Date and time" type="datetime-local" value={editForm.dueAt} onChange={e => setEditForm({ ...editForm, dueAt: e.target.value })} className="w-full rounded-lg border px-3 py-2"/><div className="flex gap-2"><button onClick={saveEdit} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">Save</button><button onClick={() => setEditing(null)} className="rounded-lg border px-3 py-2 text-sm">Cancel</button></div></div> : null;
  }
  return <Shell><div className="space-y-6">{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-semibold">Schedule follow-up</h2><form onSubmit={submit} className="space-y-3"><label className="block text-sm">Task title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><label className="block text-sm">Due date/time<input required type="datetime-local" value={form.dueAt} onChange={e => setForm({ ...form, dueAt: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><label className="block text-sm">Related lead<select value={form.leadId} onChange={e => setForm({ ...form, leadId: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="">No linked lead</option>{leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label><label className="block text-sm">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><button className="w-full rounded-lg bg-blue-600 p-2.5 font-semibold text-white">Create follow-up</button></form></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-semibold">Create reminder</h2><form onSubmit={createReminder} className="space-y-3"><label className="block text-sm">Title<input required maxLength={160} value={reminderForm.title} onChange={e => setReminderForm({ ...reminderForm, title: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><label className="block text-sm">Date/time<input required type="datetime-local" value={reminderForm.dueAt} onChange={e => setReminderForm({ ...reminderForm, dueAt: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><button className="w-full rounded-lg bg-blue-600 p-2.5 font-semibold text-white">Create reminder</button></form></section>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-semibold">Follow-ups</h2><div className="space-y-3">{items.map(f => <div key={f.id} className="rounded-xl border p-4"><div className="font-semibold">{f.title}</div><div className="mt-1 text-sm text-slate-500">{f.lead?.name || 'No lead linked'} · {new Date(f.dueAt).toLocaleString()}</div>{f.notes && <p className="mt-1 text-sm">{f.notes}</p>}<div className="mt-1 text-xs">{f.status}</div>{f.status === 'PENDING' && <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => complete(`/follow-ups/${f.id}/complete`)} className="rounded-lg border px-3 py-2 text-sm">Mark complete</button><button onClick={() => startEdit(f, 'follow-up')} className="rounded-lg border px-3 py-2 text-sm">Reschedule / edit</button></div>}{editFields(f.id, 'follow-up')}</div>)}{!items.length && <p className="py-8 text-center text-sm text-slate-500">No follow-ups yet.</p>}</div></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-semibold">Reminders</h2><div className="space-y-3">{reminders.map(r => <div key={r.id} className="rounded-xl border p-4"><div className="font-semibold">{r.title}</div><div className="mt-1 text-sm text-slate-500">{new Date(r.dueAt).toLocaleString()}</div><div className="mt-1 text-xs">{r.status}</div>{r.status === 'PENDING' && <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => complete(`/reminders/${r.id}/complete`)} className="rounded-lg border px-3 py-2 text-sm">Mark complete</button><button onClick={() => startEdit(r, 'reminder')} className="rounded-lg border px-3 py-2 text-sm">Edit / reschedule</button></div>}{editFields(r.id, 'reminder')}</div>)}{!reminders.length && <p className="py-8 text-center text-sm text-slate-500">No reminders yet.</p>}</div></section>
    </div>
  </div></Shell>;
}
