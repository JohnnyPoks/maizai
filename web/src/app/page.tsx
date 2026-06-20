import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApkDownloadButton } from "@/components/shared/apk-download-button";
import { InstallPrompt } from "@/components/shared/install-prompt";
import {
  Smartphone,
  Wifi,
  Thermometer,
  Leaf,
  Download,
  ChevronRight,
  Cpu,
  Cloud,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <InstallPrompt />
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="#how-it-works" className="text-earth-600 hover:text-brand-700 transition-colors font-medium">
              How it works
            </a>
            <a href="#features" className="text-earth-600 hover:text-brand-700 transition-colors font-medium">
              Features
            </a>
            <a href="#architecture" className="text-earth-600 hover:text-brand-700 transition-colors font-medium">
              Architecture
            </a>
            <a href="#download" className="text-earth-600 hover:text-brand-700 transition-colors font-medium">
              Download
            </a>
            <Link href="/request-access" className="text-earth-600 hover:text-brand-700 transition-colors font-medium">
              Request Access
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-50 text-sm h-9">
                Sign In
              </Button>
            </Link>
            <Link href="/request-access">
              <Button className="bg-brand-500 hover:bg-brand-600 text-white text-sm h-9">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — two-panel on desktop */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-white pt-16 pb-20 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">

              {/* Text panel */}
              <div>
                <Badge className="mb-6 bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-100">
                  Open source · MIT licensed · Android
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-900 mb-6 leading-tight">
                  Detect maize disease
                  <br />
                  <span className="text-brand-500">before it spreads.</span>
                </h1>
                <p className="text-lg text-earth-600 mb-10 leading-relaxed max-w-lg">
                  MaizAI puts a trained AI in the farmer&apos;s pocket. Snap a leaf and get a diagnosis in seconds, even without an internet connection. Designed for the realities of smallholder farming in Cameroon.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="#download">
                    <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white gap-2 w-full sm:w-auto">
                      <Download size={18} />
                      Download for Android
                    </Button>
                  </a>
                  <a href="#how-it-works">
                    <Button size="lg" variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-50 gap-2 w-full sm:w-auto">
                      See how it works
                      <ChevronRight size={18} />
                    </Button>
                  </a>
                </div>
                <p className="mt-6 text-sm text-earth-400">
                  Trained on the PlantVillage maize dataset · Validated on Cameroonian field conditions
                </p>
              </div>

              {/* Hero image panel — desktop only */}
              <div className="hidden lg:block relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <Image
                    src="/images/hero.png"
                    alt="Farmer using MaizAI to diagnose a maize leaf in the field"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1280px) 50vw, 600px"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 shadow-xl border border-brand-100 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-900 leading-none">Under 3 seconds</p>
                    <p className="text-xs text-earth-500 mt-0.5">Leaf to diagnosis, offline</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-20 px-6 bg-earth-50 border-y border-earth-100">
          <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-10 items-stretch">

            {/* Diseased leaf image with stat overlay */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[300px]">
              <Image
                src="/images/diseased_leaf.png"
                alt="Maize leaf showing gray leaf spot disease with characteristic rectangular lesions"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl md:text-[26px] font-bold text-white leading-snug">
                  Late diagnosis costs Cameroonian farmers up to{" "}
                  <span className="text-orange-400">35% of their maize harvest.</span>
                </h2>
                <p className="text-white/50 text-xs mt-3">
                  <sup>*</sup> Frontiers in Plant Science, 2026. Maize disease and pest detection in sub-Saharan Africa.
                </p>
              </div>
            </div>

            {/* Bullets */}
            <div className="space-y-6 flex flex-col justify-center">
              {[
                {
                  icon: Zap,
                  title: "Disease spreads fast",
                  body: "Common Rust, Gray Leaf Spot, and Blight can devastate a plot within days under warm, humid conditions.",
                },
                {
                  icon: Wifi,
                  title: "Connectivity is limited",
                  body: "Many farms lack reliable internet access, making cloud-based diagnostic tools impractical on the plot.",
                },
                {
                  icon: Shield,
                  title: "Early action saves crops",
                  body: "A diagnosis in the first 48 hours gives farmers time to apply targeted treatment before spread is uncontrollable.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-earth-200">
                    <item.icon size={18} className="text-earth-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900 text-sm">{item.title}</p>
                    <p className="text-earth-600 text-sm mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-900">How it works</h2>
              <p className="text-earth-500 mt-2">From leaf snap to recommendation in under 3 seconds.</p>
            </div>
            <div className="relative">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: "1",
                    icon: Smartphone,
                    title: "Capture the leaf",
                    body: "Open MaizAI on your Android phone and photograph the affected maize leaf.",
                  },
                  {
                    step: "2",
                    icon: Cpu,
                    title: "On-device AI classifies",
                    body: "The TFLite model runs locally, so no internet is required. Four classes: Healthy, Common Rust, Gray Leaf Spot, Blight.",
                  },
                  {
                    step: "3",
                    icon: Thermometer,
                    title: "Sensor data adds context",
                    body: "The ESP32 node provides live soil moisture, temperature, and humidity to refine the urgency level.",
                  },
                  {
                    step: "4",
                    icon: Leaf,
                    title: "Recommendation issued",
                    body: "The rule engine issues a targeted intervention (spray now, monitor, irrigate, or remove) matched to field conditions.",
                  },
                ].map((s, i) => (
                  <div key={s.step} className="relative">
                    {i < 3 && (
                      <div className="hidden lg:block absolute top-8 left-full w-6 -translate-x-3 z-10">
                        <ArrowRight size={18} className="text-brand-300" />
                      </div>
                    )}
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-brand-400 font-mono">0{s.step}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500/10">
                          <s.icon size={16} className="text-brand-600" />
                        </div>
                      </div>
                      <p className="font-semibold text-brand-900 text-sm mb-1">{s.title}</p>
                      <p className="text-earth-600 text-xs leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sensor in the field */}
        <section className="py-20 px-6 bg-earth-50 border-y border-earth-100">
          <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12 xl:gap-16 items-center">

            {/* Text */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-md bg-brand-100 flex items-center justify-center">
                  <Cpu size={14} className="text-brand-600" />
                </div>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Sensor Node
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-900 leading-snug mb-4">
                Environmental context, direct from the field.
              </h2>
              <p className="text-earth-600 text-sm leading-relaxed mb-6">
                The custom ESP32 node sits in the soil between maize rows, continuously monitoring soil moisture, ambient temperature, and relative humidity. It broadcasts live readings locally when the farmer is on plot, and syncs to the cloud via MQTT when they are away, so the rule engine always has context.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Soil moisture · Temperature · Humidity",
                  "mDNS local discovery, no cloud needed on-plot",
                  "MQTT → HiveMQ Cloud when farmer is away",
                  "Low-power, field-deployable design",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-earth-700">
                    <span className="text-brand-400 mt-0.5 shrink-0">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sensor image */}
            <div className="relative mx-auto w-full max-w-xs md:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
                <Image
                  src="/images/sensor_node.png"
                  alt="ESP32 environmental sensor node with soil moisture probe deployed at the base of a maize stalk"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 80vw, (max-width: 1280px) 40vw, 480px"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 bg-brand-900 text-white">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold">Built for the field</h2>
              <p className="text-brand-300 mt-2">Not a lab tool. A field tool.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Wifi,
                  title: "Offline-first",
                  body: "The AI lives in the app. No signal needed to diagnose a leaf. Data syncs to the cloud when connectivity is available.",
                },
                {
                  icon: Thermometer,
                  title: "Context-aware",
                  body: "Pairs disease detection with live soil moisture, ambient temperature, and relative humidity from the ESP32 sensor node.",
                },
                {
                  icon: Smartphone,
                  title: "Works on modest devices",
                  body: "Designed for Android phones with limited RAM. The quantised TFLite model runs in under 1 second on a mid-range device.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-brand-700 bg-brand-800 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 mb-4">
                    <f.icon size={18} className="text-brand-300" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-brand-300 text-sm leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture" className="py-20 px-6 bg-white">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-900">Three-layer architecture</h2>
              <p className="text-earth-500 mt-2">Mobile, cloud, and sensor, each doing what it does best.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Smartphone,
                  layer: "Mobile (React Native)",
                  colour: "bg-brand-50 border-brand-200",
                  iconColour: "bg-brand-100 text-brand-600",
                  items: [
                    "TFLite disease classifier (on-device)",
                    "mDNS sensor discovery",
                    "On-device rule engine",
                    "Offline-first data sync",
                  ],
                },
                {
                  icon: Cloud,
                  layer: "Cloud (Next.js + Neon)",
                  colour: "bg-earth-50 border-earth-200",
                  iconColour: "bg-earth-100 text-earth-600",
                  items: [
                    "REST API for sync & query",
                    "Admin dashboard",
                    "Cloud rule engine",
                    "Cloudinary image storage",
                  ],
                },
                {
                  icon: Cpu,
                  layer: "Sensor (ESP32)",
                  colour: "bg-brand-50 border-brand-200",
                  iconColour: "bg-brand-100 text-brand-600",
                  items: [
                    "Soil moisture, temp, humidity",
                    "mDNS local advertising",
                    "MQTT → HiveMQ Cloud",
                    "Low power, field-deployable",
                  ],
                },
              ].map((l) => (
                <div key={l.layer} className={`rounded-xl border p-6 ${l.colour}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg mb-4 ${l.iconColour}`}>
                    <l.icon size={18} />
                  </div>
                  <h3 className="font-semibold text-brand-900 mb-3 text-sm">{l.layer}</h3>
                  <ul className="space-y-1.5">
                    {l.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-earth-700">
                        <span className="mt-0.5 text-brand-400">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-earth-400 flex-wrap">
              <span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Mobile</span>
              <ArrowRight size={12} />
              <span className="font-mono bg-earth-100 px-2 py-0.5 rounded">HTTPS / REST</span>
              <ArrowRight size={12} />
              <span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cloud</span>
              <span className="mx-2 text-earth-300">·</span>
              <span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Sensor</span>
              <ArrowRight size={12} />
              <span className="font-mono bg-earth-100 px-2 py-0.5 rounded">MQTT / mDNS</span>
              <ArrowRight size={12} />
              <span className="font-mono bg-earth-100 px-2 py-0.5 rounded">Cloud / Mobile</span>
            </div>
          </div>
        </section>

        {/* Download */}
        <section id="download" className="py-20 px-6 bg-brand-50 border-t border-brand-100">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-900 mb-3">
              Get MaizAI on your phone
            </h2>
            <p className="text-earth-600 mb-10">Free, open source, no account required to start diagnosing.</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Android */}
              <div className="bg-white rounded-xl border border-brand-200 p-7 shadow-sm text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <Smartphone size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900">Android</p>
                    <p className="text-xs text-earth-400">Android 8.0+</p>
                  </div>
                </div>
                <ApkDownloadButton />
                <ol className="space-y-2 text-xs text-earth-600">
                  <li className="flex gap-2">
                    <span className="font-bold text-brand-500 shrink-0">1.</span>
                    Enable installs from unknown sources in Settings → Security.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-brand-500 shrink-0">2.</span>
                    Tap the downloaded APK to install.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-brand-500 shrink-0">3.</span>
                    Open MaizAI and start diagnosing.
                  </li>
                </ol>
              </div>
              {/* iOS */}
              <div className="bg-white/60 rounded-xl border border-earth-200 p-7 shadow-sm text-left opacity-60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-earth-100">
                    <Smartphone size={20} className="text-earth-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-earth-500">iOS</p>
                    <p className="text-xs text-earth-400">iPhone / iPad</p>
                  </div>
                </div>
                <Button disabled className="w-full bg-earth-100 text-earth-400 cursor-not-allowed gap-2 mb-5">
                  Coming soon
                </Button>
                <p className="text-xs text-earth-400">iOS development is not planned for the current release. The Android version is fully functional.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-white py-12 px-6">
        <div className="mx-auto max-w-5xl grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo size="sm" />
            <p className="text-sm text-earth-500 mt-3 max-w-xs">
              AI-powered maize leaf disease detection for Cameroonian smallholder farmers.
            </p>
            <p className="text-xs text-earth-400 mt-2">Open source, MIT licensed.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-900 mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-earth-500">
              <li>
                <a href="https://github.com/JohnnyPoks/maizai" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">
                  GitHub repository
                </a>
              </li>
              <li>
                <a href="https://github.com/JohnnyPoks/maizai/issues" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">
                  Report a bug
                </a>
              </li>
              <li>
                <Link href="/request-access" className="hover:text-brand-600 transition-colors">
                  Request dashboard access
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-900 mb-3">Built at</h3>
            <p className="text-sm text-earth-500">
              University of Buea,<br />
              Faculty of Engineering and Technology.
            </p>
            <p className="text-xs text-earth-400 mt-2">Open source under the MIT licence.</p>
          </div>
        </div>
        <div className="border-t border-brand-100 pt-6 text-center text-xs text-earth-400">
          © 2026 MaizAI. Released under the{" "}
          <a
            href="https://github.com/JohnnyPoks/maizai/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-600"
          >
            MIT licence
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
