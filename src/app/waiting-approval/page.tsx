"use client";

import React from "react";
import { Hourglass, Zap, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function WaitingApprovalPage() {
  const auth = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#fcfcfe] flex flex-col font-body">
      <nav className="w-full h-20 px-8 lg:px-20 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP MediaFlow</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-12 text-center space-y-10">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-[2.5rem] bg-orange-50 flex items-center justify-center relative">
              <Hourglass className="h-10 w-10 text-orange-500 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-orange-500 text-white border-none uppercase text-[8px] font-bold px-2 py-1 rounded-lg">RESTRICTED</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold font-headline text-slate-900 tracking-tight leading-tight">Access Pending Authorization</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Your identity has been registered in the organizational repository. A system administrator must now authorize your strategic role and phase-level permits before your workspace is provisioned.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest gap-2 bg-slate-50 border-slate-100 hover:bg-slate-100">
              <RotateCcw className="h-4 w-4" /> Refresh Permit Status
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth)} className="w-full h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-900 text-xs uppercase tracking-widest gap-2">
              <LogOut className="h-4 w-4" /> Switch Identity
            </Button>
          </div>

          <div className="pt-10 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Permit Engine v2.8 • Dotspace Center</p>
          </div>
        </Card>
      </main>
    </div>
  );
}