
"use client";

import React from "react";
import { 
  Zap, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Code,
  LayoutGrid,
  ChevronRight,
  Database,
  ArrowUpRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * @fileOverview Documentation Hub.
 * Public documentation regarding DP MediaFlow platform and operations.
 */

const DOC_SECTIONS = [
  {
    title: "Platform Overview",
    icon: LayoutGrid,
    items: ["Getting Started", "Interface Navigation", "Mobile Access"]
  },
  {
    title: "Production Workflow",
    icon: TrendingUp,
    items: ["Proposal Synthesis", "Project Lifecycle", "Client Approval Gate"]
  },
  {
    title: "Resource Management",
    icon: Users,
    items: ["Talent Library Onboarding", "Internal Team Roles", "Expert Verification"]
  },
  {
    title: "Financial Standards",
    icon: Database,
    items: ["Invoice Generation", "GST Compliance", "Revenue Forecasting"]
  }
];

export default function DocumentationPage() {
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
          <Link href="/portfolio" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Portfolio</Link>
          <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-primary">Portal</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8 md:px-20 max-w-7xl mx-auto space-y-20">
        <div className="max-w-2xl space-y-4">
          <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Operational Intel</Badge>
          <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-tight">
            Knowledge <span className="text-blue-600">Base</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            The authoritative guide to DP MediaFlow's operating system. Learn how we synthesize high-fidelity media assets at strategic speeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {DOC_SECTIONS.map((section, i) => (
            <Card key={i} className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white overflow-hidden p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <section.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold font-headline text-slate-900">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <Link key={idx} href="#" className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                    <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{item}</span>
                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="p-12 md:p-20 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Need technical support?</h2>
            <p className="text-sm text-slate-500 font-medium">If you are encountering system anomalies or need developer-level documentation, please contact our support node.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
              System Health <ArrowUpRight className="h-3 w-3" />
            </Button>
            <Button className="h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-slate-900 text-white shadow-xl shadow-slate-200">
              Submit Ticket
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
