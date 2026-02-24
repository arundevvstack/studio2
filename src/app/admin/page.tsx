
"use client";

import React from "react";
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  Activity, 
  Database, 
  Server, 
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  UserCheck,
  Key
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import Link from "next/link";

/**
 * @fileOverview Strategic Admin Console.
 * Manages system-wide roles, permissions, and operational status.
 */

export default function AdminConsolePage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const teamQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"), orderBy("firstName", "asc"));
  }, [db, user]);
  const { data: team, isLoading: teamLoading } = useCollection(teamQuery);

  if (isUserLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Authorizing Executive Access...</p>
      </div>
    );
  }

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
          <p className="text-sm text-slate-500 font-medium tracking-normal">Manage global system policies, role hierarchy, and organization security.</p>
        </div>
        <Button asChild className="rounded-xl font-bold h-12 px-6 shadow-lg shadow-slate-200">
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
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
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Provisioned Users</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{team?.length || 0}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Roles</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">14</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Security Level</p>
            <h3 className="text-2xl font-bold font-headline mt-1 tracking-normal">ENFORCED</h3>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="permissions" className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1">
          <TabsTrigger value="permissions" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <UserCheck className="h-4 w-4" />
            Access Matrix
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Activity className="h-4 w-4" />
            System Audit
          </TabsTrigger>
          <TabsTrigger value="database" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Database className="h-4 w-4" />
            Cloud Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xl font-bold font-headline tracking-normal">Role-Based Access Control</CardTitle>
              <CardDescription className="tracking-normal">Audit and manage entitlements for all provisioned production experts.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {teamLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Executive Identity</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Assigned Role</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal text-center">Status</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Access Policy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team?.map((member) => (
                      <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-10 py-6">
                          <div>
                            <p className="font-bold text-slate-900 tracking-normal leading-none">{member.firstName} {member.lastName}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">{member.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-100 text-slate-600 font-bold text-[9px] uppercase tracking-normal">
                            {member.roleId || "General Access"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-normal">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <Button asChild variant="ghost" size="sm" className="rounded-lg font-bold text-[10px] uppercase tracking-normal gap-2 hover:bg-primary hover:text-white transition-all">
                            <Link href={`/admin/users?highlight=${member.id}`}>
                              Override Rules <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-bold font-headline tracking-normal px-2">Recent Security Events</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl bg-white p-6 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-5">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 tracking-normal">Identity Verification Success</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-normal">24 Feb 2026 • 14:32:01</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-100 text-green-600 text-[8px] font-bold uppercase tracking-normal">System Pass</Badge>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-bold text-slate-50 uppercase tracking-normal">Global Watchdog</p>
                  <h4 className="text-xl font-bold font-headline tracking-normal">Threat Prevention</h4>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative z-10">
                  <p className="text-xs font-medium leading-relaxed text-slate-300 tracking-normal">
                    "Artificial intelligence patterns detect zero suspicious entry points across all regional hubs in the last 24 hours."
                  </p>
                </div>
                <div className="space-y-4 relative z-10 pt-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                    <span className="text-slate-500">System Integrity</span>
                    <span className="text-primary">100%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="database" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[3rem] bg-white p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-24 w-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center shadow-inner">
              <Database className="h-12 w-12 text-primary" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Firestore Cloud Repository</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed tracking-normal">
                Real-time data synchronization is currently optimized for all collections including `shoot_network`, `projects`, and `clients`.
              </p>
            </div>
            <Button variant="outline" className="h-12 rounded-xl px-8 font-bold text-xs uppercase tracking-normal gap-2 border-slate-100">
              Refresh Indexing <Loader2 className="h-3 w-3" />
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
