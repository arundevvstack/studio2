
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Film, 
  Users, 
  Layers, 
  Camera, 
  Zap, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

const INDUSTRIES = [
  {
    icon: Building2,
    title: "Advertising Agencies",
    useCase: "Consolidate creative briefs, campaign management, and client approvals into a single node.",
    solution: "Smart Proposal Generator and Client Approval Gates."
  },
  {
    icon: Film,
    title: "Production Houses",
    useCase: "Managing massive production loads across Pre, Pro, and Post stages with external crew sync.",
    solution: "Production Roadmaps and Integrated Talent Registry."
  },
  {
    icon: Users,
    title: "Influencer Agencies",
    useCase: "Scaling influencer discovery, tracking collaboration history, and measuring reach metrics.",
    solution: "Talent Library Marketplace and Reach Analytics."
  },
  {
    icon: Camera,
    title: "Content Studios",
    useCase: "High-volume asset creation requiring rapid project movement and release scheduling.",
    solution: "Kanban Board and Social Media Release Tracking."
  },
  {
    icon: Zap,
    title: "AI Media Companies",
    useCase: "Next-gen synthetic production requiring specialized tracking for AI-driven deliverables.",
    solution: "AI Workflow Integrations and Performance Analytics."
  },
  {
    icon: Layers,
    title: "Independent Units",
    useCase: "Small teams needing enterprise-grade structure to compete for high-stakes project bids.",
    solution: "Authoritative Phase Management and Cost Modeling."
  }
];

export default function IndustriesPage() {
  return (
    <div className="animate-in fade-in duration-1000 font-body">
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Vertical Intelligence
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-none">
            Built for <span className="text-primary">High-Growth</span> Verticals
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            The platform adapts to your organization's specific operational logic, from traditional film units to next-gen AI media startups.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {INDUSTRIES.map((ind, i) => (
            <Card key={i} className="p-12 border-none shadow-xl shadow-slate-200/20 rounded-[3rem] bg-white group hover:shadow-2xl transition-all">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-10 group-hover:scale-110 transition-transform">
                <ind.icon className="h-7 w-7" />
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">{ind.title}</h3>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Typical Use Case</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{ind.useCase}"</p>
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Core Solution
                  </p>
                  <p className="text-sm font-bold text-slate-900">{ind.solution}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 bg-slate-950 text-white rounded-[4rem] mx-6 mb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">Need a custom industry logic?</h2>
          <p className="text-slate-400 text-lg font-medium">Our system is modular by design. We can synthesize a custom operational framework for your specific niche.</p>
          <Button asChild className="h-16 px-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-base transition-all active:scale-95">
            <Link href="/contact">Inquire for Customization</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
