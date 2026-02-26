"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Hourglass,
  Eye,
  EyeOff,
  Zap,
  RotateCcw,
  X,
  Globe,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import Link from "next/link";

/**
 * @fileOverview High-Fidelity Strategic Identity Governance Portal.
 * Updated to align logo with form content and use Inter font exclusively.
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
      if (user.email?.toLowerCase() === RESTRICTED_EMAIL.toLowerCase()) {
        toast({ variant: "destructive", title: "Security Restriction", description: "Identifier restricted." });
        signOut(auth);
        setIsProcessing(false);
        return;
      }
      
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
        router.push("/dashboard");
        return;
      }

      if (member) {
        if (member.status === "Active") {
          router.push("/dashboard");
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Identity...</p>
      </div>
    );
  }

  if (user && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl p-16 max-w-lg w-full flex flex-col items-center text-center space-y-10">
          <div className="h-24 w-24 rounded-[2rem] bg-orange-50 flex items-center justify-center shadow-xl">
            <Hourglass className="h-10 w-10 text-orange-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your identity is provisioned. Entry requires administrative validation from the Root Node.</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest border-slate-100 bg-slate-50 hover:bg-slate-100">Switch Identity</Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-2xl font-bold text-primary text-xs uppercase tracking-widest gap-2"><RotateCcw className="h-4 w-4" /> Refresh Status</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-10 flex items-center justify-center font-body selection:bg-primary/10">
      <div className="max-w-7xl w-full min-h-[85vh] bg-white rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
        
        {/* Left Pane - Cinematic Visuals */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden p-16 flex-col justify-between text-white">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://picsum.photos/seed/production-depth/1200/1200" 
              alt="Cinematic Background" 
              className="w-full h-full object-cover"
              data-ai-hint="abstract fluid"
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">A Wise Quote</span>
            <div className="h-px w-24 bg-white/30" />
          </div>

          <div className="relative z-10 space-y-6 max-w-md">
            <h2 className="text-6xl font-bold font-headline leading-tight tracking-tight">
              Get Everything You Want
            </h2>
            <p className="text-sm font-medium leading-relaxed text-white/80">
              You can get everything you want if you work hard, trust the process, and stick to the plan.
            </p>
          </div>
        </div>

        {/* Right Pane - Authentication Engine */}
        <div className="w-full lg:w-1/2 bg-white p-8 md:p-20 flex flex-col justify-center relative">
          
          <div className="max-w-sm mx-auto w-full space-y-10">
            {/* Brand Identity - Aligned Left with content */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">DP MediaFlow</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Join the System'}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Enter your email and password to access your account
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Email</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium shadow-inner focus-visible:ring-primary/20" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Password</Label>
                    {mode === 'login' && (
                      <button type="button" className="text-[10px] font-bold uppercase text-slate-400 hover:text-primary transition-colors">
                        Forgot Password
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your password" 
                      className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium shadow-inner focus-visible:ring-primary/20" 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 px-1">
                <Checkbox id="remember" className="rounded-md border-slate-200 data-[state=checked]:bg-black data-[state=checked]:border-black" />
                <label htmlFor="remember" className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              <div className="space-y-4 pt-4">
                <Button type="submit" disabled={isProcessing} className="w-full h-12 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-xl shadow-black/10">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Register')}
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleGoogleAuth} 
                  variant="outline" 
                  className="w-full h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sign in with Google</span>
                </Button>
              </div>
            </form>

            <div className="pt-8 text-center border-t border-slate-50">
              <p className="text-xs font-medium text-slate-400">
                {mode === 'login' ? "Don't have an account?" : "Already provisioned?"}{' '}
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-slate-900 font-bold hover:underline">
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
