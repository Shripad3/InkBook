"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/session-types", label: "Session types" },
  { href: "/dashboard/settings/availability", label: "Availability" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              pathname.startsWith(tab.href)
                ? "border-[#c9a84c] text-[#c9a84c]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
