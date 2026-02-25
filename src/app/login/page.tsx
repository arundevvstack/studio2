
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ShieldAlert,
  Fingerprint,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Zap,
  Key,
  UserX,
  Hourglass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn,
  initiatePasswordReset
} from "@/firebase/non-blocking-login";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview Login Portal for DP MediaFlow.
 * A high-fidelity authentication gateway supporting Email/Password and Google.
 * Handles automatic provisioning of PENDING user records for organizational approval.
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

  // Fetch global branding settings
  const billingSettingsRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: globalSettings } = useDoc(billingSettingsRef);

  // Check user record status in the organization's registry
  const memberRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member, isLoading: isMemberLoading } = useDoc(memberRef);

  useEffect(() => {
    if (isUserLoading || isMemberLoading) return;

    if (user) {
      if (user.isAnonymous) {
        router.push("/");
        return;
      }
      
      if (member) {
        // PERMIT ONLY IF ACTIVE
        if (member.status === "Active") {
          router.push("/");
        }
      } else {
        // Provision as PENDING by default for new registrations
        const newMemberRef = doc(db, "teamMembers", user.uid);
        const displayName = user.displayName || "";
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || "New";
        const lastName = nameParts.slice(1).join(' ') || "User";

        setDocumentNonBlocking(newMemberRef, {
          id: user.uid,
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          thumbnail: user.photoURL || "",
          status: "Pending", // Require manual approval
          type: "In-house",
          roleId: "staff", // Default role
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  }, [user, isUserLoading, member, isMemberLoading, router, db]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ 
        variant: "destructive", 
        title: "Missing Credentials", 
        description: "Please enter your email and password." 
      });
      return;
    }
    
    setIsProcessing(true);
    
    const authPromise = mode === "login" 
      ? initiateEmailSignIn(auth, email, password)
      : initiateEmailSignUp(auth, email, password);

    authPromise
      .then(() => {
        // Handled by useEffect
      })
      .catch((err: any) => {
        console.error("Auth Error:", err);
        let errorMessage = "Authentication failed.";
        
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered. Please sign in instead.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password should be at least 6 characters.";
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = "Invalid email or password.";
            break;
          default:
            errorMessage = err.message || "An unexpected error occurred.";
        }
        
        toast({ 
          variant: "destructive", 
          title: mode === 'signup' ? "Registration Error" : "Login Failed", 
          description: errorMessage 
        });
        setIsProcessing(false);
      });
  };

  const handleGoogleAuth = () => {
    setIsProcessing(true);
    initiateGoogleSignIn(auth)
      .then(() => {
        // Handled by useEffect
      })
      .catch((err) => {
        console.error("Google Auth Error:", err);
        let errorMessage = err.message || "Could not authorize via Google.";
        
        if (err.code === 'auth/operation-not-allowed') {
          errorMessage = "Google Sign-In is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).";
        }
        
        toast({ 
          variant: "destructive", 
          title: "Google Login Error", 
          description: errorMessage 
        });
        setIsProcessing(false);
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({ 
        variant: "destructive", 
        title: "Email Required", 
        description: "Please enter your email address to reset your password." 
      });
      return;
    }
    
    setIsProcessing(true);
    initiatePasswordReset(auth, email)
      .then(() => {
        toast({ 
          title: "Reset Email Sent", 
          description: "Check your inbox for password recovery instructions." 
        });
        setIsProcessing(false);
      })
      .catch((err) => {
        toast({ 
          variant: "destructive", 
          title: "Reset Failed", 
          description: err.message || "Could not initiate password reset."
        });
        setIsProcessing(false);
      });
  };

  if (isUserLoading || (user && isMemberLoading)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-primary animate-spin opacity-20" />
          <Fingerprint className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Verifying Identity...</p>
      </div>
    );
  }

  // PENDING GATE
  if (user && !user.isAnonymous && member?.status === "Pending") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-10 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="h-32 w-32 rounded-[3.5rem] bg-blue-50 flex items-center justify-center shadow-2xl shadow-blue-200/20">
            <Hourglass className="h-14 w-14 text-primary animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Approval Required</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Your organizational identity has been registered. A system administrator must validate your credentials before you can enter the production workspace.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button variant="outline" onClick={() => auth.signOut()} className="h-14 rounded-2xl font-bold text-sm uppercase tracking-widest border-slate-200 bg-white">
            Switch Account
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-2xl font-bold text-primary text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5">
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  // SUSPENDED GATE
  if (user && !user.isAnonymous && member?.status === "Suspended") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-10 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="h-32 w-32 rounded-[3.5rem] bg-red-50 flex items-center justify-center shadow-2xl shadow-red-200/20">
            <UserX className="h-14 w-14 text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-red-400" />
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Access Revoked</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Your organizational credentials have been suspended. Please contact a Root Administrator to restore workspace access.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button variant="outline" onClick={() => auth.signOut()} className="h-14 rounded-2xl font-bold text-sm uppercase tracking-widest border-slate-200 bg-white">
            Switch Account
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 rounded-2xl font-bold text-primary text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5">
            Check Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row relative overflow-hidden font-body">
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -mr-96 -mt-96" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full -ml-72 -mb-72" />
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/login-bg/1200/1200')] bg-cover bg-center opacity-10 grayscale" />
        </div>
        
        <div className="relative z-10 space-y-12 max-w-xl">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-[1.5rem] bg-white flex items-center justify-center shadow-2xl shadow-white/10 overflow-hidden">
              {globalSettings?.logo ? (
                <img src={globalSettings.logo} alt="DP Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <h2 className="text-4xl font-bold font-headline text-white tracking-tighter">DP MediaFlow</h2>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-5xl font-bold text-white tracking-tight leading-[1.1]">Production Engine</h3>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Consolidated intelligence for high-growth media agencies. Manage leads, synthesize proposals, and scale your production throughput.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12">
            <div>
              <p className="text-3xl font-bold text-white tracking-tight">100%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Operational Sync</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary tracking-tight">AI-Ready</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Strategic Synthesis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-[440px] space-y-10">
          <div className="lg:hidden flex flex-col items-center text-center space-y-6 mb-12">
            <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-slate-200 overflow-hidden border border-slate-100">
              {globalSettings?.logo ? (
                <img src={globalSettings.logo} alt="DP Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold font-headline tracking-tighter">DP MediaFlow</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {mode === 'login' 
                ? 'Welcome back. Please enter your credentials.' 
                : 'Join the organization to start managing production entities.'}
            </p>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden border border-slate-50">
            <CardContent className="p-8 sm:p-10 space-y-8">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={handleGoogleAuth}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 font-bold text-sm gap-3 transition-all shadow-sm"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>
                
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">or use email</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@agency.com" 
                        className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                      {mode === 'login' && (
                        <button 
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isProcessing}
                          className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest transition-all"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input 
                        type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="h-14 rounded-2xl bg-slate-50 border-none pl-14 pr-14 font-bold text-base shadow-inner focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" disabled={isProcessing}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-slate-200/50 transition-all active:scale-[0.98] group"
                >
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Sign Up'}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-6 pt-4">
                <div className="text-center">
                  <button 
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setShowPassword(false);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-all"
                  >
                    {mode === 'login' ? "Create Account" : "Back to Sign In"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-auto pt-12 flex items-center gap-6 opacity-20 group hover:opacity-100 transition-opacity">
          <Globe className="h-4 w-4 text-slate-400" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">System Node: TRV-01</p>
        </div>
      </div>
    </div>
  );
}
