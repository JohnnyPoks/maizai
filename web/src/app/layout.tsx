import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3d8b5c",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://maizai.vercel.app"
  ),
  title: {
    default: "MaizAI — Maize Disease Detection",
    template: "%s | MaizAI",
  },
  description:
    "Mobile-first maize leaf disease detection system for Cameroonian smallholder farmers. Detect Common Rust, Gray Leaf Spot, and Blight — offline, in seconds.",
  keywords: ["maize disease", "crop detection", "AI agriculture", "Cameroon", "smallholder farmers", "TFLite", "offline AI"],
  authors: [{ name: "MaizAI" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "MaizAI — Maize Disease Detection",
    description:
      "Detect maize leaf disease before it spreads. On-device AI built for Cameroonian smallholder farmers.",
    type: "website",
    url: "/",
    siteName: "MaizAI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MaizAI — Maize Disease Detection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaizAI — Maize Disease Detection",
    description: "On-device AI for maize disease detection. Built for Cameroonian smallholder farmers.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
