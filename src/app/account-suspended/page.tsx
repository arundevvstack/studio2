"use client";

import React from "react";
import { ShieldX, AlertTriangle, Zap, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function AccountSuspendedPage() {
  const auth = useAuth();

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-body">
      <nav className="w-full h-20 px-8 lg:px-20 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP MediaFlow</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full bg-white border-2 border-red-50 shadow-2xl rounded-[3rem] p-12 text-center space-y-10">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-[2.5rem] bg-red-50 flex items-center justify-center relative">
              <ShieldX className="h-10 w-10 text-red-500" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-red-600 text-white border-none uppercase text-[8px] font-bold px-2 py-1 rounded-lg">REVOKED</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h1 className="text-3xl font-bold font-headline tracking-tight leading-tight">Access Suspended</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Your strategic permit has been revoked by the system administrator. You no longer have authorization to probe the production repository or access the Intelligence Hub.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <Button asChild className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest gap-2">
              <a href="mailto:hello@dpmediaflow.com">
                <MessageSquare className="h-4 w-4" /> Contact Governance Node
              </a>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth)} className="w-full h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-900 text-xs uppercase tracking-widest gap-2">
              <LogOut className="h-4 w-4" /> Logout Session
            </Button>
          </div>

          <div className="pt-10 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Protocol Breach Protection • Identity Purged</p>
          </div>
        </Card>
      </main>
    </div>
  );
}