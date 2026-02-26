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
import { Label } from "@/components/ui/label";
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
 * @fileOverview Identity Governance Portal.
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Identity...</p>
      </div>
    );
  }

  if (user && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-xl">
          <Hourglass className="h-10 w-10 text-orange-500 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-bold font-headline text-slate-900">Access Restricted</h1>
          <p className="text-sm text-slate-500 font-medium">Your identity is provisioned. Entry requires administrative validation.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="outline" onClick={() => signOut(auth)} className="h-12 rounded-xl font-bold text-xs uppercase tracking-normal">Switch Identity</Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="h-12 rounded-xl font-bold text-primary text-xs uppercase tracking-normal gap-2"><RotateCcw className="h-4 w-4" /> Refresh Status</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row relative overflow-hidden font-body">
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/studio/1600/1200')] bg-cover bg-center opacity-30 grayscale" data-ai-hint="production studio" />
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-2xl">
              <Zap className="h-7 w-7 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-bold font-headline text-white tracking-tight">DP MediaFlow</h2>
          </div>
          <h3 className="text-5xl font-bold text-white tracking-tight leading-tight font-headline">
            Premium Agency <span className="text-primary">Operations.</span>
          </h3>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            Orchestrate your crew, automate your billing, and scale production throughput.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-50/30">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">
              {mode === 'login' ? 'System Portal' : 'Onboard Profile'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Authorize your session to access organizational intel.
            </p>
          </div>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-8 sm:p-10 space-y-8">
              <Button 
                variant="outline" 
                onClick={handleGoogleAuth} 
                disabled={isProcessing} 
                className="w-full h-12 rounded-xl border-slate-100 bg-white hover:bg-slate-50 font-bold text-xs uppercase tracking-normal gap-3"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-white px-4 text-slate-300">OR</span></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Identifier</Label>
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="expert@mediaflow.internal" 
                      className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-sm shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Passphrase</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="h-12 rounded-xl bg-slate-50 border-none px-4 pr-12 font-bold text-sm shadow-inner" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-normal shadow-lg transition-all active:scale-[0.98] group"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Authorize Session' : 'Request Onboarding'} 
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                  className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-normal transition-all"
                >
                  {mode === 'login' ? "Provision New Identity" : "Return to Portal"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
