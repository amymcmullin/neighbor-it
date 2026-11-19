"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "student" | "instructor";
  approved: boolean;
};

type Ticket = {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  category: string;
  description: string;
  status: "open" | "claimed" | "resolved" | "closed";
  claimed_by: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  password_account: "Password or account",
  computer_slow: "Computer slow / won't start",
  internet_wifi: "Internet or Wi-Fi",
  printer: "Printer or scanner",
  phone_tablet: "Phone or tablet",
  email: "Email",
  software: "Software or apps",
  security_scam: "Scam or virus",
  other: "Other",
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMessage("Could not load tickets: " + error.message);
    else setTickets((data as Ticket[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error || !prof) {
        setMessage("Could not load your profile: " + (error?.message ?? "not found"));
        setLoading(false);
        return;
      }
      setProfile(prof as Profile);
      if (prof.approved) await loadTickets();
      setLoading(false);
    })();
  }, [router, loadTickets]);

  async function claim(ticketId: string) {
    if (!profile) return;
    setMessage(null);
    const { data, error } = await supabase
      .from("tickets")
      .update({
        status: "claimed",
        claimed_by: profile.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .is("claimed_by", null) // only succeeds if nobody else got there first
      .select();
    if (error) setMessage("Could not claim ticket: " + error.message);
    else if (!data || data.length === 0)
      setMessage("Someone else just claimed that ticket.");
    await loadTickets();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) return <main className="p-8">Loading...</main>;

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <p className="text-red-800">{message}</p>
        <button onClick={signOut} className="mt-4 underline text-blue-700">Sign out</button>
      </main>
    );
  }

  if (!profile.approved) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Waiting for approval</h1>
        <p className="mt-4 text-gray-700">
          Thanks, {profile.full_name ?? "technician"}. Your instructor needs to approve your
          account before you can see tickets. Check back after your next class.
        </p>
        <button onClick={signOut} className="mt-8 underline text-blue-700">Sign out</button>
      </main>
    );
  }

  const open = tickets.filter((t) => t.status === "open");
  const mine = tickets.filter((t) => t.claimed_by === profile.id && t.status !== "closed");
  const others = tickets.filter(
    (t) => t.status !== "open" && t.claimed_by !== profile.id && t.status !== "closed"
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ticket dashboard</h1>
          <p className="text-sm text-gray-600">Signed in as {profile.full_name ?? profile.email}</p>
        </div>
        <div className="flex gap-4 text-sm">
          {profile.role === "instructor" && (
            <Link href="/admin" className="text-blue-700 underline">Approve students</Link>
          )}
          <button onClick={signOut} className="text-blue-700 underline">Sign out</button>
        </div>
      </header>

      {message && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          {message}
        </div>
      )}

      <Section title={`My tickets (${mine.length})`}>
        {mine.length === 0 && <Empty>You have not claimed any tickets yet.</Empty>}
        {mine.map((t) => (
          <TicketCard key={t.id} t={t} showContact />
        ))}
      </Section>

      <Section title={`Open tickets (${open.length})`}>
        {open.length === 0 && <Empty>No open tickets right now. Nice work.</Empty>}
        {open.map((t) => (
          <TicketCard key={t.id} t={t} action={
            <button onClick={() => claim(t.id)}
              className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">
              Claim this ticket
            </button>
          } />
        ))}
      </Section>

      {others.length > 0 && (
        <Section title={`Claimed by others (${others.length})`}>
          {others.map((t) => (
            <TicketCard key={t.id} t={t} />
          ))}
        </Section>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-gray-300 p-4 text-gray-600">{children}</p>;
}

function TicketCard({
  t, action, showContact,
}: { t: Ticket; action?: React.ReactNode; showContact?: boolean }) {
  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
        <span className="rounded bg-gray-100 px-2 py-0.5">{CATEGORY_LABELS[t.category] ?? t.category}</span>
        <span>{new Date(t.created_at).toLocaleString()} &middot; {t.status}</span>
      </div>
      <p className="mt-2 font-medium">{t.client_name}</p>
      <p className="mt-1 whitespace-pre-wrap text-gray-800">{t.description}</p>
      {showContact && (
        <p className="mt-2 text-sm text-gray-700">
          Contact: {t.client_email}{t.client_phone ? ` / ${t.client_phone}` : ""}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </article>
  );
}
