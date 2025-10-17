export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-2xl mx-auto px-6 pt-24 pb-28 text-center">
        <h1 className="text-[36px] md:text-[48px] font-extrabold tracking-tight text-gray-900">Activate a Mentor</h1>
        <p className="mt-4 text-gray-600">
          Create an account to unlock full plans, save your progress, and get mentor guidance.
        </p>
        <div className="mt-8 grid gap-3 max-w-md mx-auto">
          <a href="#" className="rounded-full bg-[#2563EB] text-white px-6 py-3 font-semibold">Continue with Email</a>
          <a href="#" className="rounded-full border border-gray-300 px-6 py-3 font-semibold">Continue with Google</a>
        </div>
      </section>
    </main>
  );
}
