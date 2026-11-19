import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-4xl font-bold">Neighbor IT</h1>
      <p className="mt-4 text-xl text-gray-700">
        Free tech help for our community, from students learning to be the next generation of IT professionals.
      </p>

      <ul className="mt-8 space-y-2 text-gray-800">
        <li>&#10003; Passwords, email, and accounts</li>
        <li>&#10003; Slow computers, Wi-Fi, and printers</li>
        <li>&#10003; Phones, tablets, and everyday apps</li>
        <li>&#10003; Spotting scams and suspicious messages</li>
      </ul>

      <Link
        href="/request"
        className="mt-10 inline-block rounded-lg bg-blue-700 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-800"
      >
        Ask for help
      </Link>

      <p className="mt-10 text-sm text-gray-600">
        Student-staffed and instructor-supervised. Typical response time is 1 to 3 days.
        We do not handle medical records, banking, or legal matters.
      </p>
    </main>
  );
}
