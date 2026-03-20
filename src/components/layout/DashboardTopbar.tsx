"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  artist: { name: string | null; slug: string };
  trialDaysLeft: number | null;
}

export function DashboardTopbar({ artist, trialDaysLeft }: Props) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/sign-in");
  }

  return (
    <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between shrink-0">
      <div>
        {trialDaysLeft !== null && trialDaysLeft <= 7 && (
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {trialDaysLeft === 0
                ? "Trial expired — upgrade to continue"
                : `Trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""}`}
            </span>
            <Button variant="gold" size="sm" onClick={() => router.push("/dashboard/billing")} className="ml-2 h-7">
              Upgrade
            </Button>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-[#c9a84c]/20 text-[#c9a84c]">
                {artist.name?.[0] ?? "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">{artist.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{artist.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings/profile")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/billing")}>
            Billing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
