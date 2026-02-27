"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Users as UsersIcon, 
  Loader2,
  Search,
  Hourglass,
  ShieldX,
  Trash2,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle2,
  Lock,
  LayoutGrid,
  Filter
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { collection, query, orderBy, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const ROLES = ["admin", "manager", "editor", "viewer"];

export default function AdminConsolePage() {
  const db = useFirestore();
  const { user: adminUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const usersQuery = useMemoFirebase(() => {
    return query(collection(db, "users"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: allUsers, isLoading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allUsers, searchQuery, statusFilter]);

  const handleUpdateUser = async (userId: string, data: any) => {
    const userRef = doc(db, "users", userId);
    try {
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Identity Updated", description: "Metadata synchronized." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    }
  };

  const handleApprove = (user: any) => {
    handleUpdateUser(user.id, {
      status: "approved",
      approvedBy: adminUser?.uid,
      approvedAt: serverTimestamp()
    });
  };

  const handleSuspend = (user: any) => {
    handleUpdateUser(user.id, { status: "suspended" });
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      // Execute deletion from Firestore registry
      deleteDocumentNonBlocking(doc(db, "users", userToDelete.id));
      
      toast({ 
        title: "User Purged", 
        description: `${userToDelete.name} removed from registry.` 
      });
      setUserToDelete(null);
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Delete Failed", 
        description: e.message 
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Enterprise Governance</h1>
            <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold px-3 py-1 uppercase">
              Root Access
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium">Authorize expert permits and assign strategic organizational roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <Hourglass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approval</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{(allUsers || []).filter(u => u.status === 'pending').length}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Licenses</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{(allUsers || []).filter(u => u.status === 'approved').length}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <ShieldX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suspended</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{(allUsers || []).filter(u => u.status === 'suspended').length}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Registry</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{(allUsers || []).length}</h3>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search expert registry..." 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-base font-bold" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-14 w-full md:w-[200px] rounded-2xl bg-white border-none shadow-sm font-bold text-xs uppercase tracking-widest">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl">
            <SelectItem value="all">ALL STATUSES</SelectItem>
            <SelectItem value="pending">PENDING</SelectItem>
            <SelectItem value="approved">APPROVED</SelectItem>
            <SelectItem value="suspended">SUSPENDED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden border border-slate-50">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest">Identity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Strategic Role</TableHead>
              <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : filteredUsers.map((u) => (
              <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm">
                      <AvatarImage src={u.photoURL || `https://picsum.photos/seed/${u.id}/200/200`} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{u.name?.[0] || 'E'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900 tracking-tight">{u.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{u.email}</p>
                      <Badge className={`mt-2 border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-lg ${
                        u.status === 'approved' ? 'bg-green-50 text-green-600' : 
                        u.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.status}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strategic Role</p>
                    <Select value={u.role || "none"} onValueChange={(val) => handleUpdateUser(u.id, { role: val === 'none' ? null : val })}>
                      <SelectTrigger className="h-10 w-40 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-widest">
                        <SelectValue placeholder="Assign Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Role</SelectItem>
                        {ROLES.map(r => <SelectItem key={r} value={r} className="uppercase text-[10px] font-bold">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-right px-10">
                  <div className="flex flex-col items-end gap-2">
                    {u.status !== 'approved' && (
                      <Button onClick={() => handleApprove(u)} size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-[10px] uppercase w-32">
                        <CheckCircle2 className="h-3 w-3 mr-2" /> Approve
                      </Button>
                    )}
                    {u.status !== 'suspended' && (
                      <Button onClick={() => handleSuspend(u)} size="sm" variant="outline" className="border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-bold text-[10px] uppercase w-32">
                        <ShieldX className="h-3 w-3 mr-2" /> Suspend
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 mt-2"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-2xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Registry Cleanup</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setUserToDelete(u)} className="rounded-xl p-3 cursor-pointer gap-3 text-destructive font-bold text-xs">
                          <Trash2 className="h-4 w-4" /> Purge Identity
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(o) => !o && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-10">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 text-destructive mb-4">
              <AlertTriangle className="h-10 w-10" />
              <AlertDialogTitle className="text-2xl font-bold font-headline">Confirm Identity Purge</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-slate-500 font-medium">
              You are about to irreversibly remove <span className="font-bold text-slate-900">{userToDelete?.name}</span> from the organizational registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="h-14 px-8 rounded-2xl font-bold text-xs uppercase tracking-widest bg-slate-50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="h-14 px-8 rounded-2xl font-bold text-xs uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20">
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
