
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BookOpen, 
  Play, 
  ChevronRight, 
  Star,
  Search,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const RESOURCES = [
  {
    type: "Guide",
    title: "The 2026 Media Production Roadmap",
    desc: "A comprehensive guide to transitioning from manual lists to phase-based workflow management.",
    icon: BookOpen
  },
  {
    type: "Case Study",
    title: "How Agency X Scaled to 50+ Projects",
    desc: "Analyzing the efficiency gains achieved through our Smart Proposal Generator.",
    icon: FileText
  },
  {
    type: "Video",
    title: "AI Media Production Workflows",
    desc: "A masterclass on integrating GenAI assets into your existing production roadmap.",
    icon: Play
  }
];

export default function ResourcesPage() {
  return (
    <div className="animate-in fade-in duration-1000 font-body">
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Knowledge Hub
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-none">
            Strategic <span className="text-primary">Resources</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Stay updated with the latest in media production strategy, operational efficiency, and platform innovations.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-20">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RESOURCES.map((res, i) => (
              <Card key={i} className="border-none shadow-xl shadow-slate-200/20 rounded-[3rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all">
                <div className="p-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <res.icon className="h-7 w-7" />
                    </div>
                    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-100">{res.type}</Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold font-headline text-slate-900 leading-tight">{res.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{res.desc}</p>
                  </div>
                  <Button variant="ghost" className="p-0 h-auto text-primary font-bold text-[10px] uppercase tracking-widest gap-2">
                    Read Intelligence <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-2xl shadow-primary/5 rounded-[4rem] bg-slate-900 text-white p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge className="bg-white/10 text-white border-none font-bold text-[10px] uppercase tracking-widest px-4 py-1">Updates</Badge>
                  <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight leading-tight">Version 2.4: The AI Core Release</h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed">Our latest release introduces native support for synthetic media registry and AI-driven budget modeling.</p>
                </div>
                <Button asChild className="h-16 px-10 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm uppercase tracking-widest transition-all">
                  <Link href="/resources">Read Patch Notes</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "AI Registry", desc: "Native tracking for GenAI media assets." },
                  { label: "Performance Hub", desc: "Enhanced ROI analysis for Reels/Shorts." },
                  { label: "Node Sync", desc: "Real-time state synchronization across tiers." },
                  { label: "Security Plus", desc: "Upgraded identity governance protocols." }
                ].map((update, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                    <p className="text-primary font-bold text-xs uppercase tracking-widest">{update.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{update.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </section>
    </div>
  );
}
