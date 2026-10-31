'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

type AuthResult = { accessToken: string };

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get('registered') === '1');
    api<{ registrationOpen: boolean }>('/auth/status').then(x => setRegistrationOpen(x.registrationOpen)).catch(() => {});
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const result = await api<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      localStorage.setItem('inflow_admin_token', result.accessToken);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    }
  }

  return <main className="relative isolate flex h-[100dvh] items-center overflow-hidden bg-[#071b2b] px-4 py-3 text-white sm:px-8 sm:py-5 lg:py-6">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-[110px]" />
      <div className="absolute -right-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-400/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(28,107,127,0.2),transparent_58%),linear-gradient(135deg,#071b2b_0%,#0a2637_55%,#092b35_100%)]" />
      <svg className="absolute inset-x-0 bottom-0 h-[42%] w-full opacity-50" viewBox="0 0 1440 420" preserveAspectRatio="none" fill="none">
        <path d="M0 220C180 160 270 315 470 260C690 200 760 90 990 150C1190 202 1280 300 1440 220V420H0V220Z" fill="url(#waterA)" />
        <path d="M0 290C180 230 300 360 520 315C740 270 840 180 1030 220C1210 258 1310 355 1440 292V420H0V290Z" fill="url(#waterB)" />
        <path d="M-30 256C160 196 292 345 500 292C710 239 800 134 1008 187C1197 235 1308 325 1470 252" stroke="rgba(156,244,229,0.34)" strokeWidth="2" />
        <defs>
          <linearGradient id="waterA" x1="720" y1="100" x2="720" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="#0C7D83" stopOpacity=".32"/><stop offset="1" stopColor="#092B3C" stopOpacity=".08"/></linearGradient>
          <linearGradient id="waterB" x1="720" y1="180" x2="720" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="#1AC6A0" stopOpacity=".2"/><stop offset="1" stopColor="#061927" stopOpacity=".6"/></linearGradient>
        </defs>
      </svg>
    </div>

    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.8fr] lg:gap-20">
      <section className="hidden max-w-xl lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-cyan-200 shadow-lg shadow-cyan-950/20 backdrop-blur"><Droplets size={25} /></div>
          <div><p className="font-semibold tracking-[0.2em] text-white">INFLOW WATER</p><p className="mt-1 text-xs tracking-[0.24em] text-cyan-100/60">CUSTOMER WORKSPACE</p></div>
        </div>
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-cyan-100/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" /> A clearer view of every customer</p>
        <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">Good service<br />starts with a<br /><span className="bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">clear flow.</span></h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-300/80">Bring inquiries, follow-ups, and customer relationships together in one calm workspace.</p>
        <div className="mt-12 flex items-center gap-3 text-sm text-slate-300/70"><ShieldCheck size={18} className="text-teal-200" /> Private admin access for your team</div>
      </section>

      <section className="mx-auto w-full max-w-md rounded-[1.6rem] border border-white/60 bg-white p-5 text-slate-900 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="mb-5 flex items-center gap-3 sm:mb-6 lg:hidden"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Droplets size={22} /></div><span className="text-sm font-bold tracking-[0.14em] text-slate-800">INFLOW WATER CRM</span></div>
        <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Welcome back</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Admin sign in</h2><p className="mt-2 text-sm text-slate-500">Sign in to manage your customer workspace.</p></div><div className="hidden rounded-xl bg-slate-50 p-2.5 text-slate-400 sm:block"><ShieldCheck size={21} /></div></div>
        {registered && <p className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm leading-5 text-emerald-800">Registration complete. Sign in with the username and password you just created.</p>}
        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          <label className="block text-sm font-medium text-slate-700">Username<input autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /></label>
          <label className="block text-sm font-medium text-slate-700">Password<span className="relative mt-1.5 block"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 pr-12 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(visible => !visible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-emerald-700 focus:outline-none focus-visible:text-emerald-700"><span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">{error}</p>}
          <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 p-3 font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 sm:mt-2">Sign in</button>
        </form>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm sm:mt-5"><Link className="text-slate-500 transition hover:text-emerald-700" href="/forgot-password">Forgot password?</Link>{registrationOpen && <Link className="font-medium text-emerald-700 transition hover:text-emerald-900" href="/register">Set up admin</Link>}</div>
      </section>
    </div>
  </main>;
}
