import Link from "next/link";
import TicketForm from "./TicketForm";

export const metadata = {
  title: "Request help | Neighbor IT",
};

export default function RequestPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/" className="text-sm text-blue-700 underline">&larr; Back</Link>
      <h1 className="mt-4 text-3xl font-bold">Request tech help</h1>
      <p className="mt-2 mb-8 text-gray-700">
        Tell us what is going on. A student technician will pick up your request and reply by email.
      </p>
      <TicketForm />
    </main>
  );
}
