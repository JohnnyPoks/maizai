import { Smartphone, Cloud, Cpu, ArrowLeftRight } from "lucide-react";

export function ArchitectureDiagram() {
  return (
    <section className="bg-brand-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-brand-900">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-earth-600">
          Three layers working together — the mobile app, the cloud back-end, and the sensor node.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0">
          {/* Mobile App */}
          <div className="flex flex-col items-center rounded-xl border border-brand-200 bg-white p-6 shadow-sm w-48">
            <Smartphone size={32} className="text-brand-500" />
            <p className="mt-2 font-semibold text-brand-800 text-sm">Mobile App</p>
            <p className="mt-1 text-center text-xs text-earth-500">
              On-device TFLite classifier + offline recommendations
            </p>
          </div>

          {/* Arrow left-right */}
          <div className="flex flex-col items-center px-4 text-brand-300">
            <ArrowLeftRight size={28} />
            <span className="mt-1 text-xs text-earth-400 text-center">
              Sync via REST API
            </span>
          </div>

          {/* Cloud */}
          <div className="flex flex-col items-center rounded-xl border border-brand-200 bg-white p-6 shadow-sm w-48">
            <Cloud size={32} className="text-brand-500" />
            <p className="mt-2 font-semibold text-brand-800 text-sm">Cloud Back-end</p>
            <p className="mt-1 text-center text-xs text-earth-500">
              Next.js + PostgreSQL, rule engine, image storage
            </p>
          </div>

          {/* Arrow left-right */}
          <div className="flex flex-col items-center px-4 text-brand-300">
            <ArrowLeftRight size={28} />
            <span className="mt-1 text-xs text-earth-400 text-center">
              MQTT / mDNS
            </span>
          </div>

          {/* Sensor Node */}
          <div className="flex flex-col items-center rounded-xl border border-brand-200 bg-white p-6 shadow-sm w-48">
            <Cpu size={32} className="text-brand-500" />
            <p className="mt-2 font-semibold text-brand-800 text-sm">Sensor Node</p>
            <p className="mt-1 text-center text-xs text-earth-500">
              ESP32 — soil, temperature &amp; humidity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
