
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Talent Library Redirect.
 * This module has been merged into the master Shoot Network hub.
 */
export default function TalentLibraryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/shoot-network");
  }, [router]);

  return (
    <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Redirecting to Master Registry...</p>
    </div>
  );
}
