import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Stable URL that always redirects to the latest release's APK asset and
// triggers a direct download — no GitHub API call needed (which is rate-limited
// from Vercel and was falling back to the release *page*). The CI workflow
// publishes the asset as "maizai.apk" on every build.
const DIRECT_APK_URL =
  "https://github.com/JohnnyPoks/maizai/releases/latest/download/maizai.apk";

const RELEASES_API = "https://api.github.com/repos/JohnnyPoks/maizai/releases/latest";

interface ReleaseAsset {
  name: string;
  size: number;
}

interface Release {
  tag_name: string;
  assets: ReleaseAsset[];
}

// Best-effort metadata only (version + size); the download link never depends
// on this succeeding.
async function getLatestMeta(): Promise<{ version: string; sizeMb: string } | null> {
  try {
    const res = await fetch(RELEASES_API, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const release = (await res.json()) as Release;
    const asset = release.assets.find((a) => a.name.endsWith(".apk"));
    return {
      version: release.tag_name,
      sizeMb: asset ? (asset.size / 1_048_576).toFixed(1) : "",
    };
  } catch {
    return null;
  }
}

export async function ApkDownloadButton() {
  const meta = await getLatestMeta();

  return (
    <div className="mb-5">
      <a href={DIRECT_APK_URL} download>
        <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white gap-2">
          <Download size={16} />
          Download APK{meta ? ` ${meta.version}` : ""}
        </Button>
      </a>
      <p className="text-xs text-earth-400 text-center mt-1">
        {meta?.sizeMb ? `${meta.sizeMb} MB · ` : ""}Android 7.0+
      </p>
    </div>
  );
}
