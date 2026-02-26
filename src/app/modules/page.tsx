
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Zap, 
  Briefcase, 
  Users, 
  Layers, 
  Globe, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

const MODULES = [
  {
    icon: GitBranch,
    title: "Sales & CRM",
    problem: "Leads scattered across multiple personal channels with no conversion visibility.",
    features: ["Unified Lead Inbox", "Phase-based Pipeline", "Conversion Analytics"],
    impact: "30% increase in lead-to-won conversion efficiency."
  },
  {
    icon: Zap,
    title: "Smart Proposal Generator",
    problem: "Manual bid creation taking hours and lacking professional strategic formatting.",
    features: ["AI Content Synthesis", "Automated Financial Ledger", "Print-Ready PDF Hub"],
    impact: "Reduce proposal generation time from hours to 5 minutes."
  },
  {
    icon: Briefcase,
    title: "Production Management",
    problem: "No structured way to track progress across Pre, Pro, and Post stages.",
    features: ["Stage-Gated Roadmaps", "Task-based Capacity Management", "Visual Timeline Sync"],
    impact: "Maintain 100% project visibility for executive producers."
  },
  {
    icon: Users,
    title: "Talent Library",
    problem: "Inefficient talent discovery and poor tracking of collaboration history.",
    features: ["Marketplace Indexing", "Verified Expertise Badges", "Direct Sync Channels"],
    impact: "Onboard and deploy personnel in minutes, not days."
  },
  {
    icon: Layers,
    title: "Workflow Builder",
    problem: "Inflexible systems that don't adapt to specific agency operational logic.",
    features: ["Node-based Engine", "Custom Permissions", "Automated Transitions"],
    impact: "System architecture that grows with your organization."
  },
  {
    icon: Globe,
    title: "Social Media Manager",
    problem: "Lack of visibility on asset performance after production delivery.",
    features: ["Release Tracker", "Engagement Metrics Hub", "Cross-Platform Insights"],
    impact: "Close the loop between production and actual ROI."
  },
  {
    icon: ShieldCheck,
    title: "AI Production Hub",
    problem: "New AI media workflows requiring specialized tracking and cost modeling.",
    features: ["GenAI Asset Registry", "Synthetic Workflow Sync", "AI Resource Optimization"],
    impact: "Future-proof your agency for the next generation of media."
  }
];

export default function ModulesPage() {
  return (
    <div className="animate-in fade-in duration-1000 font-body">
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Core Engine
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-none">
            Authoritative <span className="text-primary">Modules</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Every module is designed to solve a specific media industry bottleneck, integrated into a single high-performance workspace.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-12">
          {MODULES.map((m, i) => (
            <Card key={i} className="border-none shadow-xl shadow-slate-200/30 rounded-[3.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all border border-slate-50">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-4 p-12 bg-slate-50/50 h-full flex flex-col justify-center border-r border-slate-50">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                    <m.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">{m.title}</h3>
                </div>
                <div className="lg:col-span-8 p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> The Problem
                      </p>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{m.problem}"</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Core Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.features.map((f, idx) => (
                          <Badge key={idx} variant="outline" className="border-slate-100 text-slate-500 font-bold text-[9px] uppercase px-3 py-1 rounded-lg">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Impact</p>
                      <p className="text-lg font-bold text-slate-900">{m.impact}</p>
                    </div>
                    <Button asChild className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 px-8">
                      <Link href="/book-demo">Request Module Demo</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
