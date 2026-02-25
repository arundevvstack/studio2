
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft, 
  Plus, 
  Hourglass,
  Shield, 
  Trash2, 
  AlertTriangle,
  Zap,
  ShieldBan,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, serverTimestamp, writeBatch, getDocs, where } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";

/**
 * @fileOverview Identity & RBAC Hub.
 * Optimized for high-fidelity personnel management.
 * Includes Targeted Maintenance Sync for restricted identifiers.
 */

const MASTER_EMAIL = 'defineperspective.in@gmail.com';
const RESTRICTED_EMAIL = 'arunadhi.com@gmail.com';

export default function UserManagementPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserRef = useMemoFirebase(() => {
    if (!currentUser) return null;
    return doc(db, "teamMembers", currentUser.uid);
  }, [db, currentUser]);
  const { data: currentUserMember } = useDoc(currentUserRef);

  const isMasterUser = currentUser?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase() || currentUserMember?.roleId === 'root-admin' || currentUser?.isAnonymous;

  const teamQuery = useMemoFirebase(() => {
    if (!currentUser) return null;
    return query(collection(db, "teamMembers"), orderBy("updatedAt", "desc"));
  }, [db, currentUser]);
  const { data: team, isLoading: teamLoading } = useCollection(teamQuery);

  const rolesQuery = useMemoFirebase(() => {
    if (!currentUser) return null;
    return query(collection(db, "roles"), orderBy("name", "asc"));
  }, [db, currentUser]);
  const { data: roles } = useCollection(rolesQuery);

  // TARGETED MAINTENANCE SYNC (Master Admin Only)
  useEffect(() => {
    const executePurge = async () => {
      if (isMasterUser && team) {
        const batch = writeBatch(db);
        let count = 0;

        // 1. Check Team Registry
        const registryTargets = team.filter(m => m.email?.toLowerCase() === RESTRICTED_EMAIL.toLowerCase());
        registryTargets.forEach(t => {
          batch.delete(doc(db, "teamMembers", t.id));
          count++;
        });

        // 2. Check Sales Pipeline (Leads)
        const leadsRef = collection(db, "leads");
        const leadsQuery = query(leadsRef, where("email", "==", RESTRICTED_EMAIL));
        const leadsSnap = await getDocs(leadsQuery);
        leadsSnap.forEach(ldoc => {
          batch.delete(doc(db, "leads", ldoc.id));
          count++;
        });

        if (count > 0) {
          await batch.commit();
          toast({ title: "Maintenance Sync", description: `Purged ${count} restricted instances from registry.` });
        }
      }
    };

    executePurge();
  }, [isMasterUser, team, db]);

  const filteredUsers = useMemo(() => {
    if (!team) return [];
    return team.filter(member => 
      member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [team, searchQuery]);

  const handleUpdateRole = (userId: string, roleId: string) => {
    const userRef = doc(db, "teamMembers", userId);
    updateDocumentNonBlocking(userRef, { roleId, updatedAt: serverTimestamp() });
    toast({ title: "Authority Synchronized", description: "Identity role updated." });
  };

  const handleSetStatus = (userId: string, status: string) => {
    const userRef = doc(db, "teamMembers", userId);
    updateDocumentNonBlocking(userRef, { status, updatedAt: serverTimestamp() });
    toast({ 
      variant: status === "Suspended" ? "destructive" : "default",
      title: `Identity ${status}`, 
      description: `Access policy updated for the selected identifier.` 
    });
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorizing Security Node...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0" onClick={() => router.push("/admin")}>
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">Identity Governance</h1>
            <p className="text-sm text-slate-500 font-medium tracking-normal">Manage the Onboarding -> Approval -> Activation lifecycle.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-2 tracking-normal shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="h-4 w-4" /> Invite Expert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-10 pb-0"><DialogTitle className="text-2xl font-bold font-headline tracking-normal">Provision Team Identity</DialogTitle></DialogHeader>
              <TeamMemberForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center"><Hourglass className="h-5 w-5 text-orange-500" /></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Approval</p><h3 className="text-3xl font-bold font-headline mt-1 text-orange-600">{team?.filter(m => m.status === 'Pending').length || 0}</h3></div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Experts</p><h3 className="text-3xl font-bold font-headline mt-1">{team?.filter(m => m.status === 'Active').length || 0}</h3></div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10"><Shield className="h-5 w-5 text-primary" /></div>
          <div className="relative z-10"><p className="text-[10px] font-bold text-slate-50 uppercase tracking-widest">System Status</p><h3 className="text-2xl font-bold font-headline mt-1 uppercase">Protocol Active</h3></div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search identifiers by name or email..." className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base font-bold" />
        </div>
        <Button variant="outline" className="h-16 px-8 rounded-full bg-white border-slate-100 font-bold text-slate-600 gap-2 shadow-sm text-xs uppercase tracking-widest"><Filter className="h-4 w-4" /> Refine</Button>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden border border-slate-50">
        <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-xl font-bold font-headline tracking-normal">Identity Ledger</CardTitle>
          <CardDescription className="tracking-normal">Audit, approve, and manage organizational access for the production crew.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {teamLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="px-10 text-[10px] font-bold uppercase tracking-widest">Identity</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Strategic Role</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Lifecycle Phase</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((member) => {
                  const isRestricted = member.email?.toLowerCase() === RESTRICTED_EMAIL.toLowerCase();
                  return (
                    <TableRow key={member.id} className={`group hover:bg-slate-50/50 transition-colors border-slate-50 ${isRestricted ? 'bg-red-50/30' : ''}`}>
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-md">
                            <AvatarImage src={member.thumbnail} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">{member.firstName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 tracking-tight">{member.firstName} {member.lastName}</p>
                              {(member.email?.toLowerCase() === MASTER_EMAIL.toLowerCase() || member.roleId === 'root-admin') && <Zap className="h-3.5 w-3.5 text-primary fill-primary/10" />}
                              {isRestricted && <ShieldBan className="h-3.5 w-3.5 text-red-500" />}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={member.roleId || "staff"} onValueChange={(val) => handleUpdateRole(member.id, val)}>
                          <SelectTrigger className="h-10 w-48 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl">
                            {roles?.map(role => (
                              <SelectItem key={role.id} value={role.id} className="text-[10px] font-bold uppercase">{role.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full tracking-widest ${
                          member.status === 'Active' ? 'bg-green-50 text-green-600' : 
                          member.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-2xl">
                              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Lifecycle Control</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {member.status === 'Pending' && (
                                <DropdownMenuItem onClick={() => handleSetStatus(member.id, "Active")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs text-green-600">
                                  <CheckCircle2 className="h-4 w-4" /> Authorize Activation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleSetStatus(member.id, member.status === 'Active' ? "Suspended" : "Active")} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs ${member.status === 'Active' ? 'text-orange-600' : 'text-green-600'}`}>
                                {member.status === 'Active' ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                <span>{member.status === 'Active' ? 'Suspend Privileges' : 'Restore Access'}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-destructive focus:text-destructive font-bold text-xs">
                                  <Trash2 className="h-4 w-4" /> Purge Identity
                                </DropdownMenuItem>
                                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                  <AlertDialogHeader>
                                    <div className="flex items-center gap-3 text-destructive mb-2">
                                      <AlertTriangle className="h-6 w-6" />
                                      <AlertDialogTitle className="font-headline text-xl">Confirm Identity Purge</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                                      This will permanently remove <span className="font-bold text-slate-900">{member.firstName} {member.lastName}</span> from the registry. This action is irreversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3 mt-6">
                                    <AlertDialogCancel className="rounded-xl font-bold text-xs uppercase tracking-normal">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteDocumentNonBlocking(doc(db, "teamMembers", member.id))} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold px-8 uppercase text-xs tracking-normal">Confirm Purge</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
