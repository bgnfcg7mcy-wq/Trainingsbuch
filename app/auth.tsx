"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function Auth({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { if (mounted) { setSession(next); setReady(true); } });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (result.error) { setMessage(mode === "login" ? "Anmeldung fehlgeschlagen. Prüfe E-Mail, Passwort und die Bestätigung deiner E-Mail-Adresse." : "Das Konto konnte nicht erstellt werden. Bitte prüfe deine Angaben oder versuche es später erneut."); return; }
      setPassword("");
      if (mode === "signup" && !result.data.session) setMessage("Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach. Anschließend kannst du dich anmelden.");
    } catch { setMessage("Die Verbindung ist gerade nicht verfügbar. Bitte versuche es erneut."); }
    finally { setBusy(false); }
  }
  if (!ready) return <div className="auth-shell"><p>Trainingsbuch wird geladen …</p></div>;
  if (session) return <><div className="account-bar"><span>{session.user.email}</span><button onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) setMessage("Abmelden fehlgeschlagen."); }}>Abmelden</button></div>{children}{message && <p role="alert" className="account-error">{message}</p>}</>;
  return <main className="auth-shell"><section className="panel auth-panel"><div className="brand auth-brand"><span className="brandmark">⚽</span>Trainingsbuch</div><h1>{mode === "login" ? "Willkommen zurück" : "Dein Trainingskonto"}</h1><p className="lead">Melde dich an, um deine Trainings und Zahlungen zu verwalten.</p><form onSubmit={submit}><label htmlFor="email">E-Mail-Adresse</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/><label htmlFor="password">Passwort</label><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)}/>{mode === "signup" && <p className="auth-hint">Mindestens 8 Zeichen.</p>}<button type="submit" disabled={busy} className="primary">{busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Konto erstellen"}</button>{message && <p role="status" className="auth-message">{message}</p>}</form><button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Noch kein Konto? Konto erstellen" : "Bereits registriert? Anmelden"}</button></section></main>;
}
