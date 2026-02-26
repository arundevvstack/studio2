
"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  SendHorizontal,
  Instagram,
  Linkedin,
  Globe,
  Loader2,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: "Inquiry Transmitted", description: "Strategic response pending within 24h." });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-body pb-32 animate-in fade-in duration-1000">
      <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Connect Hub</Badge>
              <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-tight">
                Initiate <span className="text-primary">Dialogue</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Whether you're a high-growth production house or a creative studio ready to structure your chaos, our strategists are standing by.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Intelligence</p>
                  <p className="text-base font-bold text-slate-900">hello@dpmediaflow.com</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Hotline</p>
                  <p className="text-base font-bold text-slate-900">+91 871 400 5550</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headquarters</p>
                  <p className="text-base font-bold text-slate-900 leading-snug max-w-xs">Dotspace Center, Kowdiar, Trivandrum, KL</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] p-12 bg-white space-y-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-headline tracking-tight">Project Inquiry</h3>
                <p className="text-sm text-slate-400 font-medium">Briefly outline your organizational needs and we'll synthesize a response.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <Input placeholder="John Doe" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <Input type="email" placeholder="j.doe@nike.com" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Organization / Brand</label>
                  <Input placeholder="Company Name" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategic Brief</label>
                  <Textarea placeholder="How can we help your production workflow?" className="min-h-[150px] rounded-[2rem] bg-slate-50 border-none shadow-inner p-8 text-base font-medium resize-none" required />
                </div>
                <Button disabled={isSubmitting} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Transmit Inquiry <SendHorizontal className="h-5 w-5" /></>}
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
