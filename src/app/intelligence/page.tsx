
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Briefcase,
  Loader2,
  Activity,
  Zap,
  Target,
  Play,
  Globe,
  Users,
  ShieldCheck,
  ArrowRight,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Intelligence Hub (Operations Hub).
 * Filters viewable operational phases based on authorized permits.
 * Updated with Admin module removal.
 */
export default function IntelligenceHub() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: userData, isLoading: isUserRegistryLoading } = useDoc(userRef);

  const isMasterUser = user?.email?.toLowerCase() === 'defineperspective.in@gmail.com';

  useEffect(() => {
    if (!isUserLoading && !isUserRegistryLoading && mounted && !isMasterUser) {
      if (!user || !userData || userData.status !== "active" || !userData.strategicPermit) {
        router.push("/login");
      }
    }
  }, [user, userData, isUserLoading, isUserRegistryLoading, router, mounted, isMasterUser]);

  const permittedPhases = userData?.permittedPhases || [];
  const isAdmin = userData?.role === 'admin' || isMasterUser;

  const hasPhase = (phase: string) => isAdmin || permittedPhases.includes(phase);

  if (!mounted || isUserLoading || isUserRegistryLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Validating Authorized Permits...</p>
      </div>
    );
  }

  if (!user || (!isMasterUser && userData?.status !== "active")) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 rounded-[2rem] bg-slate-950 flex items-center justify-center shadow-2xl shrink-0 transition-transform hover:rotate-6">
            <Zap className="h-10 w-10 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-950 leading-none">Intelligence</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Operational Hub • {userData?.role || 'Executive'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasPhase('production') && (
            <Button asChild className="h-14 px-10 rounded-full font-bold bg-primary text-white shadow-xl shadow-primary/20 gap-3">
              <Link href="/projects/new">Add Project <Plus className="h-5 w-5" /></Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hasPhase('sales') && (
          <PhaseCard 
            title="Pipeline" 
            desc="Pipeline Management & Lead Intel" 
            icon={Target} 
            color="bg-orange-50 text-orange-600" 
            href="/pipeline" 
          />
        )}
        {hasPhase('production') && (
          <PhaseCard 
            title="Projects" 
            desc="Resource Load & Roadmap Execution" 
            icon={Activity} 
            color="bg-blue-50 text-blue-600" 
            href="/projects" 
          />
        )}
        {hasPhase('production') && (
          <PhaseCard 
            title="Organization" 
            desc="Personnel Registry & Resource Hub" 
            icon={Users} 
            color="bg-slate-50 text-slate-600" 
            href="/team" 
          />
        )}
        {hasPhase('release') && (
          <PhaseCard 
            title="Invoice" 
            desc="High-Fidelity Delivery & Billing" 
            icon={Receipt} 
            color="bg-green-50 text-green-600" 
            href="/invoices" 
          />
        )}
        {hasPhase('socialMedia') && (
          <PhaseCard 
            title="Marketing Intelligence" 
            desc="Asset Monitoring & Market Research" 
            icon={Globe} 
            color="bg-purple-50 text-purple-600" 
            href="/market-research" 
          />
        )}
      </div>
    </div>
  );
}

function PhaseCard({ title, desc, icon: Icon, color, href }: any) {
  return (
    <Link href={href}>
      <Card className="border-none shadow-sm rounded-3xl bg-white p-8 group hover:shadow-xl transition-all h-full flex flex-col justify-between border border-slate-50">
        <div className="space-y-6">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{desc}</p>
          </div>
        </div>
        <div className="pt-8 flex justify-end">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
