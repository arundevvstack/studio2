
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Loader2, 
  Hourglass,
  Eye, 
  EyeOff,
  Zap,
  RotateCcw,
  Globe,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const MASTER_EMAIL = 'defineperspective.in@gmail.com';

/**
 * @fileOverview Strategic Permit Gated Login.
 * New sign-ups are placed in "Pending" status and blocked until Admin approval.
 */
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

  // Fetch permit status from registry
  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: userData, isLoading: isUserRegistryLoading } = useDoc(userRef);

  useEffect(() => {
    if (user && !isUserRegistryLoading) {
      // 1. Check if user exists in registry
      if (!userData) {
        // One-time auto-provision for Master Node
        if (user.email?.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
          const masterRef = doc(db, "users", user.uid);
          setDoc(masterRef, {
            id: user.uid,
            name: user.displayName || "Master Administrator",
            email: user.email.toLowerCase(),
            role: "admin",
            permittedPhases: ["sales", "production", "release", "socialMedia"],
            strategicPermit: true,
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          router.push("/dashboard");
        } else {
          // Provision baseline pending identity
          const newRef = doc(db, "users", user.uid);
          setDoc(newRef, {
            id: user.uid,
            name: user.displayName || "New Expert",
            email: user.email?.toLowerCase(),
            role: null,
            permittedPhases: [],
            strategicPermit: false,
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast({ title: "Registry Entry Created", description: "Awaiting Strategic Permit from Root Node." });
        }
        return;
      }

      // 2. Validate Permit
      if (userData.status === "active" && userData.strategicPermit === true) {
        router.push("/dashboard");
      } else {
        // If not active, the UI below will show the restricted barrier
        setIsProcessing(false);
      }
    }
  }, [user, userData, isUserRegistryLoading, router, db]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsProcessing(true);
    const authPromise = mode === "login" 
      ? initiateEmailSignIn(auth, email.toLowerCase(), password)
      : initiateEmailSignUp(auth, email.toLowerCase(), password);

    authPromise.catch((err: any) => {
      toast({ variant: "destructive", title: "Auth Failed", description: err.message });
      setIsProcessing(false);
    });
  };

  const handleGoogleAuth = async () => {
    setIsProcessing(true);
    try {
      await initiateGoogleSignIn(auth);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Google Auth Error", description: err.message });
      }
      setIsProcessing(false);
    }
  };

  if (isUserLoading || (user && isUserRegistryLoading)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Strategic Permit...</p>
      </div>
    );
  }

  // ACCESS BARRIER: For authenticated users without a valid permit
  if (user && userData && (userData.status !== "active" || !userData.strategicPermit)) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-2xl p-12 max-w-lg w-full flex flex-col items-center text-center space-y-10">
          <div className="h-24 w-24 rounded-[2.5rem] bg-orange-50 flex items-center justify-center shadow-lg relative">
            <Hourglass className="h-10 w-10 text-orange-500 animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-orange-500 text-white border-none uppercase text-[8px] font-bold">LOCKED</Badge>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Identity: <span className="font-bold text-slate-900">{user.email}</span><br/>
              Status: <span className="text-primary font-bold uppercase">{userData.status}</span><br/><br/>
              Your Strategic Permit is currently inactive. System features will be provisioned once an administrator authorizes your role and permitted phases.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest border-slate-100 bg-slate-50 hover:bg-slate-100">Switch Identity</Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-2xl font-bold text-primary text-xs uppercase tracking-widest gap-2"><RotateCcw className="h-4 w-4" /> Refresh Authorization</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfe] flex flex-col font-body">
      <nav className="w-full h-20 px-8 lg:px-20 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-slate-900">DP MediaFlow</span>
        </Link>
        <div className="flex gap-8 items-center">
          <Link href="/about" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Vision</Link>
          <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 gap-2">
            <Globe className="h-3 w-3" /> EN <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center max-w-[1400px] mx-auto w-full p-8">
        <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="space-y-6">
            <Badge className="bg-primary/5 text-primary border-none rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              Identity Node v2.6
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-[1.1]">
              Secure <br/> <span className="text-primary">Workspace.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
              Phase-level authorization ensures high-fidelity project management and resource security.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-slate-200" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'login' ? "New expert?" : "Registered user?"}
            </p>
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              {mode === 'login' ? 'Provision Account' : 'Sign In'}
            </button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
          <Card className="w-full max-w-[420px] bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-10 space-y-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-headline tracking-tight text-slate-900">
                {mode === 'login' ? 'Operational Hub' : 'Register Expert'}
              </h3>
              <p className="text-sm text-slate-400 font-medium">Authentication required for permit validation.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Work Email" 
                    className="h-14 rounded-2xl bg-slate-50 border-none pl-12 font-bold shadow-inner" 
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Access Key" 
                    className="h-14 rounded-2xl bg-slate-50 border-none pl-12 pr-12 font-bold shadow-inner" 
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Provision')}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-4 text-slate-300 tracking-widest">Institutional Auth</span></div>
              </div>

              <Button 
                type="button" 
                onClick={handleGoogleAuth} 
                disabled={isProcessing}
                variant="outline" 
                className="w-full h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 gap-3"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sync with Google</span>
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
