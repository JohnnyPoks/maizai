import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, LayoutDashboard } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-earth-50 py-24 sm:py-32">
      {/* Subtle agricultural pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #3d8b5c 0, #3d8b5c 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <span className="mb-4 inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
          Master of Engineering Dissertation · University of Buea
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-brand-900 sm:text-6xl">
          Smart maize disease detection,
          <br className="hidden sm:block" />
          <span className="text-brand-500"> built for Cameroonian farmers.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-earth-700">
          MaizAI detects maize leaf disease on your Android phone — no internet required on the
          plot. Recommendations are enriched with live soil and weather data from our sensor node.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
            <a
              href="https://github.com/JohnnyPoks/maizai/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={18} />
              Download for Android
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 border-brand-300 text-brand-700 hover:bg-brand-50">
            <Link href="/sign-in">
              <LayoutDashboard size={18} />
              Open Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
