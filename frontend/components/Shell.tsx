'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarClock, Settings, Zap, Bell, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, Notification } from '../lib/api';
const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads & Inquiries', icon: Zap },
  { href: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { href: '/settings', label: 'Users & Settings', icon: Settings },
];
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  async function loadNotifications() { try { setNotifications(await api<Notification[]>('/notifications')); } catch { /* keep navbar usable while API is unavailable */ } }
  useEffect(() => { loadNotifications(); const timer = window.setInterval(loadNotifications, 30000); return () => window.clearInterval(timer); }, []);
  const unread = notifications.filter(item => !item.readAt).length;
  async function markRead(id: string) { await api(`/notifications/${id}/read`, { method: 'PATCH' }); await loadNotifications(); }
  async function markAllRead() { await api('/notifications/read-all', { method: 'PATCH' }); await loadNotifications(); }
  return <div className="min-h-screen md:flex">
    <aside className="w-full overflow-x-hidden bg-slate-950 p-5 text-white md:sticky md:top-0 md:h-screen md:min-h-screen md:w-64 md:shrink-0 md:self-start">
      <div className="mb-8 flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2"><Users size={22}/></div><div><div className="font-bold">CRM</div><div className="text-xs text-slate-400">Customer workspace</div></div></div>
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">{links.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${path===href?'bg-blue-600 text-white':'text-slate-300 hover:bg-slate-800'}`}><Icon size={18}/>{label}</Link>)}</nav>
      {/* <div className="mt-8 rounded-xl border border-slate-800 p-3 text-xs text-slate-400">Simple CRM starter<br/>Next.js + NestJS</div> */}
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-9"><header className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-500">Workspace / CRM</p><h1 className="text-2xl font-bold">Customer management</h1></div><div className="flex items-center gap-3"><div className="relative"><button aria-label={`${unread} unread notifications`} onClick={()=>setOpen(!open)} className="relative rounded-full border bg-white p-2.5"><Bell size={19}/>{unread>0&&<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs leading-5 text-white">{unread>99?'99+':unread}</span>}</button>{open&&<div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border bg-white p-3 shadow-xl"><div className="mb-2 flex items-center justify-between"><strong>Due notifications</strong>{unread>0&&<button onClick={markAllRead} className="text-xs text-blue-600">Mark all read</button>}</div><div className="max-h-80 space-y-2 overflow-auto">{notifications.map(item=><div key={item.id} className={`rounded-lg border p-3 ${item.readAt?'opacity-60':''}`}><div className="flex justify-between gap-2"><span className="font-medium">{item.title}</span>{!item.readAt&&<button aria-label="Mark as read" onClick={()=>markRead(item.id)}><Check size={16}/></button>}</div><div className="mt-1 text-xs text-slate-500">{item.source==='FOLLOW_UP'?'Follow-up':'Reminder'} · {new Date(item.dueAt).toLocaleString()}</div></div>)}{!notifications.length&&<p className="py-5 text-center text-sm text-slate-500">No due or overdue items.</p>}</div></div>}</div><div className="rounded-full border bg-white px-4 py-2 text-sm">Admin workspace</div></div></header>{children}</main>
  </div>;
}
