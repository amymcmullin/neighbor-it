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
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Profile[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setPeople((data as Profile[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) return router.replace("/login");
      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", s.session.user.id).single();
      if (!prof || prof.role !== "instructor" || !prof.approved) {
        return router.replace("/dashboard");
      }
      setMe(prof as Profile);
      await load();
      setLoading(false);
    })();
  }, [router, load]);

  async function setApproved(id: string, approved: boolean) {
    setMessage(null);
    const { error } = await supabase.from("profiles").update({ approved }).eq("id", id);
    if (error) setMessage(error.message);
    await load();
  }

  if (loading) return <main className="p-8">Loading...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-blue-700 underline">&larr; Dashboard</Link>
      <h1 className="mt-3 text-2xl font-bold">Approve technicians</h1>
      <p className="mt-1 text-gray-700">
        Match each name to a real student in your class before approving.
      </p>

      {message && (
        <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{message}</div>
      )}

      <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {people.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">
                {p.full_name ?? "(no name)"} {p.role === "instructor" && <span className="text-sm text-gray-500">(instructor)</span>}
              </p>
              <p className="text-sm text-gray-600">{p.email}</p>
            </div>
            {p.id === me?.id ? (
              <span className="text-sm text-gray-500">You</span>
            ) : p.approved ? (
              <button onClick={() => setApproved(p.id, false)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                Approved &middot; Revoke
              </button>
            ) : (
              <button onClick={() => setApproved(p.id, true)}
                className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-800">
                Approve
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
