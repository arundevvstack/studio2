"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserMinus, 
  Key, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  ShieldAlert, 
  ChevronLeft, 
  UserPlus, 
  Clock, 
  Shield, 
  Trash2, 
  AlertTriangle,
  Edit2,
  Plus,
  Hourglass,
  Zap,
  RotateCcw,
  ShieldBan
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
import { collection, query, orderBy, doc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
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
  AlertDialogTrigger,
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
 * @fileOverview Role-Based Access Control (RBAC) Hub.
 * Provides high-level administrative oversight of all system users and their roles.
 * Includes a restricted System Purge utility for defineperspective.in@gmail.com.
 * Automatically handles blacklisted identity removal.
 */

export default function UserManagementPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPurging, setIsPurging] = useState(false);

  const MASTER_EMAIL = 'defineperspective.in@gmail.com';
  const BLACKLISTED_EMAILS = ['arunadhi.com@gmail.com'];

  // Fetch user record status
  const currentUserRef = useMemoFirebase(() => {
    if (!currentUser || currentUser.isAnonymous) return null;
    return doc(db, "teamMembers", currentUser.uid);
  }, [db, currentUser]);
  const { data: currentUserMember, isLoading: memberLoading } = useDoc(currentUserRef);

  // Fetch Role for Authority Check
  const roleRef = useMemoFirebase(() => {
    if (!currentUserMember?.roleId) return null;
    return doc(db, "roles", currentUserMember.roleId);
  }, [db, currentUserMember?.roleId]);
  const { data: userRole } = useDoc(roleRef);

  const isMasterUser = currentUser?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();
  const isAuthorizedToDelete = userRole?.name === "Administrator" || userRole?.name === "root Administrator" || userRole?.name === "Root Administrator" || isMasterUser;

  // Strategic Access Guard
  useEffect(() => {
    if (!isUserLoading) {
      if (!currentUser) {
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

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

  // AUTO-MAINTENANCE SYNC logic for blacklisted emails if found in registry
  useEffect(() => {
    if (isMasterUser && team && team.length > 0) {
      const blacklistedInRegistry = team.filter(m => BLACKLISTED_EMAILS.includes(m.email?.toLowerCase() || ""));
      if (blacklistedInRegistry.length > 0) {
        const batch = writeBatch(db);
        blacklistedInRegistry.forEach(m => {
          batch.delete(doc(db, "teamMembers", m.id));
        });
        batch.commit().then(() => {
          toast({ 
            variant: "destructive",
            title: "Maintenance Sync Triggered", 
            description: `Auto-purged ${blacklistedInRegistry.length} restricted identifiers from the registry.` 
          });
        });
      }
    }
  }, [isMasterUser, team, db]);

  const filteredUsers = useMemo(() => {
    if (!team) return [];
    return team.filter(member => 
      member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [team, searchQuery]);

  const handlePurgeOthers = async () => {
    if (!isMasterUser || !team) return;
    
    setIsPurging(true);
    try {
      const batch = writeBatch(db);
      let count = 0;
      
      team.forEach(member => {
        if (member.email?.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
          batch.delete(doc(db, "teamMembers", member.id));
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        toast({ title: "System Purge Complete", description: `Successfully removed ${count} identities from the registry.` });
      } else {
        toast({ title: "Purge Unnecessary", description: "No other identities found in the system." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failure", description: e.message });
    } finally {
      setIsPurging(false);
    }
  };

  const handleUpdateRole = (userId: string, roleId: string) => {
    const userRef = doc(db, "teamMembers", userId);
    updateDocumentNonBlocking(userRef, { roleId, updatedAt: serverTimestamp() });
    toast({ title: "Authority Synchronized", description: "User role has been updated." });
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const userRef = doc(db, "teamMembers", userId);
    let newStatus = "Active";
    if (currentStatus === "Active") newStatus = "Suspended";
    else if (currentStatus === "Pending") newStatus = "Active";
    else if (currentStatus === "Suspended") newStatus = "Active";

    updateDocumentNonBlocking(userRef, { status: newStatus, updatedAt: serverTimestamp() });
    toast({ 
      variant: newStatus === "Suspended" ? "destructive" : "default",
      title: `Identity ${newStatus}`, 
      description: `Access policy updated for the selected account.` 
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const userRef = doc(db, "teamMembers", userId);
    deleteDocumentNonBlocking(userRef);
    toast({ 
      variant: "destructive",
      title: "Identity Deleted", 
      description: `${userName} has been removed from the registry.` 
    });
  };

  const formatDate = (val: any) => {
    if (!val) return "—";
    try {
      if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString('en-GB');
      if (typeof val === 'string') return new Date(val).toLocaleDateString('en-GB');
    } catch (e) {
      return "—";
    }
    return "—";
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Authorizing Executive Access...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0"
            onClick={() => router.push("/admin")}
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Identity & RBAC Hub</h1>
              <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Root Authority
              </Badge>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-normal">Manage Role-Based Access Control, verify identities, and approve system access.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isMasterUser && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isPurging} className="h-12 px-6 rounded-xl font-bold text-destructive border-destructive/20 hover:bg-destructive/5 gap-2 tracking-normal transition-all">
                  {isPurging ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Purge Others
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 text-destructive mb-2">
                    <AlertTriangle className="h-6 w-6" />
                    <AlertDialogTitle className="font-headline text-xl">Critical Maintenance Action</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-slate-500 font-medium">
                    This will permanently remove **ALL** user identities from the system registry except for **{MASTER_EMAIL}**. This action is irreversible and should only be used for system cleanup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-6">
                  <AlertDialogCancel className="rounded-xl font-bold text-xs uppercase">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePurgeOthers} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold px-8 uppercase text-xs">
                    Confirm Full Purge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-2 tracking-normal shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-10 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Provision Team Member</DialogTitle>
              </DialogHeader>
              <TeamMemberForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Hourglass className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Approval</p>
            <h3 className="text-3xl font-bold font-headline mt-1 text-orange-600">{team?.filter(m => m.status === 'Pending').length || 0}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Identities</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{team?.filter(m => m.status === 'Active').length || 0}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Key className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Roles</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{roles?.length || 0}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-50 uppercase tracking-widest">Access Protocol</p>
            <h3 className="text-2xl font-bold font-headline mt-1 uppercase">RBAC Enforced</h3>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search identities by name or executive email..." 
            className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base font-bold" 
          />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-xl font-bold font-headline tracking-normal">Identity Governance Ledger</CardTitle>
          <CardDescription className="tracking-normal">Audit, approve, and manage system-wide entitlements for all production experts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {teamLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-10 text-[10px] font-bold uppercase tracking-widest">Identity</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Strategic Role</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Joined</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((member) => (
                    <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-md">
                            <AvatarImage src={member.thumbnail} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">{member.firstName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 tracking-tight">{member.firstName} {member.lastName}</p>
                              {member.email?.toLowerCase() === MASTER_EMAIL.toLowerCase() && <Zap className="h-3.5 w-3.5 text-primary fill-primary/10" />}
                              {BLACKLISTED_EMAILS.includes(member.email?.toLowerCase() || "") && <ShieldBan className="h-3.5 w-3.5 text-red-500" />}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          disabled={BLACKLISTED_EMAILS.includes(member.email?.toLowerCase() || "")}
                          value={member.roleId || "none"} 
                          onValueChange={(val) => handleUpdateRole(member.id, val)}
                        >
                          <SelectTrigger className="h-10 w-48 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-widest">
                            <SelectValue placeholder="Assign Role" />
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
                          member.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {member.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-slate-400 uppercase">
                        {formatDate(member.createdAt)}
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-2xl">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 px-3">Administrative Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/team/${member.id}`} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                                  <UserCheck className="h-4 w-4 text-blue-500" />
                                  <span className="font-bold text-xs">View Full Intel</span>
                                </Link>
                              </DropdownMenuItem>
                              
                              {member.status !== 'Active' && !BLACKLISTED_EMAILS.includes(member.email?.toLowerCase() || "") && (
                                <DropdownMenuItem 
                                  onClick={() => handleToggleStatus(member.id, member.status)}
                                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-green-600 focus:text-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-bold text-xs">Approve Access</span>
                                </DropdownMenuItem>
                              )}

                              {member.status === 'Active' && member.email?.toLowerCase() !== MASTER_EMAIL.toLowerCase() && (
                                <DropdownMenuItem 
                                  onClick={() => handleToggleStatus(member.id, member.status)}
                                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-orange-600 focus:text-orange-700"
                                >
                                  <ShieldAlert className="h-4 w-4" />
                                  <span className="font-bold text-xs">Suspend Access</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    disabled={member.email?.toLowerCase() === MASTER_EMAIL.toLowerCase()}
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="font-bold text-xs">Delete Identity</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                  <AlertDialogHeader>
                                    <div className="flex items-center gap-3 text-destructive mb-2">
                                      <AlertTriangle className="h-6 w-6" />
                                      <AlertDialogTitle className="font-headline text-xl">Confirm Delete</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="text-slate-500 font-medium">
                                      This will permanently delete the identity <span className="font-bold text-slate-900">{member.firstName} {member.lastName}</span> from the organizational registry. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3 mt-6">
                                    <AlertDialogCancel className="rounded-xl font-bold text-xs uppercase tracking-normal">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(member.id, `${member.firstName} ${member.lastName}`)} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold px-8 uppercase text-xs tracking-normal">
                                      Confirm Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Users className="h-12 w-12 text-slate-200" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registry is currently empty</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
