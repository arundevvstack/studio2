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
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp, collection, query, where, writeBatch, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const MASTER_EMAIL = 'defineperspective.in@gmail.com';
const RESTRICTED_EMAILS = [
  'arunadhi.com@gmail.com',
  'anonymous-root@mediaflow.internal'
];

/**
 * @fileOverview Authoritative Login Node.
 * Handles identity resolution without clobbering existing Admin assignments.
 * Enforces strict restricted email blockade.
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
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Identify expert by Lowercase Email to handle pre-registered invites robustly
  const memberQuery = useMemoFirebase(() => {
    if (!user || !user.email || user.isAnonymous) return null;
    return query(collection(db, "teamMembers"), where("email", "==", user.email.toLowerCase()));
  }, [db, user]);
  const { data: memberDocs, isLoading: isMemberLoading } = useCollection(memberQuery);
  
  const existingMember = memberDocs?.[0] || null;

  useEffect(() => {
    // Wait for all data streams to stabilize
    if (isUserLoading || isMemberLoading || isMigrating || isProvisioning) return;

    if (user) {
      const userEmail = user.email?.toLowerCase();
      
      // 1. Security Restriction Gate
      if (user.isAnonymous || (userEmail && RESTRICTED_EMAILS.includes(userEmail))) {
        toast({ variant: "destructive", title: "Security Restriction", description: "This identifier is unauthorized and restricted." });
        signOut(auth);
        setIsProcessing(false);
        return;
      }
      
      // 2. Existing Identity Resolution (THE PRESERVATION LOGIC)
      if (existingMember) {
        // ID Consolidation: If record exists under a legacy ID, move it to the UID
        if (existingMember.id !== user.uid) {
          const migrateIdentity = async () => {
            setIsMigrating(true);
            try {
              const batch = writeBatch(db);
              const newRef = doc(db, "teamMembers", user.uid);
              const oldRef = doc(db, "teamMembers", existingMember.id);
              
              // CRITICAL: We spread the existing member data exactly as is.
              // This preserves the status (Permit Phase) and roleId assigned by admin.
              batch.set(newRef, {
                ...existingMember,
                id: user.uid,
                updatedAt: serverTimestamp()
              }, { merge: true });
              
              batch.delete(oldRef);
              await batch.commit();
              toast({ title: "Identity Synchronized", description: "Expert profile successfully linked." });
            } catch (e: any) {
              console.error("Migration Error:", e);
            } finally {
              setIsMigrating(false);
            }
          };
          migrateIdentity();
          return;
        }

        // Access Control: Only let them in if Admin has set status to Active
        if (existingMember.status === "Active") {
          router.push("/dashboard");
        } else {
          setIsProcessing(false);
          // If status is Suspended or Pending, the UI below shows the "Access Restricted" screen
        }
        return; 
      } 
      
      // 3. New Identity Provisioning (Only if userEmail is confirmed NOT in database)
      if (userEmail && !existingMember && !isMemberLoading) {
        
        // Auto-authorize Master Node once
        if (userEmail === MASTER_EMAIL.toLowerCase()) {
          setIsProvisioning(true);
          const masterRef = doc(db, "teamMembers", user.uid);
          setDocumentNonBlocking(masterRef, {
            id: user.uid,
            email: userEmail,
            firstName: "Master",
            lastName: "Administrator",
            status: "Active",
            type: "In-house",
            roleId: "root-admin",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
          router.push("/dashboard");
        } 
        // Provision baseline user identity as PENDING
        else {
          setIsProvisioning(true);
          const nameParts = (user.displayName || "New Expert").split(' ');
          const newMemberRef = doc(db, "teamMembers", user.uid);
          
          setDocumentNonBlocking(newMemberRef, {
            id: user.uid,
            email: userEmail,
            firstName: nameParts[0] || "New",
            lastName: nameParts.slice(1).join(' ') || "User",
            thumbnail: user.photoURL || "",
            status: "Pending", 
            type: "In-house",
            roleId: "", // Removed default staff role
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
          
          toast({ title: "Identity Provisioned", description: "Awaiting strategic permit authorization from Root Node." });
          setIsProcessing(false);
        }
      }
    }
  }, [user, isUserLoading, existingMember, isMemberLoading, router, db, auth, isProvisioning, isMigrating]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (RESTRICTED_EMAILS.includes(email.toLowerCase())) {
      toast({ variant: "destructive", title: "Security Restriction", description: "Identifier restricted." });
      return;
    }

    setIsProcessing(true);
    const authPromise = mode === "login" 
      ? initiateEmailSignIn(auth, email.toLowerCase(), password)
      : initiateEmailSignUp(auth, email.toLowerCase(), password);

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

  if (isUserLoading || (user && isMemberLoading) || isMigrating || isProvisioning) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {isMigrating ? "Synchronizing Assignment..." : isProvisioning ? "Provisioning Permit..." : "Verifying Identity Node..."}
        </p>
      </div>
    );
  }

  // Strictly block users who are not active in the DATABASE (assigned by admin)
  if (user && existingMember?.status !== "Active") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[10px] shadow-2xl p-12 max-w-lg w-full flex flex-col items-center text-center space-y-10">
          <div className="h-20 w-20 rounded-[10px] bg-orange-50 flex items-center justify-center shadow-lg">
            <Hourglass className="h-8 w-8 text-orange-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Your identity has been identified but your operational status is currently 
              <span className="text-primary font-bold ml-1 uppercase">{existingMember?.status || 'Pending'}</span>.
              Access requires administrative authorization from the Admin Console.
            </p>
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
              Identity Node v2.5
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
              {mode === 'login' ? "Don't have an account?" : "Already registered?"}
            </p>
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              {mode === 'login' ? 'Join System' : 'Sign In'}
            </button>
          </div>
        </div>

        <div className="p-8 lg:p-20 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
          <Card className="w-full max-w-[420px] bg-white border border-slate-100 shadow-2xl rounded-[10px] p-10 space-y-10">
            <div className="space-y-10 text-left">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-10 w-10 rounded-[10px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <span className="font-headline font-bold text-xl tracking-tight text-slate-900">DP MediaFlow</span>
              </Link>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-headline tracking-tight text-slate-900">
                  {mode === 'login' ? 'Welcome Back' : 'Join Network'}
                </h3>
                <p className="text-sm text-slate-400 font-medium">Enter credentials to access the operational hub.</p>
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
