export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-6 pt-8 flex justify-end gap-10 text-[18px] text-gray-800">
        <a href="/login" className="hover:opacity-80 transition">Login</a>
        <a href="/signup" className="hover:opacity-80 transition">Sign Up</a>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pb-28 pt-24 md:pt-28 lg:pt-32 text-center">
        <h1 className="font-extrabold text-gray-900
                       leading-[1.05] tracking-tight
                       text-[42px] sm:text-[56px] md:text-[72px] lg:text-[88px]">
          AI-Powered Business
          <br className="hidden md:block" />
          Idea Guidance
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-[18px] md:text-[22px] text-gray-600">
          Get a step-by-step guide to bring your idea to life, or find the best business ideas for you.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <a
            href="/idea"
            className="inline-block rounded-full bg-[#2563EB] px-8 md:px-10 py-3.5 md:py-4
                       text-white text-[18px] md:text-[20px] font-semibold
                       shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                       hover:translate-y-[1px] active:translate-y-[2px] transition"
          >
            Bring My Idea
          </a>

          <a
            href="/recommend"
            className="inline-block rounded-full border-2 border-gray-300
                       px-8 md:px-10 py-3.5 md:py-4 text-gray-900
                       text-[18px] md:text-[20px] font-semibold
                       hover:bg-gray-50 transition"
          >
            Match Me with Ideas
          </a>
        </div>
      </section>
    </main>
  );
}
