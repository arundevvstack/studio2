"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Loader2, 
  Eye, 
  EyeOff,
  Zap,
  Globe,
  ChevronDown,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const MASTER_EMAIL = 'defineperspective.in@gmail.com';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isProcessing, setIsProcessing] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: userData, isLoading: isUserRegistryLoading } = useDoc(userRef);

  useEffect(() => {
    const syncUserRegistry = async () => {
      if (user && !isUserRegistryLoading && userRef) {
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
          const isMaster = user.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();
          
          const newIdentity = {
            uid: user.uid,
            id: user.uid,
            name: name || user.displayName || "New Expert",
            email: user.email?.toLowerCase(),
            photoURL: user.photoURL || "",
            provider: user.providerData[0]?.providerId === 'google.com' ? "google" : "password",
            
            status: isMaster ? "approved" : "pending",
            role: isMaster ? "admin" : null,
            department: isMaster ? "Executive" : null,

            permissions: {
              canCreateProject: isMaster,
              canEditProject: isMaster,
              canDeleteProject: isMaster,
              canViewFinance: isMaster,
              canAccessSettings: isMaster
            },

            phaseAccess: {
              phase1: isMaster,
              phase2: isMaster,
              phase3: isMaster,
              phase4: isMaster
            },

            approvedBy: isMaster ? "SYSTEM" : null,
            approvedAt: isMaster ? serverTimestamp() : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await setDoc(userRef, newIdentity);
          
          if (!isMaster) {
            toast({ title: "Account Created", description: "Awaiting administrative approval." });
            router.push("/waiting-approval");
          } else {
            router.push("/dashboard");
          }
        } else {
          // Existing user logic
          if (userData?.status === "approved") {
            router.push("/dashboard");
          } else if (userData?.status === "suspended") {
            router.push("/account-suspended");
          } else if (userData?.status === "pending") {
            router.push("/waiting-approval");
          }
        }
      }
    };

    if (user) syncUserRegistry();
  }, [user, userData, isUserRegistryLoading, router, db, name, userRef]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsProcessing(true);
    try {
      if (mode === "login") {
        await initiateEmailSignIn(auth, email.toLowerCase(), password);
      } else {
        await initiateEmailSignUp(auth, email.toLowerCase(), password);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Authentication Failed", description: err.message });
      setIsProcessing(false);
    }
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
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Enterprise Permit...</p>
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
              Enterprise Access Node
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-[1.1]">
              Secure Hub <br/> <span className="text-primary">Authorization.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
              Approved permits ensure high-fidelity management and organizational asset security.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-slate-200" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'login' ? "New to the hub?" : "Already registered?"}
            </p>
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              {mode === 'login' ? 'Provision Account' : 'Secure Login'}
            </button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
          <Card className="w-full max-w-[420px] bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-10 space-y-10">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold font-headline tracking-tight text-slate-900">
                {mode === 'login' ? 'Operational Hub' : 'Register Expert'}
              </h3>
              <p className="text-sm text-slate-400 font-medium">Identity verification required for permit sync.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Full Name" 
                      className="h-14 rounded-2xl bg-slate-50 border-none pl-12 font-bold shadow-inner" 
                      required
                    />
                  </div>
                )}
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

              <Button type="submit" disabled={isProcessing} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Provision Account')}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-4 text-slate-300 tracking-widest">Enterprise Sync</span></div>
              </div>

              <Button 
                type="button" 
                onClick={handleGoogleAuth} 
                disabled={isProcessing}
                variant="outline" 
                className="w-full h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 gap-3 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sign in with Google</span>
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}