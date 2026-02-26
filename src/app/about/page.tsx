
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Target, 
  Rocket, 
  ShieldCheck, 
  Star,
  Users,
  Compass,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="animate-in fade-in duration-1000 font-body">
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Our DNA
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-none">
            The Authoritative <span className="text-primary">System</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            DP PM TOOL was born out of a simple observation: Media production is a high-stakes, multi-phase game that shouldn't be managed with generic project tools.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-32">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Our Vision</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                To build the operating system for the creative economy. We believe that by structuring the "Chaos of Creativity," agencies can focus on high-fidelity output while the system handles the operational load.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-4xl font-bold font-headline text-primary">100%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Media Focused</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold font-headline text-slate-900">2026</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Future Roadmap Ready</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-[4rem] bg-slate-100 overflow-hidden shadow-2xl">
                <img src="https://picsum.photos/seed/vision/800/600" className="w-full h-full object-cover" alt="Vision" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              { icon: Target, title: "Mission", desc: "Empowering media organizations with a structured node-based environment for scaling creative throughput." },
              { icon: Compass, title: "Strategy", desc: "Bridging the gap between creative briefs and financial reconciliation through AI synthesis." },
              { icon: ShieldCheck, title: "Trust", desc: "Providing an enterprise-grade workspace that handles identity governance and organizational security." }
            ].map((v, i) => (
              <Card key={i} className="p-12 border-none shadow-xl shadow-slate-200/20 rounded-[3rem] bg-white space-y-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                  <v.icon className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold font-headline text-slate-900">{v.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center text-white space-y-10 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32 rounded-full" />
            <div className="space-y-4 relative z-10">
              <h2 className="text-4xl font-bold font-headline tracking-tight">The Future Roadmap</h2>
              <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">We are actively building deeper integrations for real-time camera-to-cloud workflows and advanced synthetic media generation nodes.</p>
            </div>
            <div className="relative z-10">
              <Button asChild className="h-16 px-12 rounded-2xl bg-primary text-white font-bold text-base shadow-2xl shadow-primary/20 transition-all active:scale-95">
                <Link href="/book-demo">Join the Journey</Link>
              </Button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
