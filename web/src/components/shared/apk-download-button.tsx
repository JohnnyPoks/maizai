import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const RELEASES_API = "https://api.github.com/repos/JohnnyPoks/maizai/releases/latest";
const FALLBACK_URL = "https://github.com/JohnnyPoks/maizai/releases/latest";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface Release {
  tag_name: string;
  assets: ReleaseAsset[];
}

async function getLatestApk(): Promise<{ url: string; version: string; sizeMb: string } | null> {
  try {
    const res = await fetch(RELEASES_API, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const release = (await res.json()) as Release;
    const asset = release.assets.find((a) => a.name.endsWith(".apk"));
    if (!asset) return null;
    return {
      url: asset.browser_download_url,
      version: release.tag_name,
      sizeMb: (asset.size / 1_048_576).toFixed(1),
    };
  } catch {
    return null;
  }
}

export async function ApkDownloadButton() {
  const apk = await getLatestApk();

  if (!apk) {
    return (
      <a href={FALLBACK_URL} target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white gap-2 mb-1">
          <Download size={16} />
          Download APK
        </Button>
      </a>
    );
  }

  return (
    <div className="mb-5">
      <a href={apk.url} download>
        <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white gap-2">
          <Download size={16} />
          Download APK {apk.version}
        </Button>
      </a>
      <p className="text-xs text-earth-400 text-center mt-1">{apk.sizeMb} MB · Android 7.0+</p>
    </div>
  );
}
