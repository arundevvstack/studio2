
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Film, 
  Play, 
  Globe, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Rocket,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="animate-in fade-in duration-1000 font-body">
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Operational Blueprint
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-none">
            Precision in <span className="text-primary">Workflow</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            The platform is engineered around a Phase-Based architecture, ensuring every project follows an authoritative path from initial lead to final release.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto space-y-32">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Layers className="h-7 w-7" />
              </div>
              <h2 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Phase-Based Architecture</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Unlike generic list-based tools, DP PM Tool enforces a rigid Phase structure (Sales, Production, Release, Management). This ensures that critical creative milestones are never bypassed and organizational visibility is maintained at 100%.
              </p>
              <ul className="space-y-4">
                {["Authoritative sequence", "Automatic task provisioning", "Stage-gated transitions"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <Card className="border-none shadow-2xl rounded-[3rem] p-10 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
                <div className="space-y-6 relative z-10">
                  {["Phase 01: Sales", "Phase 02: Production", "Phase 03: Release", "Phase 04: Management"].map((p, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="font-bold text-sm uppercase tracking-widest">{p}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proposal Synthesis</span>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="p-10 space-y-6">
                  <div className="h-4 w-3/4 bg-slate-50 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-50 rounded-full" />
                  <div className="h-32 w-full bg-primary/5 rounded-2xl border border-dashed border-primary/20 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-8">
              <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Zap className="h-7 w-7" />
              </div>
              <h2 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Proposal Intelligence Engine</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Connect your creative objectives with financial parameters. Our engine synthesizes these into a professional, high-fidelity PDF proposal that addresses strategy, timeline, and investment narrative automatically.
              </p>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Market Validation Integrated</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="px-6 py-24 md:py-32 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-bold font-headline text-slate-900">Ready to deploy your first project?</h2>
          <p className="text-slate-500 font-medium text-lg">Join the media companies scaling with DP PM TOOL.</p>
          <div className="flex justify-center gap-4">
            <Button asChild className="h-16 px-12 rounded-2xl bg-primary text-white font-bold shadow-xl">
              <Link href="/book-demo">Book Free Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
