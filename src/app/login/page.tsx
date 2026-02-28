
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Github, 
  Chrome,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useAuth, 
  useFirestore, 
  useUser, 
  initiateGoogleSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp
} from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const MASTER_EMAIL = "defineperspective.in@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      checkUserStatus(user.uid);
    }
  }, [user]);

  const checkUserStatus = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status === 'suspended') {
        router.push('/account-suspended');
      } else if (data.status === 'approved' || data.status === 'active') {
        router.push('/dashboard');
      } else {
        router.push('/waiting-approval');
      }
    } else {
      // If doc doesn't exist but auth does, we might need to provision (handled in handleAuthSuccess)
      router.push('/waiting-approval');
    }
  };

  const handleAuthSuccess = async (authUser: any, isNewUser: boolean) => {
    const userRef = doc(db, "users", authUser.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      const isMaster = authUser.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();
      
      const newIdentity = {
        uid: authUser.uid,
        id: authUser.uid,
        name: formData.name || authUser.displayName || "New Expert",
        email: authUser.email?.toLowerCase(),
        photoURL: authUser.photoURL || "",
        provider: authUser.providerData[0]?.providerId === "google.com" ? "google" : "password",
        status: isMaster ? "approved" : "pending",
        role: isMaster ? "admin" : null,
        approvedBy: isMaster ? "SYSTEM" : null,
        approvedAt: isMaster ? serverTimestamp() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, newIdentity);
      toast({ title: "Identity Provisioned", description: "Your strategic profile has been registered." });
      router.replace(isMaster ? "/dashboard" : "/waiting-approval");
    } else {
      checkUserStatus(authUser.uid);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const result = await initiateEmailSignIn(auth, formData.email, formData.password);
        await handleAuthSuccess(result.user, false);
      } else {
        const result = await initiateEmailSignUp(auth, formData.email, formData.password);
        await handleAuthSuccess(result.user, true);
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: error.message || "Credential verification failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await initiateGoogleSignIn(auth);
      await handleAuthSuccess(result.user, false);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Social Sync Failed", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fcfcfe] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Identity Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-body bg-[#fcfcfe] overflow-hidden">
      {/* Visual Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://picsum.photos/seed/media-auth/1200/1200')] bg-cover bg-center opacity-20 grayscale" data-ai-hint="media production" />
        
        <div className="relative z-10 space-y-10 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="font-headline font-bold text-3xl tracking-tight text-white">MediaFlow</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold font-headline text-white leading-tight tracking-tight">
              The Authoritative <span className="text-primary">System</span> for High-Growth Media.
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Structure your production workflow from lead to release. A unified node for agencies, studios, and AI media companies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10">
            {[
              { label: "Phase Mapping", icon: ShieldCheck },
              { label: "Smart Bidding", icon: Zap }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <f.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Authentication Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative">
        <div className="absolute top-10 left-10 lg:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-slate-900">MediaFlow</span>
        </div>

        <Card className="max-w-md w-full border-none shadow-none bg-transparent space-y-10">
          <div className="space-y-2 text-center lg:text-left">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-4">
              {isLogin ? 'Welcome Back' : 'Join the Network'}
            </Badge>
            <h2 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">
              {isLogin ? 'Executive Login' : 'Provision Identity'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isLogin 
                ? 'Enter your credentials to access the operational hub.' 
                : 'Register your professional identity in the repository.'}
            </p>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline" 
              className="w-full h-14 rounded-2xl bg-white border-slate-200 shadow-sm font-bold text-sm gap-3 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-[#fcfcfe] px-4 text-slate-300">Or use identifier</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Professional Name</Label>
                  <Input 
                    placeholder="Rahul Nair" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" 
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Identifier</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="email" 
                    placeholder="r.nair@agency.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="h-14 pl-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Secure Passkey</Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="h-14 pl-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-bold" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    {isLogin ? 'Access Hub' : 'Register Identity'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center space-y-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-primary uppercase tracking-widest hover:underline transition-all"
            >
              {isLogin ? "Don't have an identity? Create one" : "Already registered? Sign in here"}
            </button>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.15em] leading-relaxed">
              Protected by Enterprise-Grade Identity Governance • v2.8
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
