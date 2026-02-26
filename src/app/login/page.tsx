"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Hourglass,
  ShieldBan,
  Eye,
  EyeOff,
  Zap,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview Premium Identity Governance Portal.
 * Protocol: Onboarding (Pending) -> Administrative Approval -> Activation (Active).
 * Master Account: defineperspective.in@gmail.com (Auto-Active)
 */

const MASTER_EMAIL = 'defineperspective.in@gmail.com';
const RESTRICTED_EMAIL = 'arunadhi.com@gmail.com';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const memberRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member, isLoading: isMemberLoading } = useDoc(memberRef);

  useEffect(() => {
    if (isUserLoading || isMemberLoading) return;

    if (user) {
      // 1. RESTRICTED IDENTIFIER BLOCK
      if (user.email?.toLowerCase() === RESTRICTED_EMAIL.toLowerCase()) {
        toast({ variant: "destructive", title: "Security Restriction", description: "This identifier has been restricted by system policy." });
        signOut(auth);
        setIsProcessing(false);
        return;
      }
      
      // 2. MASTER IDENTITY AUTO-ACTIVATION
      if (user.email?.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
        if (!member || member.status !== 'Active') {
          const masterRef = doc(db, "teamMembers", user.uid);
          setDocumentNonBlocking(masterRef, {
            id: user.uid,
            email: user.email,
            firstName: "Master",
            lastName: "Administrator",
            status: "Active",
            type: "In-house",
            roleId: "root-admin",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        router.push("/");
        return;
      }

      // 3. STANDARD IDENTITY LIFECYCLE
      if (member) {
        if (member.status === "Active") {
          router.push("/");
        } else {
          setIsProcessing(false);
        }
      } else if (user.email && !isProvisioning) {
        setIsProvisioning(true);
        const nameParts = (user.displayName || "New Expert").split(' ');
        const newMemberRef = doc(db, "teamMembers", user.uid);
        
        setDocumentNonBlocking(newMemberRef, {
          id: user.uid,
          email: user.email,
          firstName: nameParts[0] || "New",
          lastName: nameParts.slice(1).join(' ') || "User",
          thumbnail: user.photoURL || "",
          status: "Pending", 
          type: "In-house",
          roleId: "staff", 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  }, [user, isUserLoading, member, isMemberLoading, router, db, auth, isProvisioning]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (email.toLowerCase() === RESTRICTED_EMAIL.toLowerCase()) {
      toast({ variant: "destructive", title: "Security Restriction", description: "Identifier restricted." });
      return;
    }

    setIsProcessing(true);
    const authPromise = mode === "login" 
      ? initiateEmailSignIn(auth, email, password)
      : initiateEmailSignUp(auth, email, password);

    authPromise.catch((err: any) => {
      toast({ variant: "destructive", title: "Authentication Failed", description: err.message });
      setIsProcessing(false);
    });
  };

  const handleGoogleAuth = () => {
    setIsProcessing(true);
    initiateGoogleSignIn(auth).catch((err) => {
      toast({ variant: "destructive", title: "Authentication Error", description: err.message });
      setIsProcessing(false);
    });
  };

  if (isUserLoading || (user && isMemberLoading)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
          <Zap className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Core...</p>
      </div>
    );
  }

  if (user && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-10">
        <div className="relative">
          <div className="h-32 w-32 rounded-[3.5rem] bg-white flex items-center justify-center shadow-2xl">
            <Hourglass className="h-14 w-14 text-orange-500 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-50">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Your identity has been provisioned. Full entry requires administrative validation by a Root Authority.</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-white border-slate-200">Switch Identity</Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-2xl font-bold text-primary text-[10px] uppercase tracking-widest gap-2"><RotateCcw className="h-4 w-4" /> Refresh Status</Button>
        </div>
      </div>
    );
  }

  if (user && member?.status === "Suspended") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-10">
        <div className="h-32 w-32 rounded-[3.5rem] bg-red-50 flex items-center justify-center shadow-2xl border border-red-100">
          <ShieldBan className="h-14 w-14 text-red-500" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold font-headline text-slate-900">Security Notice</h1>
          <p className="text-sm text-slate-500 font-medium max-w-xs">Your organizational access has been suspended by system policy.</p>
        </div>
        <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-white w-full max-w-xs">Return to Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row relative overflow-hidden font-body">
      {/* Hero Pane */}
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center p-20">
        <div 
          className="absolute inset-0 bg-[url('https://picsum.photos/seed/studio-vibe/1600/1200')] bg-cover bg-center opacity-20 grayscale brightness-50" 
          data-ai-hint="production studio"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
        
        <div className="relative z-10 space-y-12 max-w-xl">
          <div className="flex items-center gap-6 group">
            <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 duration-500">
              <Zap className="h-10 w-10 text-white fill-white" />
            </div>
            <h2 className="text-4xl font-bold font-headline text-white tracking-tighter">DP MediaFlow</h2>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-6xl font-bold text-white tracking-tight leading-[1.1] font-headline">
              Premium Agency <span className="text-primary">Operations.</span>
            </h3>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
              Orchestrate your crew, automate your billing, and scale production throughput with consolidated intelligence.
            </p>
          </div>

          <div className="flex items-center gap-10 pt-10">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-headline">100%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-headline">AI</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enhanced</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-headline">∞</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Throughput</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Pane */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-slate-50/30">
        <div className="w-full max-w-[440px] space-y-10">
          <div className="space-y-3 text-center lg:text-left">
            <h2 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">
              {mode === 'login' ? 'System Portal' : 'Onboard Profile'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {mode === 'login' ? 'Authorize your session to access organizational intel.' : 'Initiate your professional profile for validation.'}
            </p>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] bg-white overflow-hidden border border-slate-100/50">
            <CardContent className="p-8 sm:p-12 space-y-10">
              <Button 
                variant="outline" 
                onClick={handleGoogleAuth} 
                disabled={isProcessing} 
                className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 font-bold text-[11px] uppercase tracking-widest gap-3 shadow-sm transition-all active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-300">Credentials</span></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Identifier</Label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="expert@mediaflow.internal" 
                        className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20 placeholder:text-slate-300" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Passphrase</Label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="h-14 rounded-2xl bg-slate-50 border-none pl-14 pr-14 font-bold text-base shadow-inner focus-visible:ring-primary/20 placeholder:text-slate-300" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] group"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Authorize Session' : 'Request Onboarding'} 
                      <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                  className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-all"
                >
                  {mode === 'login' ? "Don't have an identity? Provision here" : "Return to System Portal"}
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Identity Governance Protocol v4.2
          </p>
        </div>
      </div>
    </div>
  );
}
