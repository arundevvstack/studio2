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
  ShieldAlert,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateAnonymousSignIn, 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview Executive Entry Portal.
 * Supports Email/Password, Google Sign-In, and Root Access bypass.
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

  // Check user record status
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member } = useDoc(memberRef);

  useEffect(() => {
    if (user && !isUserLoading) {
      if (user.isAnonymous) {
        router.push("/");
        return;
      }
      
      if (member) {
        if (member.status === "Active") {
          router.push("/");
        }
      } else if (!isProcessing) {
        // Create initial pending record if not existing (for new Google/Email users)
        const newMemberRef = doc(db, "teamMembers", user.uid);
        setDoc(newMemberRef, {
          id: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || "New",
          lastName: user.displayName?.split(' ').slice(1).join(' ') || "Executive",
          thumbnail: user.photoURL || "",
          status: "Pending",
          type: "In-house",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  }, [user, isUserLoading, member, router, db, isProcessing]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ 
        variant: "destructive", 
        title: "Missing Credentials", 
        description: "Please provide a valid email and secure password." 
      });
      return;
    }
    
    setIsProcessing(true);
    
    const authPromise = mode === "login" 
      ? initiateEmailSignIn(auth, email, password)
      : initiateEmailSignUp(auth, email, password);

    authPromise.catch((err: any) => {
      let errorMessage = "Authentication failed.";
      if (err.code === 'auth/email-already-in-use') errorMessage = "Identity already registered. Please log in.";
      if (err.code === 'auth/invalid-credential') errorMessage = "Invalid credentials provided.";
      if (err.code === 'auth/weak-password') errorMessage = "Password must be at least 6 characters.";
      
      toast({ variant: "destructive", title: "Auth Failure", description: errorMessage });
      setIsProcessing(false);
    });
  };

  const handleGoogleAuth = () => {
    setIsProcessing(true);
    initiateGoogleSignIn(auth).catch((err) => {
      toast({ variant: "destructive", title: "Google Auth Failed", description: err.message });
      setIsProcessing(false);
    });
  };

  const handleRootAccess = () => {
    setIsProcessing(true);
    toast({ title: "Authorizing Root Identity", description: "Provisioning administrative bypass..." });
    initiateAnonymousSignIn(auth).catch((err) => {
      toast({ variant: "destructive", title: "Root Access Failed", description: err.message });
      setIsProcessing(false);
    });
  };

  if (isUserLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Identity...</p>
      </div>
    );
  }

  // Waiting room UI for pending users
  if (user && !user.isAnonymous && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="h-24 w-24 rounded-[2.5rem] bg-orange-50 flex items-center justify-center shadow-xl shadow-orange-200/20">
          <ShieldAlert className="h-10 w-10 text-orange-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-bold font-headline text-slate-900">Access Pending</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Your executive account has been registered. A root administrator must validate your identity before you can access the production workspace.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => auth.signOut()} className="rounded-xl font-bold px-8">Sign Out</Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="rounded-xl font-bold text-primary px-8">Refresh Status</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[100px] rounded-full -ml-72 -mb-72" />

      <div className="w-full max-w-[480px] space-y-10 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
            <Zap className="h-10 w-10 text-white fill-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">
              {mode === 'login' ? 'Executive Entry' : 'Request Provisioning'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">Manage global production assets and strategic accounts.</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleAuth}
                disabled={isProcessing}
                className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 font-bold text-sm gap-3 transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Gmail
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-300"><span className="bg-white px-4">OR USE EMAIL</span></div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                      placeholder="executive@agency.com" 
                      className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" disabled={isProcessing}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    {mode === 'login' ? 'Continue Workspace' : 'Initialize Request'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Emergency Bypass</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Button 
              variant="outline" onClick={handleRootAccess} disabled={isProcessing}
              className="w-full h-14 rounded-2xl border-2 border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-bold text-xs uppercase tracking-widest gap-3 transition-all"
            >
              <ShieldCheck className="h-5 w-5" />
              Root Administrator Bypass
            </Button>

            <div className="text-center">
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
              >
                {mode === 'login' ? "New Executive? Create Account" : "Existing User? Return to Login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
