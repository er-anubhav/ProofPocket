import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { FileText, ShieldCheck, UploadCloud, WalletCards, LogIn, LogOut } from "lucide-react";
import { supabase } from "./lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
type Extraction = Record<string, unknown>;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Extraction | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    if (!supabase) {
      setError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.local first.");
      return;
    }
    setAuthBusy(true);
    setError("");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setError("Account created. Check your email to confirm it, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setResult(null);
    setFile(null);
  }

  async function extractInvoice() {
    if (!file || !session?.access_token) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`${API_URL}/api/v1/documents/extract-invoice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Extraction failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to contact ProofPocket API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-8 text-[#172033] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#24324a] text-white"><WalletCards size={19} /></span>
            <span>proofpocket</span>
          </a>
          {session ? (
            <button onClick={handleSignOut} className="flex items-center gap-2 rounded-full border border-[#e6e3dc] bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <span className="rounded-full border border-[#e6e3dc] bg-white px-3 py-1.5 text-xs text-slate-500">Private by design</span>
          )}
        </header>

        <section className="grid gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-24">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-[#7465a8]">Your personal ownership vault</p>
            <h1 className="max-w-xl font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl">Keep what matters. <span className="text-[#8174ad]">Know what’s covered.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">Turn scattered invoices and warranty papers into clear, searchable records for the things you own.</p>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-600">
              <span className="flex items-center gap-2"><ShieldCheck size={16} /> Evidence-backed details</span>
              <span className="flex items-center gap-2"><FileText size={16} /> One organised vault</span>
            </div>
          </div>

          <section className="rounded-3xl border border-[#e9e6df] bg-white p-6 shadow-[0_18px_60px_-38px_rgba(28,38,58,.3)] sm:p-8">
            {!authReady ? (
              <p className="text-sm text-slate-500">Checking your session…</p>
            ) : !session ? (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0edf7] text-[#7465a8]"><LogIn size={21} /></div>
                <h2 className="mt-5 font-serif text-2xl">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to keep your ownership records private and connected to your account.</p>
                <form className="mt-6 space-y-3" onSubmit={(event) => { event.preventDefault(); void handleAuth(); }}>
                  <label className="block text-xs font-medium text-slate-600">Email
                    <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e5e2dc] bg-white px-3 py-3 text-sm outline-none focus:border-[#8174ad]" placeholder="you@example.com" />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">Password
                    <input required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e5e2dc] bg-white px-3 py-3 text-sm outline-none focus:border-[#8174ad]" placeholder="At least 8 characters" />
                  </label>
                  <button disabled={authBusy} className="w-full rounded-xl bg-[#24324a] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#354663] disabled:opacity-50">{authBusy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
                </form>
                <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} className="mt-4 w-full text-center text-xs text-[#7465a8] hover:underline">
                  {mode === "signin" ? "New to ProofPocket? Create an account" : "Already have an account? Sign in"}
                </button>
              </>
            ) : (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0edf7] text-[#7465a8]"><UploadCloud size={21} /></div>
                <h2 className="mt-5 font-serif text-2xl">Start with a receipt</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Signed in as {session.user.email}. Upload an invoice to extract its details.</p>
                <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[#d9d5e3] bg-[#faf9fc] px-5 py-8 text-center transition hover:bg-[#f4f1f9]">
                  <UploadCloud className="text-[#8174ad]" size={25} />
                  <span className="mt-3 text-sm font-medium">{file?.name || "Choose an invoice or receipt"}</span>
                  <span className="mt-1 text-xs text-slate-400">PDF, JPG, PNG or WEBP · up to 10 MB</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0] || null); setResult(null); setError(""); }} />
                </label>
                <button onClick={extractInvoice} disabled={!file || loading} className="mt-4 w-full rounded-xl bg-[#24324a] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#354663] disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Reading your document…" : "Extract purchase details"}</button>
                {result && <div className="mt-5 max-h-80 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-emerald-200"><pre>{JSON.stringify(result, null, 2)}</pre></div>}
                <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">Review extracted values before treating them as verified ownership information.</p>
              </>
            )}
            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
            {!supabase && <p className="mt-3 text-xs text-amber-700">Supabase browser credentials are not configured.</p>}
          </section>
        </section>
        <footer className="border-t border-[#e8e5de] py-6 text-xs text-slate-400">ProofPocket · Your purchases. Your proofs. Your peace of mind.</footer>
      </div>
    </main>
  );
}
