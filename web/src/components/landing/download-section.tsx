import { Download, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Download,
    title: "Download the APK",
    description:
      'Tap the "Download for Android" button above to download the latest MaizAI APK from GitHub Releases.',
  },
  {
    icon: Settings,
    title: 'Allow unknown sources',
    description:
      'On your Android device, go to Settings → Security (or Privacy) → "Install unknown apps" and allow installation from your file manager or browser.',
  },
  {
    icon: Shield,
    title: "Install and launch",
    description:
      "Open the downloaded APK file and follow the installation prompts. Once installed, launch MaizAI and register your account.",
  },
];

export function DownloadSection() {
  return (
    <section id="download" className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-brand-900">
          Install MaizAI on Android
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-earth-600">
          The app is distributed as a direct APK download. Follow these three steps to get started.
        </p>

        <div className="mt-12 space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4 rounded-xl border border-brand-100 bg-brand-50 p-5">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-brand-600" />
                    <h3 className="font-semibold text-brand-900">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-earth-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
            <a
              href="https://github.com/JohnnyPoks/maizai/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={18} />
              Download latest APK
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
