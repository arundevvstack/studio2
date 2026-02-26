
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    desc: "For independent producers and micro-studios.",
    features: [
      "Up to 5 Active Projects",
      "Lead Identification Hub",
      "Basic Proposal Generator",
      "Talent Library (Read-only)",
      "Standard Dashboard",
      "Email Support"
    ],
    cta: "Start for Free"
  },
  {
    name: "Pro",
    price: "Custom",
    desc: "For growing agencies needing full automation.",
    features: [
      "Unlimited Production Entities",
      "AI Strategic Synthesis Engine",
      "Workflow Builder (Full Access)",
      "Financial Forecasting Hub",
      "Revenue Intelligence Charts",
      "Priority Executive Support",
      "Talent Library (Full Access)"
    ],
    highlight: true,
    cta: "Book a Demo"
  },
  {
    name: "Enterprise",
    price: "Contact",
    desc: "For media houses requiring dedicated nodes.",
    features: [
      "White-labeled Organizational Portal",
      "Custom Data Residency",
      "Multi-Org Hierarchy Access",
      "SLA Verified Uptime",
      "Dedicated Product Strategist",
      "Custom API Access",
      "On-site Training Session"
    ],
    cta: "Contact Sales"
  }
];

export default function PricingPage() {
  return (
    <div className="animate-in fade-in duration-1000 font-body">
      <section className="px-6 py-24 md:py-32 bg-[#fcfcfe]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="bg-primary/5 text-primary border-none rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Scalable Investment
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-none">
            Simple, <span className="text-primary">Growth-First</span> Pricing
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Our pricing models are designed to align with your organization's throughput, ensuring low entry costs and high operational scalability.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
          {PLANS.map((plan, i) => (
            <Card key={i} className={`p-12 border-none shadow-xl shadow-slate-200/20 rounded-[3.5rem] bg-white relative flex flex-col justify-between ${plan.highlight ? 'ring-4 ring-primary/10 shadow-2xl scale-105 z-10' : ''}`}>
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white border-none px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl">Recommended</Badge>
                </div>
              )}
              <div className="space-y-10">
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold font-headline text-slate-900">{plan.name}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.desc}</p>
                </div>
                <div className="space-y-6">
                  <p className="text-5xl font-bold font-headline text-slate-900">{plan.price}</p>
                  <div className="h-px w-full bg-slate-50" />
                  <ul className="space-y-5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button asChild className={`mt-12 h-16 rounded-2xl font-bold text-sm uppercase tracking-widest w-full transition-all active:scale-95 ${plan.highlight ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-900 hover:bg-slate-100 shadow-none'}`}>
                <Link href="/book-demo">{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-900 tracking-tight">Need an Enterprise Analysis?</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">For organizations requiring a private cloud node, multi-tier access, or custom SLA protocols, our team provides a specialized deployment briefing.</p>
          </div>
          <Button asChild variant="outline" className="h-16 px-12 rounded-2xl border-slate-200 bg-white text-slate-900 font-bold text-base shadow-sm gap-3">
            <Link href="/contact">Inquire for Enterprise <ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
