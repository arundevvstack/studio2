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
  Sparkles,
  CheckCircle2,
  Calendar,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * @fileOverview Full-Screen Responsive Identity Governance Portal.
 * Design: High-fidelity "ish" aesthetic with immersive dual-pane split.
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
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row overflow-hidden font-body">
      {/* Left Side: Auth Form (Full width on mobile, 50% on desktop) */}
      <div className="flex-1 p-8 sm:p-12 md:p-20 lg:p-24 flex flex-col justify-center items-center bg-gradient-to-br from-slate-50/50 to-white">
        <div className="space-y-10 sm:space-y-12 max-w-sm w-full">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">
              {mode === 'login' ? 'System Portal' : 'Onboard Profile'}
            </h2>
            <p className="text-sm text-slate-400 font-medium tracking-normal">
              {mode === 'login' ? 'Authorize your session to access organizational intel.' : 'Initiate your professional identity request.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Identity Identifier</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="expert@mediaflow.internal" 
                    className="h-14 rounded-2xl bg-slate-50 border-none px-14 font-bold text-sm shadow-inner focus-visible:ring-primary/20 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Passphrase</Label>
                  <button type="button" className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="h-14 rounded-2xl bg-slate-50 border-none px-14 font-bold text-sm shadow-inner focus-visible:ring-primary/20 transition-all" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isProcessing} 
              className="w-full h-16 rounded-[1.25rem] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] group"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Authorize Session' : 'Request Access'} 
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-300">OR CONTINUE WITH</span></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleAuth} 
            disabled={isProcessing} 
            className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 font-bold text-[10px] uppercase tracking-widest gap-3 shadow-sm transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Authority
          </Button>

          <div className="text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
              className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-all"
            >
              {mode === 'login' ? "Provision New Identity" : "Return to Portal"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Illustrative Design (Hidden on mobile, 50% on desktop) */}
      <div className="hidden lg:flex flex-1 relative bg-slate-950 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/office-collaboration/1200/1200')] bg-cover bg-center opacity-40 scale-110 blur-[2px]" data-ai-hint="office collaboration" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-slate-950/80" />
        
        <div className="relative w-full h-full max-w-xl">
          {/* Floating UI Widget 2: Calendar Node */}
          <div className="absolute bottom-[25%] left-[5%] bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-left-8 duration-700 delay-500">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-12">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Production Schedule</p>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex gap-3">
                {[22, 23, 24, 25, 26].map((day, i) => (
                  <div key={day} className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center transition-all ${i === 2 ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white/5 text-white/40'}`}>
                    <span className="text-[8px] font-bold uppercase">{['S','M','T','W','T'][i]}</span>
                    <span className="text-sm font-bold">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Centerpiece */}
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-8 p-6">
              <div className="inline-block p-5 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl mb-4">
                <Zap className="h-14 w-14 text-primary fill-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight font-headline">
                  Premium Agency <br/><span className="text-primary">Intelligence.</span>
                </h3>
                <p className="text-base text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                  The authoritative operational hub for media production strategy and asset throughput.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
