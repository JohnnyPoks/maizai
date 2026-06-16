import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { ArchitectureDiagram } from "@/components/landing/architecture-diagram";
import { DownloadSection } from "@/components/landing/download-section";
import { Footer } from "@/components/landing/footer";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Logo size="sm" />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#download" className="text-earth-600 hover:text-brand-600 transition-colors">
              Download
            </a>
            <Link
              href="/sign-in"
              className="rounded-md bg-brand-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
        <ArchitectureDiagram />
        <DownloadSection />
      </main>

      <Footer />
    </div>
  );
}
