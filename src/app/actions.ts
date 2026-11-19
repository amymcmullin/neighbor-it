"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "password_account",
  "computer_slow",
  "internet_wifi",
  "printer",
  "phone_tablet",
  "email",
  "software",
  "security_scam",
  "other",
];

export type FormState = { error?: string } | null;

export async function submitTicket(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  // Honeypot: real people never see this field, bots fill it in.
  if (formData.get("website")) {
    redirect("/thanks");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const description = String(formData.get("description") ?? "").trim();
  const agreed = formData.get("agree") === "on";

  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email))
    return { error: "Please enter a valid email address so we can reach you." };
  if (description.length < 10)
    return { error: "Please tell us a bit more about the problem (at least a sentence)." };
  if (description.length > 4000)
    return { error: "That description is too long. Please shorten it." };
  if (!CATEGORIES.includes(category)) return { error: "Please pick a category." };
  if (!agreed) return { error: "Please check the box to confirm you understand how this service works." };

  // No .select() on purpose: the public can insert but never read tickets back.
  const { error } = await supabase.from("tickets").insert({
    client_name: name,
    client_email: email,
    client_phone: phone || null,
    category,
    description,
  });

  if (error) {
    console.error("Ticket insert failed:", error.message);
    return { error: "Something went wrong on our end. Please try again in a few minutes." };
  }

  redirect("/thanks");
}
