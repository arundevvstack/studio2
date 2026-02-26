
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Play, 
  TrendingUp, 
  Target, 
  Users, 
  FileText, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Film,
  Globe,
  Star,
  ChevronDown,
  GitBranch,
  Briefcase
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * @fileOverview DP PM TOOL - SaaS Landing Page.
 */

export default function SaaSLandingPage() {
  return (
    <div className="font-body selection:bg-primary/10">
      
      {/* Section 1: Hero */}
      <section className="relative px-6 pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden bg-[#fcfcfe]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
            Next-Gen Media OS
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-[1.1]">
            The Smart Project Management System Built for <span className="text-primary">Media Production</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
            Manage Sales, Production, Release & Social Media workflows in one intelligent system. Designed for Agencies, Studios, and AI Media Companies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3">
              <Link href="/book-demo">Book a Demo <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-600 font-bold text-base shadow-sm gap-3">
              <Play className="h-5 w-5 fill-slate-600" /> Watch Overview
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-20">
            {[
              { icon: Layers, label: "Phase & Stage Workflow" },
              { icon: Zap, label: "Smart Proposal Generator" },
              { icon: Users, label: "Influencer Marketplace" },
              { icon: ShieldCheck, label: "AI Media Ready" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Problem */}
      <section className="px-6 py-24 md:py-32 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 tracking-tight">Managing Media Projects Shouldn’t Be Chaos</h2>
            <p className="text-slate-500 font-medium text-lg">Industry bottlenecks that stifle agency growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "Scattered Intelligence", desc: "Leads scattered across Instagram, WhatsApp, and Email with no central registry." },
              { title: "No Structural Visibility", desc: "Missing phase tracking from Pre to Post production, leading to delivery delays." },
              { title: "Proposal Friction", desc: "Delays in synthesizing creative briefs into professional client-ready bids." },
              { title: "Resource Blindness", desc: "Inefficient tracking of influencer collaborations and internal crew capacity." },
              { title: "Release Risk", desc: "Poor visibility on asset distribution across social platforms after production." },
              { title: "Financial Gaps", desc: "Difficulty in reconciling production loads with accurate billing and forecasting." }
            ].map((p, i) => (
              <Card key={i} className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] group hover:bg-white hover:shadow-xl transition-all">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Solution Overview */}
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">The Engine</Badge>
              <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 tracking-tight">Structure Your Entire Media Workflow</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                We've built a system that understands the nuances of media production. Every project is mapped across 4 critical Phases.
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                { title: "Sales Phase", desc: "From Lead to Won—manage your pipeline with precision.", icon: Target },
                { title: "Production Phase", desc: "Pre, Production, and Post—structured for accountability.", icon: Film },
                { title: "Release Phase", desc: "Ensuring high-fidelity delivery and client approval.", icon: Play },
                { title: "Management Phase", desc: "Social media tracking and performance analysis.", icon: Globe }
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{s.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-[4rem] blur-3xl -z-10 rotate-6 scale-90" />
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Roadmap</p>
                  <h3 className="text-2xl font-bold font-headline">Strategic Phase Mapping</h3>
                </div>
                <div className="space-y-4">
                  {["Lead Identification", "Creative Discussion", "Proposal Synthesis", "Pre-Production Lock", "Release Ready"].map((step, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{step}</span>
                      <CheckCircle2 className={`h-5 w-5 ${i < 3 ? 'text-primary' : 'text-slate-200'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="px-6 py-24 md:py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">The 5-Step Production Velocity</h2>
            <p className="text-slate-400 text-lg font-medium">How DP PM Tool accelerates your agency output.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { num: "01", title: "Capture", desc: "Qualify leads from all sources into a unified sales node." },
              { num: "02", title: "Synthesize", desc: "Generate AI-powered proposals and investment briefs." },
              { num: "03", title: "Execute", desc: "Structured task roadmaps for Pre, Pro, and Post stages." },
              { num: "04", title: "Deploy", desc: "Manage release approvals and publishing schedules." },
              { num: "05", title: "Scale", desc: "Track ROI, revenue forecasts, and performance metrics." }
            ].map((step, i) => (
              <div key={i} className="space-y-6 group">
                <div className="text-6xl font-bold font-headline text-white/5 group-hover:text-primary/20 transition-colors">{step.num}</div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold">{step.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12 text-center">
            <Button asChild className="h-16 px-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-base shadow-2xl shadow-primary/10 transition-all active:scale-95">
              <Link href="/book-demo">See It In Action – Book Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5: Modules Preview */}
      <section className="px-6 py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 tracking-tight">Authoritative Modules</h2>
              <p className="text-slate-500 font-medium text-lg">Integrated tools for every organizational tier.</p>
            </div>
            <Button asChild variant="ghost" className="text-primary font-bold text-sm uppercase tracking-widest gap-2">
              <Link href="/modules">Explore All Modules <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: GitBranch, title: "Sales & CRM", desc: "Lead scoring, pipeline automation, and conversion tracking." },
              { icon: Zap, title: "Smart Proposals", desc: "AI synthesis of creative briefs into high-stakes project bids." },
              { icon: Briefcase, title: "Production Management", desc: "Roadmap architecture for end-to-end production cycles." },
              { icon: Users, title: "Talent Library", desc: "Centralized marketplace for influencers, anchors, and crew." },
              { icon: Layers, title: "Workflow Builder", desc: "Node-based system for custom stage transitions and access." },
              { icon: Globe, title: "Social Manager", desc: "Release tracking and platform performance monitoring." },
              { icon: ShieldCheck, title: "AI Media Tools", desc: "Ready for GenAI production workflows and synthetic media." }
            ].map((m, i) => (
              <Card key={i} className="p-10 border-none shadow-sm bg-slate-50 rounded-[2.5rem] group hover:bg-white hover:shadow-xl transition-all">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                  <m.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{m.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">{m.desc}</p>
                <Button asChild variant="link" className="p-0 h-auto text-primary font-bold text-[10px] uppercase tracking-widest">
                  <Link href="/modules">Learn More</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Industries */}
      <section className="px-6 py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 tracking-tight">Built for Every High-Growth Vertical</h2>
            <p className="text-slate-500 font-medium text-lg">Specialized intelligence for the creative economy.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              "Ad Agencies", "Production Houses", "Influencer Agencies", "Content Studios", "Film Units", "AI Media Startups"
            ].map((ind, i) => (
              <Card key={i} className="p-6 rounded-[2rem] border-none shadow-sm bg-white flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1 transition-all">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">{ind}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Demo CTA */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto rounded-[4rem] bg-slate-900 p-12 md:p-24 relative overflow-hidden text-center text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">See How It Transforms Your Workflow</h2>
              <p className="text-slate-400 text-lg font-medium">Join a 20-minute live walkthrough with our product experts.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto pt-4">
              {[
                { icon: Play, text: "Live walkthrough" },
                { icon: Users, text: "Q&A session" },
                { icon: CheckCircle2, text: "No commitment" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
            <Button asChild className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-2xl transition-all active:scale-95">
              <Link href="/book-demo">Book Free Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 8: Pricing Preview */}
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 tracking-tight">Simple, Growth-First Pricing</h2>
            <p className="text-slate-500 font-medium text-lg">Scalable plans for every stage of your production agency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: "Starter", price: "Free", desc: "For independent producers and small startups.", features: ["5 Active Projects", "Talent Library Access", "Basic CRM"] },
              { name: "Pro", price: "Custom", desc: "For growing production houses and ad agencies.", features: ["Unlimited Projects", "AI Proposal Generator", "Workflow Builder", "Advanced Analytics"], highlight: true },
              { name: "Enterprise", price: "Contact", desc: "Full organizational engine for large media conglomerates.", features: ["White-labeled Portal", "Custom Integrations", "SLA Support", "Dedicated Strategist"] }
            ].map((plan, i) => (
              <Card key={i} className={`p-12 border-none shadow-sm rounded-[3rem] bg-white relative flex flex-col justify-between ${plan.highlight ? 'ring-2 ring-primary shadow-xl scale-105 z-10' : ''}`}>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.desc}</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-4xl font-bold font-headline text-slate-900">{plan.price}</p>
                    <div className="h-px w-full bg-slate-50" />
                    <ul className="space-y-4">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button asChild variant={plan.highlight ? "default" : "outline"} className={`mt-12 h-14 rounded-xl font-bold text-xs uppercase tracking-widest w-full ${plan.highlight ? 'shadow-xl shadow-primary/20' : ''}`}>
                  <Link href="/book-demo">Book Demo</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section className="px-6 py-24 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Everything you need to know about the platform.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Is this only for media companies?", a: "While built for media production, our phase-based workflow is highly adaptable for any agency requiring structured client engagement and post-production management." },
              { q: "Can we customize workflow?", a: "Yes. Our Workflow Builder module allows you to define custom stages, permissions, and transitions using a node-based architecture." },
              { q: "Does it support AI production?", a: "Absolutely. We have specialized modules for GenAI content tracking, background synthesis management, and virtual character workflows." },
              { q: "Can we manage influencers?", a: "The system includes a dedicated Talent Library where you can track reach, rank, and collaboration history for influencers and anchors." },
              { q: "Is it Firebase deployable?", a: "DP PM TOOL is built on a modern Firebase-centric stack, ensuring high performance, real-time sync, and enterprise-grade security." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-slate-100 px-4">
                <AccordionTrigger className="text-sm font-bold text-slate-900 py-6 hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-500 font-medium leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Section 10: Final CTA */}
      <section className="px-6 py-24 md:py-32 bg-slate-50">
        <div className="max-w-5xl mx-auto p-12 md:p-24 rounded-[4rem] bg-primary text-white text-center space-y-10 relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(46,134,193,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight relative z-10">Structure Your Media Business Like a Production Powerhouse.</h2>
          <div className="relative z-10">
            <Button asChild className="h-16 px-12 rounded-2xl bg-white text-primary hover:bg-slate-50 font-bold text-lg shadow-2xl transition-all active:scale-95">
              <Link href="/book-demo">Book Your Demo Now</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
