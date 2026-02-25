
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
  AlertTriangle 
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
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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

/**
 * @fileOverview Role-Based Access Control (RBAC) Hub.
 * Provides high-level administrative oversight of all system users and their roles.
 * Restricted destructive actions to Administrator and root Administrator.
 */

export default function UserManagementPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPurging, setIsPurging] = useState(false);

  // Fetch user record status for access guard
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

  const isAuthorizedToDelete = userRole?.name === "Administrator" || userRole?.name === "root Administrator" || userRole?.name === "Root Administrator";

  // Strategic Access Guard
  useEffect(() => {
    if (!isUserLoading && !memberLoading) {
      if (!currentUser) {
        router.push("/login");
      } else if (!currentUser.isAnonymous && currentUserMember && currentUserMember.status !== "Active") {
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, currentUserMember, memberLoading, router]);

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

  const filteredUsers = useMemo(() => {
    if (!team) return [];
    return team.filter(member => 
      member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [team, searchQuery]);

  const pendingCount = useMemo(() => team?.filter(m => m.status === 'Pending').length || 0, [team]);

  const handleUpdateRole = (userId: string, roleId: string) => {
    const userRef = doc(db, "teamMembers", userId);
    updateDocumentNonBlocking(userRef, { roleId, updatedAt: serverTimestamp() });
    toast({ title: "Authority Synchronized", description: "User role has been updated." });
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const userRef = doc(db, "teamMembers", userId);
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    updateDocumentNonBlocking(userRef, { status: newStatus, updatedAt: serverTimestamp() });
    toast({ 
      variant: newStatus === "Suspended" ? "destructive" : "default",
      title: `Identity ${newStatus}`, 
      description: `Access policy updated for the selected account.` 
    });
  };

  const handleActivate = (userId: string) => {
    const userRef = doc(db, "teamMembers", userId);
    updateDocumentNonBlocking(userRef, { status: "Active", updatedAt: serverTimestamp() });
    toast({ title: "Access Granted", description: "User has been activated in the workspace." });
  };

  const handlePurgeRegistry = async () => {
    if (!isAuthorizedToDelete) {
      toast({ variant: "destructive", title: "Access Denied", description: "You lack the authority to execute a registry purge." });
      return;
    }
    setIsPurging(true);
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, "teamMembers"));
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      toast({ 
        variant: "destructive",
        title: "Registry Purged", 
        description: "All personnel records have been successfully removed from the system." 
      });
      
      router.push("/logout");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Purge Failed", description: error.message });
      setIsPurging(false);
    }
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

  if (isUserLoading || memberLoading || isPurging) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
          {isPurging ? "Executing Registry Purge..." : "Authorizing RBAC Suite..."}
        </p>
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
            <p className="text-sm text-slate-500 font-medium tracking-normal">Manage Role-Based Access Control, verify identities, and enforce system policies.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAuthorizedToDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 transition-all shadow-sm">
                  <Trash2 className="h-4 w-4" />
                  Purge Registry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 text-red-600 mb-2">
                    <AlertTriangle className="h-6 w-6" />
                    <AlertDialogTitle className="font-headline text-xl">Critical Action: Purge Registry</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                    This will permanently delete **ALL** registered identity records from the Firestore database. You and all other users will lose workspace access until new identities are provisioned and approved. 
                    <br /><br />
                    <span className="font-bold text-slate-900">Note:</span> This does not delete Firebase Authentication accounts. You must remove those manually in the Firebase Console.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-6">
                  <AlertDialogCancel className="rounded-xl font-bold text-xs uppercase tracking-normal">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePurgeRegistry} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-8 uppercase text-xs tracking-normal">
                    Confirm Purge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Activation</p>
            <h3 className="text-3xl font-bold font-headline mt-1 text-orange-600">{pendingCount}</h3>
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Protocol</p>
            <h3 className="text-2xl font-bold font-headline mt-1 uppercase">RBAC Active</h3>
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
        <Button variant="outline" className="h-16 px-8 bg-white border-slate-100 rounded-full font-bold text-slate-600 gap-2 shadow-sm tracking-widest uppercase text-xs">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-xl font-bold font-headline tracking-normal">Role-Based Access Control Hub</CardTitle>
          <CardDescription className="tracking-normal">Audit and manage system-wide entitlements for all provisioned production experts.</CardDescription>
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
                            <p className="font-bold text-slate-900 tracking-tight">{member.firstName} {member.lastName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
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
                          {member.status === 'Pending' && (
                            <Button 
                              onClick={() => handleActivate(member.id)}
                              disabled={!member.roleId || member.roleId === 'none'}
                              className="h-9 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
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
                              {isAuthorizedToDelete && (
                                <DropdownMenuItem 
                                  onClick={() => handleToggleStatus(member.id, member.status)}
                                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-destructive focus:text-destructive"
                                >
                                  {member.status === 'Active' ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                  <span className="font-bold text-xs">{member.status === 'Active' ? 'Suspend Account' : 'Activate Account'}</span>
                                </DropdownMenuItem>
                              )}
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
