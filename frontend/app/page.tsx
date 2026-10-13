'use client';
import { useEffect, useState } from 'react';
import Shell from '../components/Shell';
import { api, Lead } from '../lib/api';
import { Users, Zap, CheckCircle2, CalendarClock, ArrowUpRight } from 'lucide-react';
type Summary = { totalLeads:number; newLeads:number; convertedLeads:number; pendingFollowUps:number; recentLeads:Lead[] };
const initial: Summary = { totalLeads:0,newLeads:0,convertedLeads:0,pendingFollowUps:0,recentLeads:[] };
export default function Dashboard() {
  const [data,setData]=useState<Summary>(initial); const [error,setError]=useState('');
  useEffect(()=>{api<Summary>('/dashboard').then(setData).catch(e=>setError(e.message));},[]);
  const cards=[['Total leads',data.totalLeads,Users],['New inquiries',data.newLeads,Zap],['Converted',data.convertedLeads,CheckCircle2],['Pending follow-ups',data.pendingFollowUps,CalendarClock]];
  return <Shell><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon]:any)=><div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span><Icon size={19}/></div><div className="mt-3 text-3xl font-bold">{value}</div><div className="mt-2 text-xs text-slate-500">Live CRM data</div></div>)}</div>
  {error&&<div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Could not load dashboard: {error}. Is the backend running?</div>}
  <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Recent inquiries</h2><p className="text-sm text-slate-500">Latest leads received by your CRM</p></div><ArrowUpRight size={20}/></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b text-slate-500"><tr>{['Customer','Requirement','Source','Status','Received'].map(x=><th key={x} className="px-3 py-3 font-medium">{x}</th>)}</tr></thead><tbody>{data.recentLeads.map(lead=><tr key={lead.id} className="border-b last:border-0"><td className="px-3 py-4 font-medium">{lead.name}</td><td className="px-3 py-4">{lead.requirement||'—'}</td><td className="px-3 py-4">{lead.source}</td><td className="px-3 py-4">{lead.status}</td><td className="px-3 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td></tr>)}{!data.recentLeads.length&&<tr><td colSpan={5} className="px-3 py-10 text-center text-slate-500">No leads yet. Add one in Leads & Inquiries.</td></tr>}</tbody></table></div></section></Shell>;
}
