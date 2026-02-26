"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Fingerprint,
  Hourglass,
  ShieldBan,
  Shield as ShieldIcon,
  Eye,
  EyeOff,
  Zap,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn,
  initiatePasswordReset,
  initiateAnonymousSignIn
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview Standardized Identity Governance Portal.
 * Protocol: Onboarding (Pending) -> Administrative Approval -> Activation (Active).
 * Master Account: defineperspective.in@gmail.com (Auto-Active)
 * Restricted Account: arunadhi.com@gmail.com (Blocked & Purged)
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

      // 2. ROOT ADMINISTRATOR PROTOCOL (ANONYMOUS)
      if (user.isAnonymous) {
        const rootRef = doc(db, "teamMembers", user.uid);
        setDocumentNonBlocking(rootRef, {
          id: user.uid,
          email: "anonymous-root@mediaflow.internal",
          firstName: "Root",
          lastName: "Administrator",
          status: "Active",
          type: "System",
          roleId: "root-admin",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        router.push("/");
        return;
      }
      
      // 3. MASTER IDENTITY AUTO-ACTIVATION
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

      // 4. STANDARD IDENTITY LIFECYCLE
      if (member) {
        if (member.status === "Active") {
          router.push("/");
        } else {
          setIsProcessing(false);
        }
      } else if (user.email && !isProvisioning) {
        // PROVISION NEW PENDING IDENTITY
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
        <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Credentials...</p>
      </div>
    );
  }

  if (user && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-10">
        <div className="h-32 w-32 rounded-[3.5rem] bg-orange-50 flex items-center justify-center shadow-2xl">
          <Hourglass className="h-14 w-14 text-orange-500 animate-pulse" />
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-4xl font-bold font-headline text-slate-900">Access Pending</h1>
          <p className="text-sm text-slate-500 font-medium">Your identity is registered. Entry requires activation by a Root Administrator.</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest bg-white">Switch Identity</Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-2xl font-bold text-primary text-[10px] uppercase tracking-widest"><RotateCcw className="h-4 w-4 mr-2" /> Refresh Status</Button>
        </div>
      </div>
    );
  }

  if (user && member?.status === "Suspended") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-10">
        <div className="h-32 w-32 rounded-[3.5rem] bg-red-50 flex items-center justify-center shadow-2xl">
          <ShieldBan className="h-14 w-14 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold font-headline text-slate-900">Security Restriction</h1>
        <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest bg-white w-full max-w-xs">Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row relative overflow-hidden font-body">
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/login-bg/1200/1200')] bg-cover bg-center opacity-10 grayscale" />
        <div className="relative z-10 space-y-12 max-w-xl">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-[1.2rem] bg-primary flex items-center justify-center shadow-2xl"><Zap className="h-10 w-10 text-white fill-white" /></div>
            <h2 className="text-4xl font-bold font-headline text-white tracking-tighter">DP MediaFlow</h2>
          </div>
          <h3 className="text-5xl font-bold text-white tracking-tight leading-[1.1]">Premium Agency Operations</h3>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">Consolidated intelligence for media agencies. Orchestrate your crew, automate your billing, and scale your production throughput.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-[440px] space-y-10">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-headline text-slate-900">{mode === 'login' ? 'System Sign In' : 'Onboard Identity'}</h2>
            <p className="text-sm text-slate-500 font-medium">{mode === 'login' ? 'Identify yourself to access organizational intelligence.' : 'Register your profile for administrative validation.'}</p>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden border border-slate-50">
            <CardContent className="p-8 sm:p-10 space-y-8">
              <div className="space-y-4">
                <Button variant="outline" onClick={handleGoogleAuth} disabled={isProcessing} className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 font-bold text-sm gap-3 shadow-sm">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </Button>
                <Button variant="outline" onClick={() => initiateAnonymousSignIn(auth)} disabled={isProcessing} className="w-full h-14 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm gap-3"><ShieldIcon className="h-5 w-5" /> Root Administrator</Button>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email</label>
                    <div className="relative group"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="expert@agency.com" className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20" /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label></div>
                    <div className="relative group"><Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary" /><Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 border-none pl-14 pr-14 font-bold text-base shadow-inner focus-visible:ring-primary/20" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-primary">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                  </div>
                </div>
                <Button type="submit" disabled={isProcessing} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest transition-all group">{isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{mode === 'login' ? 'Authorize Session' : 'Request Onboarding'} <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1" /></>}</Button>
              </form>
              <div className="text-center"><button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-all">{mode === 'login' ? "Provision New Identity" : "Return to Sign In"}</button></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
