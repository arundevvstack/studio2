
"use client";

import React from "react";
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  SendHorizontal,
  Instagram,
  Linkedin,
  Globe,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

/**
 * @fileOverview Contact Node.
 * Public gateway for agency inquiries and strategic partnerships.
 */

export default function ContactPage() {
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

      <main className="pt-32 pb-20 px-8 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Connect Hub</Badge>
              <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-tight">
                Let's <span className="text-primary">Collaborate</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Initiate a strategic production discussion. Whether it's a global TVC or a localized performance campaign, we are ready to synthesize.
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Hotline</p>
                  <p className="text-base font-bold text-slate-900">+91 871 400 5550</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headquarters</p>
                  <p className="text-base font-bold text-slate-900 leading-snug max-w-xs">Dotspace Business Center, Kowdiar, Trivandrum, KL</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex gap-6">
              <Link href="#" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all"><Linkedin className="h-5 w-5" /></Link>
              <Link href="#" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all"><Globe className="h-5 w-5" /></Link>
            </div>
          </div>

          <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-4 duration-700">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] p-12 bg-white space-y-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-headline tracking-tight">Project Inquiry</h3>
                <p className="text-sm text-slate-400 font-medium">Briefly outline your objectives and our team will synthesize a response within 24h.</p>
              </div>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <Input placeholder="John Doe" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <Input type="email" placeholder="j.doe@nike.com" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Organization / Brand</label>
                  <Input placeholder="Company Name" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategic Brief</label>
                  <Textarea placeholder="Outline your vision..." className="min-h-[150px] rounded-[2rem] bg-slate-50 border-none shadow-inner p-8 text-base font-medium resize-none" />
                </div>
                <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3">
                  Transmit Inquiry <SendHorizontal className="h-5 w-5" />
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
