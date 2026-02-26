
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  SendHorizontal, 
  Loader2, 
  Calendar, 
  ShieldCheck, 
  Zap,
  Users,
  MessageSquare
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BookDemoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: "Demo Transmitted", description: "Our product strategist will synchronize a time within 24h." });
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-1000 font-body pb-32">
      <section className="px-6 py-20 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Live Briefing</Badge>
              <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-tight">Schedule Your <span className="text-primary">Live Demo</span></h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Experience the system that structures high-fidelity media production. See how we can transform your organization's creative output.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: ShieldCheck, title: "Live system walkthrough", desc: "A tailored tour of modules relevant to your vertical." },
                { icon: Zap, title: "Workflow consultation", desc: "Expert advice on structuring your organizational logic." },
                { icon: Users, title: "Custom use-case discussion", desc: "Deep dive into your agency's specific bottlenecks." }
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary shrink-0">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{b.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] p-12 bg-white space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] -mr-24 -mt-24 rounded-full" />
              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-bold font-headline tracking-tight">Provision Consultation</h3>
                <p className="text-sm text-slate-400 font-medium">Transmitting your request triggers a priority executive callback.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Identity Name</Label>
                    <Input placeholder="John Doe" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Executive Email</Label>
                    <Input type="email" placeholder="j.doe@nike.com" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Organization / Brand</Label>
                    <Input placeholder="Company Name" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hotline Number</Label>
                    <Input placeholder="+91 0000 0000" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Company Size</Label>
                    <Input placeholder="e.g. 10-50 Experts" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Preferred Node Sync (Date)</Label>
                    <div className="relative">
                      <Input type="date" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold appearance-none" required />
                      <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <Button disabled={isSubmitting} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Transmit Request <SendHorizontal className="h-5 w-5" /></>}
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </section>
    </div>
  );
}
