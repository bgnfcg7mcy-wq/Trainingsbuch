"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Auth } from "./auth";
import { CalendarDays, Check, ClipboardList, Pencil, Plus, Trash2, X } from "lucide-react";
type Training = { id: number; date: string; content: string; paid: boolean };
const today = () => new Date().toLocaleDateString("en-CA");
export default function Home() { return <Auth><TrainingBook /></Auth>; }
function TrainingBook() {
  const [items, setItems] = useState<Training[]>([]);
  const [form, setForm] = useState({ date: today(), content: "", paid: false });
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    try { const { data, error } = await supabase.from("trainings").select("id,date,content,paid").order("date", { ascending: false }).order("id", { ascending: false }); if (error) throw error; setItems(data || []); setError(""); }
    catch { setError("Die Trainings konnten nicht geladen werden. Bitte versuche es erneut."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const value = { ...form, content: form.content.trim() };
      const result = editing === null ? await supabase.from("trainings").insert(value).select("id").single() : await supabase.from("trainings").update(value).eq("id", editing).select("id").single();
      if (result.error) throw result.error;
      setForm({ date: today(), content: "", paid: false }); setEditing(null); await load();
    } catch { setError("Das Training konnte nicht gespeichert werden. Deine Eingabe bleibt erhalten."); }
    finally { setBusy(false); }
  }
  async function toggle(item: Training) {
    setError(""); try { const result = await supabase.from("trainings").update({ paid: !item.paid }).eq("id", item.id).select("id").single(); if (result.error) throw result.error; await load(); }
    catch { setError("Der Zahlungsstatus konnte nicht geändert werden."); }
  }
  async function remove(item: Training) {
    if (!window.confirm("Dieses Training wirklich löschen?")) return;
    setError(""); try { const result = await supabase.from("trainings").delete().eq("id", item.id).select("id").single(); if (result.error) throw result.error; await load(); }
    catch { setError("Das Training konnte nicht gelöscht werden."); }
  }
  function beginEdit(item: Training) { setEditing(item.id); setForm({ date: item.date, content: item.content, paid: item.paid }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function cancelEdit() { setEditing(null); setForm({ date: today(), content: "", paid: false }); }
  const fee = 25;
  const unpaid = items.filter(i => !i.paid).length;
  const euro = (amount: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="brandmark">⚽</span><span>Trainingsbuch</span></div><span className="header-note">Fußballtraining</span></header>
    <div className="content"><div className="heading"><div><p className="eyebrow">ÜBERSICHT</p><h1>Meine Trainings</h1><p className="lead">{euro(fee)} pro Training · Alle Einheiten und Zahlungen an einem Ort.</p></div><div className="stats"><div><strong>{items.length}</strong><span>Trainings</span></div><div><strong>{euro((items.length - unpaid) * fee)}</strong><span>Einnahmen</span></div><div><strong>{euro(unpaid * fee)}</strong><span>Offener Betrag</span></div></div></div>
      <div className="grid"><section className="panel form-panel" aria-labelledby="form-title"><div className="panel-title"><span className="icon-tile"><Plus size={20}/></span><div><p className="eyebrow">EINTRAG</p><h2 id="form-title">{editing === null ? "Training erfassen" : "Training bearbeiten"}</h2></div></div>
        <form onSubmit={save}><label htmlFor="date">Wann war das Training?</label><input id="date" type="date" required value={form.date} onChange={e => setForm({...form,date:e.target.value})}/><label htmlFor="content">Trainingsinhalt</label><textarea id="content" required maxLength={2000} rows={6} placeholder="z. B. Passspiel, Torschuss und Abschlussspiel" value={form.content} onChange={e => setForm({...form,content:e.target.value})}/><label className="checkbox"><input type="checkbox" checked={form.paid} onChange={e => setForm({...form,paid:e.target.checked})}/><span>Für dieses Training bereits bezahlt</span></label><button className="primary" disabled={busy} type="submit">{busy ? "Speichert …" : editing === null ? "Training speichern" : "Änderungen speichern"}</button>{editing !== null && <button className="cancel" type="button" onClick={cancelEdit}><X size={16}/> Abbrechen</button>}</form>
      </section><section className="list-section" aria-labelledby="list-title"><div className="list-heading"><div><p className="eyebrow">CHRONIK</p><h2 id="list-title">Gespeicherte Trainings</h2></div><span>{items.length} Einträge</span></div>{error && <div className="error" role="alert">{error} <button onClick={() => void load()}>Erneut laden</button></div>}{loading ? <div className="empty">Trainings werden geladen …</div> : items.length === 0 ? <div className="empty"><ClipboardList size={32}/><h3>Noch keine Trainings</h3><p>Erfasse deine erste Einheit mit dem Formular.</p></div> : <div className="cards">{items.map(item => <article className="training" key={item.id}><div className="training-main"><div className="date-icon"><CalendarDays size={19}/></div><div className="training-text"><div className="training-top"><time dateTime={item.date}>{new Date(item.date+"T12:00:00").toLocaleDateString("de-AT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</time><span className={item.paid ? "badge paid" : "badge unpaid"}>{item.paid ? "Bezahlt" : "Offen"}</span></div><p>{item.content}</p></div></div><div className="actions"><button onClick={() => void toggle(item)} className="status-action"><Check size={16}/>{item.paid ? "Als offen markieren" : "Als bezahlt markieren"}</button><button aria-label="Training bearbeiten" title="Bearbeiten" onClick={() => beginEdit(item)}><Pencil size={16}/></button><button aria-label="Training löschen" title="Löschen" onClick={() => void remove(item)}><Trash2 size={16}/></button></div></article>)}</div>}</section></div>
    </div></main>;
}
