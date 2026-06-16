import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-900 py-12 text-brand-200">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Logo showText size="sm" className="[&>span]:text-white [&>svg]:text-brand-300" />
            <p className="mt-3 text-sm text-brand-400">
              Mobile-first maize disease detection for Cameroonian smallholder farmers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white">Academic context</h3>
            <ul className="mt-3 space-y-1 text-sm text-brand-400">
              <li>University of Buea</li>
              <li>Faculty of Engineering and Technology</li>
              <li>Department of Computer Engineering</li>
              <li>Master of Engineering, 2025/2026</li>
              <li>Supervisor: Dr. Djouela Ines</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/JohnnyPoks/maizai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-400 hover:text-white transition-colors"
                >
                  <Github size={14} />
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link href="/sign-in" className="text-brand-400 hover:text-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-800 pt-6 text-center text-xs text-brand-500">
          MIT Licence · © 2026 Pokam Ngouffo Tanekou · MaizAI
        </div>
      </div>
    </footer>
  );
}
