import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TraitCards } from "@/components/TraitCards";
import { NominationFlow } from "@/components/nomination/NominationFlow";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TraitCards />
        <section id="nominate" className="bg-offwhite py-20">
          <div className="mx-auto max-w-page px-6 sm:px-10">
            <NominationFlow />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
