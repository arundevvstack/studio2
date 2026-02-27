
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Users as UsersIcon, 
  Activity, 
  Server, 
  CheckCircle2, 
  Loader2,
  Search,
  Hourglass,
  BadgeCheck,
  ShieldX,
  Trash2,
  AlertTriangle,
  MoreHorizontal,
  Filter,
  Zap,
  ChevronLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc, serverTimestamp } from "firebase/firestore";
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

const PHASES = [
  { id: "sales", label: "Sales Phase" },
  { id: "production", label: "Production Phase" },
  { id: "release", label: "Release Phase" },
  { id: "socialMedia", label: "Social Media Phase" }
];

const ROLES = ["strategic", "sales", "production", "admin"];

/**
 * @fileOverview Consolidated Admin Console.
 * Manages system-wide metrics, operational status, and Integrated Access Governance.
 * Gated by strictly "Active" Access Status in the authoritative Identity Registry.
 */

export default function AdminConsolePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<any>(null);

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
        router.push("/login");
      }
    }
  }, [user, isUserLoading, router, identity, identityLoading, mounted]);

  // Fetch all users for management
  const usersQuery = useMemoFirebase(() => {
    if (!user || user.isAnonymous) return null;
    return query(collection(db, "users"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  const handleUpdateAccess = async (userId: string, data: any) => {
    const userRef = doc(db, "users", userId);
    updateDocumentNonBlocking(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Access Updated", description: "Identity metadata synchronized." });
  };

  const handleTogglePhase = (userId: string, phase: string, currentPhases: string[]) => {
    const updated = currentPhases.includes(phase)
      ? currentPhases.filter(p => p !== phase)
      : [...currentPhases, phase];
    handleUpdateAccess(userId, { permittedPhases: updated });
  };

  const executeDeleteUser = () => {
    if (userToDelete) {
      deleteDocumentNonBlocking(doc(db, "users", userToDelete.id));
      toast({ variant: "destructive", title: "User Deleted", description: `${userToDelete.name} removed from registry.` });
      setUserToDelete(null);
    }
  };

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
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Admin</h1>
            <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Root Access
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">High-level system oversight, operational health, and organization security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
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
            <UsersIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Users</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">
              {allUsers?.filter(u => u.status === 'active').length || 0}
            </h3>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[10px] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Hourglass className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Pending Users</p>
            <h3 className="text-3xl font-bold font-headline mt-1 text-orange-600 tracking-normal">
              {allUsers?.filter(u => u.status === 'pending').length || 0}
            </h3>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[10px] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Zap className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Access Request</p>
            <h3 className="text-3xl font-bold font-headline mt-1 text-purple-600 tracking-normal">
              {allUsers?.filter(u => u.status === 'pending').length || 0}
            </h3>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[10px] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Users</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{allUsers?.length || 0}</h3>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Access Governance</h2>
            <p className="text-sm text-slate-500 font-medium tracking-normal">Manage user authorization, strategic roles, and phase-level permissions.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search expert registry by name or email..." 
              className="pl-12 h-12 bg-white border-none shadow-sm rounded-xl text-base font-bold tracking-normal" 
            />
          </div>
        </div>

        <Card className="border-none shadow-sm rounded-[10px] bg-white overflow-hidden border border-slate-50">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Users</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Role</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Access</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phase Permits</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow><TableCell colSpan={5} className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filteredUsers.map((u) => (
                <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                        <AvatarImage src={u.photoURL || `https://picsum.photos/seed/${u.id}/200/200`} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{u.name?.[0] || 'E'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 tracking-tight">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={u.role || "none"} onValueChange={(val) => handleUpdateAccess(u.id, { role: val === 'none' ? null : val })}>
                      <SelectTrigger className="h-10 w-40 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-widest focus:ring-primary/20">
                        <SelectValue placeholder="No Assignment" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                        <SelectItem value="none" className="text-[10px] font-bold uppercase">No Role</SelectItem>
                        {ROLES.map(r => <SelectItem key={r} value={r} className="text-[10px] font-bold uppercase">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={u.strategicPermit} 
                        onCheckedChange={(val) => handleUpdateAccess(u.id, { strategicPermit: val, status: val ? 'active' : 'suspended' })} 
                      />
                      <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full tracking-widest ${
                        u.status === 'active' ? 'bg-green-50 text-green-600' : 
                        u.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2 max-w-[220px]">
                      {PHASES.map(p => (
                        <Badge 
                          key={p.id} 
                          variant={u.permittedPhases?.includes(p.id) ? "default" : "outline"}
                          onClick={() => handleTogglePhase(u.id, p.id, u.permittedPhases || [])}
                          className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                            u.permittedPhases?.includes(p.id) 
                              ? "bg-primary border-none text-white shadow-sm" 
                              : "bg-white text-slate-300 border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {p.id}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-56 p-2 shadow-2xl border-slate-100">
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Identity Governance</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateAccess(u.id, { status: "active", strategicPermit: true })} className="rounded-lg p-2.5 cursor-pointer gap-3 font-bold text-xs text-green-600">
                          <CheckCircle2 className="h-4 w-4" /> Authorize Access
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateAccess(u.id, { status: "suspended", strategicPermit: false })} className="rounded-lg p-2.5 cursor-pointer gap-3 font-bold text-xs text-orange-600">
                          <ShieldX className="h-4 w-4" /> Suspend Expert
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setUserToDelete(u); }} className="rounded-lg p-2.5 cursor-pointer gap-3 font-bold text-xs text-destructive hover:bg-destructive/5">
                          <Trash2 className="h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(o) => !o && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[10px] border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle className="font-headline text-xl">Confirm Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-500 font-medium leading-relaxed">
              You are about to irreversibly remove <span className="font-bold text-slate-900">{userToDelete?.name}</span> from the organizational registry. This will revoke all future access attempts and terminate their strategic profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl font-bold text-xs uppercase tracking-normal">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteUser} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold px-8 uppercase text-xs tracking-normal">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
