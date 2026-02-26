
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Modules", href: "/modules" },
  { label: "Industries", href: "/industries" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
          <Zap className="h-4 w-4 text-white fill-white" />
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP PM TOOL</span>
      </Link>

      <div className="hidden lg:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
              pathname === link.href ? "text-primary" : "text-slate-400 hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
          Login
        </Link>
        <Button asChild className="hidden sm:flex h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Link href="/book-demo">Book a Demo</Link>
        </Button>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-none shadow-2xl">
              <div className="p-8 space-y-10 flex flex-col h-full bg-white">
                <SheetHeader>
                  <SheetTitle className="text-left font-headline font-bold text-xl">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                        pathname === link.href ? "text-primary" : "text-slate-400"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Login
                  </Link>
                </div>
                <div className="mt-auto">
                  <Button asChild className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-xl">
                    <Link href="/book-demo">Book Free Demo</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
