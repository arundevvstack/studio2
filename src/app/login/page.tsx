
"use client";

import { Badge } from "@/components/ui/badge"
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

const MASTER_EMAIL = 'defineperspective.in@gmail.com';
const RESTRICTED_EMAILS = ['arunadhi.com@gmail.com', 'anonymous-root@mediaflow.internal'];

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
      const userEmail = user.email?.toLowerCase();
      
      // Enforce restricted list and non-anonymous sessions
      if (user.isAnonymous || (userEmail && RESTRICTED_EMAILS.includes(userEmail))) {
        toast({ variant: "destructive", title: "Security Restriction", description: "This identifier is restricted or unauthorized." });
        signOut(auth);
        setIsProcessing(false);
        return;
      }
      
      // Auto-authorize Master Node
      if (userEmail === MASTER_EMAIL.toLowerCase()) {
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

      // Handle standard users
      if (member) {
        if (member.status === "Active") {
          router.push("/dashboard");
        } else {
          setIsProcessing(false);
        }
      } else if (user.email && !isProvisioning) {
        // Provision new Google or Email sign-up identity
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
        
        toast({ title: "Identity Provisioned", description: "Your account is awaiting strategic permit authorization." });
      }
    }
  }, [user, isUserLoading, member, isMemberLoading, router, db, auth, isProvisioning]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (RESTRICTED_EMAILS.includes(email.toLowerCase())) {
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

  if (isUserLoading || (user && isMemberLoading)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Identity...</p>
      </div>
    );
  }

  if (user && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[10px] shadow-2xl p-16 max-w-lg w-full flex flex-col items-center text-center space-y-10">
          <div className="h-24 w-24 rounded-[10px] bg-orange-50 flex items-center justify-center shadow-xl">
            <Hourglass className="h-10 w-10 text-orange-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your identity is provisioned. Entry requires administrative validation from the Root Node to authorize your strategic permit.</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button variant="outline" onClick={() => signOut(auth)} className="h-14 rounded-[10px] font-bold text-xs uppercase tracking-widest border-slate-100 bg-slate-50 hover:bg-slate-100">Switch Identity</Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-[10px] font-bold text-primary text-xs uppercase tracking-widest gap-2"><RotateCcw className="h-4 w-4" /> Refresh Status</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfe] flex flex-col font-body selection:bg-primary/10">
      <nav className="w-full h-20 px-8 lg:px-20 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="hidden lg:flex items-center gap-10">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Home</Link>
          <Link href="/verticals" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Verticals</Link>
          <Link href="/portfolio" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Portfolio</Link>
          <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 gap-2">
            <Globe className="h-3 w-3" /> EN <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center max-w-[1400px] mx-auto w-full">
        <div className="p-8 lg:p-24 space-y-12 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="space-y-6">
            <Badge className="bg-primary/5 text-primary border-none rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              Identity Node v2.4
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-[1.1]">
              Secure <br/> <span className="text-primary">Workspace.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
              The authoritative operational hub for media production strategy and asset throughput.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-slate-200" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'login' ? "Don't have an account?" : "Already provisioned?"}
            </p>
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              {mode === 'login' ? 'Join the System' : 'Sign In'}
            </button>
          </div>
        </div>

        <div className="p-8 lg:p-20 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
          <Card className="w-full max-w-[420px] bg-white border border-slate-100 shadow-2xl rounded-[10px] p-10 space-y-10">
            <div className="space-y-10">
              <div className="flex flex-col space-y-10">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="h-10 w-10 rounded-[10px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
                    <Zap className="h-5 w-5 text-white fill-white" />
                  </div>
                  <span className="font-headline font-bold text-xl tracking-tight text-slate-900">DP MediaFlow</span>
                </Link>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-headline tracking-tight text-slate-900">
                    {mode === 'login' ? 'Welcome Back' : 'Join the Network'}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">Enter your credentials to access the hub.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Expert Email" 
                    className="h-14 rounded-[10px] bg-slate-50 border-none pl-12 font-bold shadow-inner focus-visible:ring-primary/20" 
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Access Key" 
                    className="h-14 rounded-[10px] bg-slate-50 border-none pl-12 pr-12 font-bold shadow-inner focus-visible:ring-primary/20" 
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

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="rounded-[4px] border-slate-200 data-[state=checked]:bg-primary" />
                  <label htmlFor="remember" className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer">Remember Node</label>
                </div>
                <button type="button" className="text-[10px] font-bold uppercase text-primary hover:underline">Reset Key</button>
              </div>

              <div className="space-y-4 pt-4">
                <Button type="submit" disabled={isProcessing} className="w-full h-14 rounded-[10px] bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-primary/20">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Provision Account')}
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleGoogleAuth} 
                  disabled={isProcessing}
                  variant="outline" 
                  className="w-full h-14 rounded-[10px] bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Expert Auth with Google</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <footer className="w-full h-16 border-t border-slate-100 flex items-center justify-center bg-white px-8">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">
          DP MediaFlow Operating System • Built for high-stakes production
        </p>
      </footer>
    </div>
  );
}
