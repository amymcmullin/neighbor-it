"use client";

import { useActionState } from "react";
import { submitTicket } from "../actions";

const CATEGORIES = [
  { value: "password_account", label: "Password or account problem" },
  { value: "computer_slow", label: "Computer is slow or won't start" },
  { value: "internet_wifi", label: "Internet or Wi-Fi" },
  { value: "printer", label: "Printer or scanner" },
  { value: "phone_tablet", label: "Phone or tablet" },
  { value: "email", label: "Email" },
  { value: "software", label: "Software or apps" },
  { value: "security_scam", label: "Scam, virus, or suspicious message" },
  { value: "other", label: "Something else" },
];

const field =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function TicketForm() {
  const [state, formAction, pending] = useActionState(submitTicket, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="font-medium">Your name</label>
        <input id="name" name="name" type="text" required autoComplete="name" className={field} />
      </div>

      <div>
        <label htmlFor="email" className="font-medium">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
        <p className="mt-1 text-sm text-gray-600">We will reply here.</p>
      </div>

      <div>
        <label htmlFor="phone" className="font-medium">
          Phone number <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} />
      </div>

      <div>
        <label htmlFor="category" className="font-medium">What kind of problem is it?</label>
        <select id="category" name="category" defaultValue="other" className={field}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="font-medium">Tell us what is happening</label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          className={field}
          placeholder="What device is it? What did you expect to happen, and what happened instead?"
        />
        <p className="mt-1 text-sm text-gray-600">
          Please do <strong>not</strong> include passwords, bank details, or Social Security numbers.
        </p>
      </div>

      {/* Honeypot field: hidden from people, bots fill it in */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3">
        <input type="checkbox" name="agree" className="mt-1 h-5 w-5" />
        <span className="text-sm text-gray-700">
          I understand this is a free, student-staffed service run by IT students and
          supervised by an instructor. Response time is typically 1 to 3 days, and help
          is best-effort. I will not share passwords or financial information.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send my request"}
      </button>
    </form>
  );
}
