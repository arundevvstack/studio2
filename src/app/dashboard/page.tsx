
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  ChevronRight,
  Briefcase,
  Loader2,
  TrendingUp,
  Activity,
  Users,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Target,
  Play,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";

/**
 * @fileOverview Strategic Dashboard.
 * Filters viewable operational phases based on authorized permits.
 */
export default function Dashboard() {
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

  useEffect(() => {
    if (!isUserLoading && !isUserRegistryLoading && mounted) {
      if (!user || !userData || userData.status !== "active" || !userData.strategicPermit) {
        router.push("/login");
      }
    }
  }, [user, userData, isUserLoading, isUserRegistryLoading, router, mounted]);

  const permittedPhases = userData?.permittedPhases || [];
  const isAdmin = userData?.role === 'admin';

  const hasPhase = (phase: string) => isAdmin || permittedPhases.includes(phase);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: allProjects } = useCollection(projectsQuery);

  if (!mounted || isUserLoading || isUserRegistryLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Validating Authorized Permits...</p>
      </div>
    );
  }

  if (!user || userData?.status !== "active") return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 rounded-[2rem] bg-slate-950 flex items-center justify-center shadow-2xl shrink-0">
            <Zap className="h-10 w-10 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-950">Dashboard</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Active Strategic Permit • {userData.role || 'Personnel'}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        {hasPhase('release') && (
          <PhaseCard 
            title="Release" 
            desc="High-Fidelity Delivery & Billing" 
            icon={Play} 
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

      {isAdmin && (
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white border-none rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">Root Authority</Badge>
              <h2 className="text-4xl font-bold font-headline tracking-tight">Admin</h2>
              <p className="text-slate-400 max-w-md font-medium">Authorize new expert permits, assigned roles, and manage organizational access tiers.</p>
            </div>
            <Button asChild className="h-16 px-12 bg-white text-slate-950 hover:bg-slate-100 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl">
              <Link href="/admin/users">Manage Permits</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function PhaseCard({ title, desc, icon: Icon, color, href }: any) {
  return (
    <Link href={href}>
      <Card className="border-none shadow-sm rounded-3xl bg-white p-8 group hover:shadow-xl transition-all h-full flex flex-col justify-between">
        <div className="space-y-6">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
        <div className="pt-8 flex justify-end">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
