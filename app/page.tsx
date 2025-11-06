import { Navigation, Hero, Features, Footer } from "@/modules/marketing/components";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
