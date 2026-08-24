import { TRAITS } from "@/lib/traits";

export function TraitCards() {
  return (
    <section className="bg-offwhite py-20">
      <div className="mx-auto max-w-page px-6 sm:px-10">
        <h2 className="text-3xl font-medium text-ink sm:text-[36px]">
          The four Core Traits
        </h2>
        <p className="mt-2 text-base text-ink-faint">
          A nomination can reflect more than one trait.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TRAITS.map((trait) => {
            const Icon = trait.icon;
            return (
              <div
                key={trait.key}
                className="rounded-card border border-border bg-white p-8 shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: trait.tint }}
                  >
                    <Icon size={22} strokeWidth={1.75} color={trait.accent} />
                  </div>
                  <h3 className="text-xl font-medium text-ink sm:text-[22px]">
                    {trait.label}
                  </h3>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-body">
                  {trait.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
