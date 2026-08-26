import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Fades from fully opaque on the left (behind the text) to fully
// transparent by the right two-thirds, so the illustration stays crisp and
// visible around the people/trophies.
const SCRIM_MASK =
  "linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.6) 55%, transparent 78%)";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-20 pt-20 sm:pb-24">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_72%]"
        />

        {/* Mutes the illustration's saturation across the whole hero */}
        <div className="absolute inset-0 bg-white/55" />

        {/* Blurs the image behind the text so it recedes further */}
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{ WebkitMaskImage: SCRIM_MASK, maskImage: SCRIM_MASK }}
        />

        {/* Extra lightening specifically behind the text for maximum contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/45 to-white/0" />

        {/* Smooth transition into the off-white section below */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-offwhite sm:h-24" />
      </div>

      <div className="relative px-6 sm:px-10 lg:px-16 xl:px-24">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-black">
          Peer nomination · 10 minutes
        </p>
        <h1 className="mt-5 max-w-[15ch] text-5xl font-medium leading-[1.02] tracking-[-1.5px] text-black sm:text-6xl lg:text-[72px]">
          Core Traits & Recognition Awards
        </h1>
        <p className="mt-6 max-w-[60ch] text-[19px] leading-relaxed text-black">
          At Medtronic LABS, we want to recognize the people who bring our
          values to life in real, specific ways. This nomination is built
          around our four Core Traits.
        </p>
        <a
          href="#nominate"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-hover active:scale-[0.97]"
        >
          Start a nomination
          <ArrowRight size={16} strokeWidth={1.75} />
        </a>
      </div>
    </section>
  );
}
