
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Secure Termination Page.
 * Terminates the executive session, clears the session node in Firestore, and clears state.
 */

export default function LogoutPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Terminate Session Node in Firestore if it exists
        const sid = localStorage.getItem('mf_session_id');
        if (user && sid) {
          try {
            await deleteDoc(doc(db, "teamMembers", user.uid, "sessions", sid));
          } catch (e) {
            console.warn("Session cleanup skipped:", e);
          }
        }

        // 2. Clear local storage identifier
        localStorage.removeItem('mf_session_id');

        // 3. Terminate Firebase Auth session
        await signOut(auth);
        
        // Delay slightly for visual consistency
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (error) {
        console.error("Logout Error:", error);
        router.push("/");
      }
    };

    performLogout();
  }, [auth, router, db, user]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-6 animate-in fade-in duration-700">
      <div className="relative">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Terminating Session</h1>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Securely clearing executive intelligence...</p>
      </div>
    </div>
  );
}
