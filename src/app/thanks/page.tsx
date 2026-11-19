import Link from "next/link";

export const metadata = {
  title: "Request received | Neighbor IT",
};

export default function ThanksPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Thank you! We got your request.</h1>
      <p className="mt-4 text-gray-700">
        A student technician will review it and email you, usually within 1 to 3 days.
        If it is an emergency or involves money you may have lost to a scam, please contact
        your bank or local authorities right away.
      </p>
      <Link href="/" className="mt-8 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
        Back to home
      </Link>
    </main>
  );
}
