
"use client";

import React from "react";
import { 
  Film, 
  Zap, 
  Globe, 
  Camera, 
  Layers, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

/**
 * @fileOverview Verticals Hub.
 * Public showcase of DP MediaFlow's production specializations.
 */

const VERTICALS = [
  {
    title: "TV Commercials (TVC)",
    description: "High-fidelity cinematic storytelling for broadcast and premium digital distribution. We handle end-to-end production from concept to color grading.",
    icon: Film,
    features: ["Cinematic Narrative", "Global Reach", "Broadcast Quality"]
  },
  {
    title: "AI Video Production",
    description: "The cutting edge of media. Utilizing GenAI for rapid prototyping, background synthesis, and hyper-realistic asset generation.",
    icon: Zap,
    features: ["Rapid Iteration", "Cost Efficiency", "Infinite Creativity"]
  },
  {
    title: "Performance Marketing Ads",
    description: "Data-backed visual assets designed specifically for conversion. Optimized for Meta, Google, and TikTok ad algorithms.",
    icon: Globe,
    features: ["Conversion Focused", "A/B Testing Ready", "Platform Optimized"]
  },
  {
    title: "Product Photography",
    description: "Premium product staging and high-fidelity captures that define brand identity and drive e-commerce trust.",
    icon: Camera,
    features: ["Macro Detail", "Creative Staging", "Post-Processing"]
  },
  {
    title: "Social Media Reels",
    description: "Vertical-first storytelling designed to stop the scroll. We produce high-impact, short-form content that trends.",
    icon: Play,
    features: ["Scroll-Stopping", "Trending Audio Sync", "Viral Logic"]
  }
];

export default function VerticalsPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfe] font-body">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 md:px-20 py-6 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP MediaFlow</span>
        </Link>
        <div className="flex gap-8">
          <Link href="/portfolio" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Portfolio</Link>
          <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Contact</Link>
          <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-primary">Portal</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8 md:px-20 max-w-7xl mx-auto space-y-20">
        <div className="max-w-2xl space-y-4">
          <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Execution Matrix</Badge>
          <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-tight">
            Production <span className="text-primary">Verticals</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            We operate across multiple high-stakes creative verticals, combining traditional cinematic values with next-gen AI intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VERTICALS.map((v, i) => (
            <Card key={i} className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] p-10 space-y-8 bg-white group hover:shadow-2xl transition-all duration-500">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <v.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-headline text-slate-900">{v.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.description}</p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-50">
                {v.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center space-y-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          <h2 className="text-4xl font-bold font-headline text-white tracking-tight relative z-10">Have a custom requirement?</h2>
          <p className="text-slate-400 max-w-xl mx-auto relative z-10">Our strategic engine is built for flexibility. If you don't see your vertical listed, we can synthesize a custom production framework.</p>
          <Button asChild className="h-14 px-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold uppercase text-xs tracking-widest relative z-10 transition-all active:scale-95">
            <Link href="/contact">Initiate Strategic Discussion</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
