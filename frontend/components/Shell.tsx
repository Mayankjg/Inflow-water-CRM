'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarClock, Settings, Zap } from 'lucide-react';
const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads & Inquiries', icon: Zap },
  { href: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { href: '/settings', label: 'Users & Settings', icon: Settings },
];
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="min-h-screen md:flex">
    <aside className="w-full overflow-x-hidden bg-slate-950 p-5 text-white md:min-h-screen md:w-64">
      <div className="mb-8 flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2"><Users size={22}/></div><div><div className="font-bold">CRM</div><div className="text-xs text-slate-400">Customer workspace</div></div></div>
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">{links.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${path===href?'bg-blue-600 text-white':'text-slate-300 hover:bg-slate-800'}`}><Icon size={18}/>{label}</Link>)}</nav>
      {/* <div className="mt-8 rounded-xl border border-slate-800 p-3 text-xs text-slate-400">Simple CRM starter<br/>Next.js + NestJS</div> */}
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-9"><header className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-500">Workspace / CRM</p><h1 className="text-2xl font-bold">Customer management</h1></div><div className="rounded-full border bg-white px-4 py-2 text-sm">Admin workspace</div></header>{children}</main>
  </div>;
}
