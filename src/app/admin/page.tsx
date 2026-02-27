
"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Server, 
  CheckCircle2, 
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Strategic Admin Console.
 * Manages system-wide metrics, operational status, and global audit logs.
 * Gated by strictly "Active" Permit Status in the authoritative Identity Registry.
 */

export default function AdminConsolePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch identity record status from the users collection (Registry)
  const identityRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: identity, isLoading: identityLoading } = useDoc(identityRef);

  // Strategic Access Guard
  useEffect(() => {
    if (!isUserLoading && mounted && !identityLoading) {
      if (!user || user.isAnonymous) {
        router.push("/login");
      } else if (identity && identity.status !== "active") {
        router.push("/login");
      } else if (!identity && !isUserLoading) {
        // Redirect if no organizational identity exists
        router.push("/login");
      }
    }
  }, [user, isUserLoading, router, identity, identityLoading, mounted]);

  const teamQuery = useMemoFirebase(() => {
    if (!user || user.isAnonymous) return null;
    return query(collection(db, "users"), orderBy("updatedAt", "desc"), limit(10));
  }, [db, user]);
  const { data: identities, isLoading: teamLoading } = useCollection(teamQuery);

  if (!mounted || isUserLoading || (user && identityLoading)) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Authorizing Executive Access...</p>
      </div>
    );
  }

  if (!user || user.isAnonymous || identity?.status !== "active") return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Admin Console</h1>
            <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Root Access
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">High-level system oversight, operational health, and organization security.</p>
        </div>
        <Button asChild className="rounded-xl font-bold h-12 px-6 shadow-lg shadow-slate-200">
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            Manage Identities & RBAC
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[10px] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Server className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">System Status</p>
            <h3 className="text-xl font-bold font-headline mt-1 flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Operational
            </h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[10px] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Identities</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{identities?.length || 0}</h3>
          </div>
        </Card>
      </div>
    </div>
  );
}
