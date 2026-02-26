
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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
 * @fileOverview High-Fidelity Illustrative Identity Governance Portal.
 * Redesigned to match the requested aesthetic with 3D character and mesh gradients.
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
        toast({ variant: "destructive", title: "Security Restriction", description: "This identifier has been restricted by system policy." });
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
        router.push("/");
        return;
      }

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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f0f2f5] space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Identity...</p>
      </div>
    );
  }

  if (user && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-[#f0f2f5] flex items-center justify-center p-6">
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
    <div className="min-h-screen w-full bg-[#fcfcfe] relative overflow-hidden flex flex-col font-body selection:bg-primary/10">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-orange-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-100/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 md:px-20 py-8">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP MediaFlow</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Verticals</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Portfolio</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Globe className="h-3 w-3" />
            <span>English</span>
          </div>
          <div className="h-px w-4 bg-slate-200 hidden sm:block" />
          <button 
            onClick={() => setMode('login')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === 'login' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign in
          </button>
          <Button 
            onClick={() => setMode('signup')}
            className="h-10 px-6 rounded-full bg-white text-slate-900 border border-slate-100 shadow-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
          >
            Register
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-8 md:px-20 pb-20">
        <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold font-headline text-slate-900 tracking-tight leading-[1.1]">
                {mode === 'login' ? 'Sign In to' : 'Join the'} <br/>
                <span className="text-primary">{mode === 'login' ? 'System Portal' : 'Creative Engine'}</span>
              </h1>
              <p className="text-base text-slate-400 font-medium leading-relaxed max-w-sm">
                {mode === 'login' 
                  ? 'Authorize your session to access organizational intel and manage production assets.' 
                  : 'Initiate your professional identity request to join our premium production network.'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-slate-400">{mode === 'login' ? "if you don't have an identity" : "already provisioned?"}</span>
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Register here!' : 'Sign in here!'}
              </button>
            </div>
          </div>

          {/* Middle Illustration (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center relative h-[500px]">
            <div className="relative w-full h-full animate-in fade-in zoom-in duration-1000 delay-300">
              <img 
                src="https://picsum.photos/seed/creative-character/800/800" 
                alt="3D Character" 
                className="w-full h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.1)]"
                data-ai-hint="3d character"
              />
              {/* Subtle background glow behind character */}
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] -z-10" />
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
            <Card className="w-full max-w-[420px] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-10 space-y-10">
              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter Email" 
                      className="h-14 rounded-2xl bg-slate-50/50 border-none px-6 font-bold text-sm shadow-inner focus-visible:ring-primary/20 placeholder:text-slate-300 transition-all" 
                    />
                    <X className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200 cursor-pointer hover:text-slate-400" onClick={() => setEmail("")} />
                  </div>
                  <div className="relative group">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="h-14 rounded-2xl bg-slate-50/50 border-none px-6 font-bold text-sm shadow-inner focus-visible:ring-primary/20 placeholder:text-slate-300 transition-all" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <button type="button" className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-primary transition-colors">Recover Password?</button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Register'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.2em]"><span className="bg-white/40 backdrop-blur-sm px-4 text-slate-300">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={handleGoogleAuth}
                  className="h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </button>
                <button className="h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                  <svg className="h-5 w-5 fill-slate-900" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.96.95-2.21 1.72-3.72 1.72-2.14 0-3.64-1.33-4.64-2.62-1.32-1.7-2.14-4.24-2.14-6.67 0-3.83 2.44-5.88 4.78-5.88 1.18 0 2.1.42 2.8.88.64.43 1.1.88 1.46.88.36 0 .82-.45 1.46-.88.36 0 .82-.45 1.46-.88.7-.46 1.62-.88 2.8-.88 1.8 0 3.44 1.04 4.22 2.62-3.6.1-4.22 2.62-4.22 3.82 0 1.2.62 3.72 4.22 3.82-.38 1.14-1.06 2.3-2.02 3.3zM12.03 6.83c0-2.3 1.88-4.18 4.18-4.18.05 0 .1 0 .15.01-.1 2.35-2.03 4.17-4.18 4.17h-.15z" />
                  </svg>
                </button>
                <button className="h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                  <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
