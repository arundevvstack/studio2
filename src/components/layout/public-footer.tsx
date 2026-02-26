
"use client";

import React from "react";
import Link from "next/link";
import { Zap, Instagram, Linkedin, Globe, Mail, Phone, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 px-6 md:px-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP PM TOOL</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            The authoritative project management engine for media production, ad agencies, and content studios.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Platform</h4>
          <div className="flex flex-col gap-4">
            <Link href="/how-it-works" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">How It Works</Link>
            <Link href="/modules" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Modules</Link>
            <Link href="/industries" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Industries</Link>
            <Link href="/pricing" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Pricing</Link>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Company</h4>
          <div className="flex flex-col gap-4">
            <Link href="/about" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Our Vision</Link>
            <Link href="/resources" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Resources</Link>
            <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Contact</Link>
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Portal Access</Link>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Contact</h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-slate-300 mt-0.5" />
              <span className="text-sm font-bold text-slate-600">hello@dpmediaflow.com</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-slate-300 mt-0.5" />
              <span className="text-sm font-bold text-slate-600">+91 871 400 5550</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-300 mt-0.5" />
              <span className="text-sm font-bold text-slate-600 leading-tight">Dotspace Center, Kowdiar,<br/>Trivandrum, KL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          © 2026 DP MediaFlow Systems. All Rights Reserved.
        </p>
        <div className="flex gap-8">
          <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
