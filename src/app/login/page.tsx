
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateAnonymousSignIn, 
  initiateEmailSignIn, 
  initiateEmailSignUp 
} from "@/firebase/non-blocking-login";
import { doc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview Executive Entry Portal.
 * Provides high-fidelity authentication workflows and a specialized Root Access bypass.
 */

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch brand assets for the login portal
  const billingRef = useMemoFirebase(() => doc(db, "companyBillingSettings", "global"), [db]);
  const { data: globalSettings } = useDoc(billingRef);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Incomplete Credentials", description: "Please provide both executive email and secure password." });
      return;
    }
    
    setIsProcessing(true);
    try {
      if (mode === "login") {
        initiateEmailSignIn(auth, email, password);
      } else {
        initiateEmailSignUp(auth, email, password);
      }
      // Redirect handled by useEffect on user state change
    } catch (err: any) {
      toast({ variant: "destructive", title: "Authentication Failure", description: err.message });
      setIsProcessing(false);
    }
  };

  const handleRootAccess = () => {
    setIsProcessing(true);
    toast({ title: "Authorizing Root Identity", description: "Provisioning full-tier administrative access..." });
    initiateAnonymousSignIn(auth);
  };

  if (isUserLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Security Matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -mr-96 -mt-96 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[100px] rounded-full -ml-72 -mb-72 animate-pulse" />

      <div className="w-full max-w-[480px] space-y-10 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-24 w-auto flex items-center justify-center">
            {globalSettings?.logo ? (
              <img src={globalSettings.logo} alt="Organization Logo" className="h-full w-auto object-contain" />
            ) : (
              <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                <Zap className="h-10 w-10 text-white fill-white" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Executive Workspace</h1>
            <p className="text-sm text-slate-500 font-medium tracking-normal">Authorize your identity to manage global production assets.</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Executive Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul.n@agency.com" 
                      className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Secure Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isProcessing}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    {mode === 'login' ? 'Continue Workspace' : 'Initialize Account'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Strategic Bypass</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Button 
              variant="outline" 
              onClick={handleRootAccess}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl border-2 border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-bold text-xs uppercase tracking-widest gap-3 transition-all"
            >
              <ShieldCheck className="h-5 w-5" />
              Root Administrator Access
            </Button>

            <div className="text-center">
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
              >
                {mode === 'login' ? "Don't have an identity? Request Provisioning" : "Existing Executive? Return to Login"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Kerala Infrastructure</span>
          </div>
          <p className="text-[10px] text-slate-300 font-medium tracking-normal text-center max-w-[300px]">
            This portal is restricted to authorized media production personnel. Unauthorized access attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}
