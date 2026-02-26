
"use client";

import React from "react";
import { 
  Zap, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Camera,
  Film,
  Award
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * @fileOverview Portfolio Showcase.
 * Public gallery of DP MediaFlow's creative artifacts and success stories.
 */

const CASE_STUDIES = [
  {
    title: "Nike Summer '24",
    client: "Nike Global",
    type: "Ad Film / AI Hybrid",
    image: "https://picsum.photos/seed/nike-ads/800/600",
    description: "A hybrid production combining high-fidelity drone cinematography with AI-synthesized urban environments."
  },
  {
    title: "Kerala Tourism",
    client: "Department of Tourism",
    type: "Cinematic Showcase",
    image: "https://picsum.photos/seed/kerala-travel/800/600",
    description: "Capturing the serene backwaters through anamorphic lenses and advanced color science."
  },
  {
    title: "Meta Performance",
    client: "E-commerce Giant",
    type: "Short-form Ads",
    image: "https://picsum.photos/seed/meta-performance/800/600",
    description: "A series of 15-second visual hooks that drove a 40% increase in ROAS for a digital-first retailer."
  },
  {
    title: "The Future of Food",
    client: "Culinary Tech",
    type: "3D VFX Production",
    image: "https://picsum.photos/seed/food-vfx/800/600",
    description: "Photorealistic CGI integrated with live-action cooking to demonstrate robotic precision."
  }
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfe] font-body">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 md:px-20 py-6 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP MediaFlow</span>
        </Link>
        <div className="flex gap-8">
          <Link href="/verticals" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Verticals</Link>
          <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Contact</Link>
          <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-primary">Portal</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8 md:px-20 max-w-7xl mx-auto space-y-20">
        <div className="max-w-2xl space-y-4">
          <Badge className="bg-accent/10 text-accent border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Visual Evidence</Badge>
          <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-tight">
            Creative <span className="text-accent">Portfolio</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            A curated selection of strategic media assets designed to solve business problems through high-fidelity visual storytelling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {CASE_STUDIES.map((c, i) => (
            <div key={i} className="group space-y-6">
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  <Button size="sm" className="rounded-full bg-white text-slate-900 hover:bg-white/90 font-bold uppercase text-[10px] gap-2">
                    Case Study <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="px-4 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold font-headline text-slate-900">{c.title}</h3>
                  <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[8px] uppercase tracking-widest">{c.client}</Badge>
                </div>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">{c.type}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">{c.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="py-20 border-t border-slate-100 text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Awards & Recognition</h2>
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-[0.3em]">Industry Standards Verified</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
            {[1, 2, 3, 4, 5].map(i => (
              <Award key={i} className="h-12 w-12" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
