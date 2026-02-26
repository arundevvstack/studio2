
"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft, 
  Hourglass,
  Shield, 
  Trash2, 
  AlertTriangle,
  Zap,
  ShieldBan,
  Filter,
  BadgeCheck,
  ShieldX,
  Plus,
  ArrowRight,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { collection, query, orderBy, doc, serverTimestamp, updateDoc } from "firebase/firestore";
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
 * @fileOverview Identity Governance Hub.
 * Manages Strategic Permits, Roles, and Phase-Level Access.
 * Synchronizes metadata with Firebase Custom Claims triggers.
 */
export default function UserManagementPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [userToPurge, setUserToPurge] = useState<any>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!currentUser) return null;
    return query(collection(db, "users"), orderBy("updatedAt", "desc"));
  }, [db, currentUser]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleUpdatePermit = async (userId: string, data: any) => {
    const userRef = doc(db, "users", userId);
    
    // Non-blocking update for UI responsiveness
    updateDocumentNonBlocking(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    toast({ title: "Authorization Updated", description: "Identity metadata synchronized." });
  };

  const handleTogglePhase = (userId: string, phase: string, currentPhases: string[]) => {
    const updated = currentPhases.includes(phase)
      ? currentPhases.filter(p => p !== phase)
      : [...currentPhases, phase];
    handleUpdatePermit(userId, { permittedPhases: updated });
  };

  const executePurge = () => {
    if (userToPurge) {
      deleteDocumentNonBlocking(doc(db, "users", userToPurge.id));
      toast({ variant: "destructive", title: "Identity Purged", description: `${userToPurge.name} removed from registry.` });
      setUserToPurge(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20 font-body">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white border-slate-200" onClick={() => router.push("/admin")}>
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">Strategic Authorization</h1>
            <p className="text-sm text-slate-500 font-medium">Authorize expert permits, assign strategic roles, and manage phase-level access.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center"><Hourglass className="h-5 w-5 text-orange-500" /></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Permits</p><h3 className="text-3xl font-bold font-headline mt-1 text-orange-600">{users?.filter(u => u.status === 'pending').length || 0}</h3></div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center"><BadgeCheck className="h-5 w-5 text-primary" /></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Permits</p><h3 className="text-3xl font-bold font-headline mt-1">{users?.filter(u => u.status === 'active').length || 0}</h3></div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search expert registry by name or email..." className="pl-16 h-16 bg-white border-none shadow-xl rounded-2xl text-base font-bold" />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden border border-slate-50">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Identity Identifier</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Role</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Permit</TableHead>
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
                    <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-xl">
                      <AvatarImage src={u.photoURL || `https://picsum.photos/seed/${u.id}/200/200`} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">{u.name?.[0] || 'E'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900 tracking-tight text-lg">{u.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                        <Badge variant="outline" className="text-[7px] font-bold uppercase border-slate-100 py-0 h-4">{u.provider}</Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={u.role || "none"} onValueChange={(val) => handleUpdatePermit(u.id, { role: val === 'none' ? null : val })}>
                    <SelectTrigger className="h-12 w-44 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-widest focus:ring-primary/20">
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
                      onCheckedChange={(val) => handleUpdatePermit(u.id, { strategicPermit: val, status: val ? 'active' : 'suspended' })} 
                    />
                    <Badge className={`border-none font-bold text-[9px] uppercase px-4 py-1.5 rounded-full tracking-widest ${
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
                        className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                          u.permittedPhases?.includes(p.id) 
                            ? "bg-primary border-none text-white shadow-lg shadow-primary/20" 
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
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl w-60 p-2 shadow-2xl border-slate-100">
                      <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Identity Governance</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdatePermit(u.id, { status: "active", strategicPermit: true })} className="rounded-xl p-3 cursor-pointer gap-3 font-bold text-xs text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Authorize Permit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdatePermit(u.id, { status: "suspended", strategicPermit: false })} className="rounded-xl p-3 cursor-pointer gap-3 font-bold text-xs text-orange-600">
                        <ShieldX className="h-4 w-4" /> Suspend Expert
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setUserToPurge(u)} className="rounded-xl p-3 cursor-pointer gap-3 font-bold text-xs text-destructive hover:bg-destructive/5">
                        <Trash2 className="h-4 w-4" /> Purge Identifier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!userToPurge} onOpenChange={(o) => !o && setUserToPurge(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 text-destructive mb-4">
              <AlertTriangle className="h-10 w-10" />
              <AlertDialogTitle className="text-2xl font-bold font-headline tracking-tight">Confirm Purge</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-slate-500 font-medium leading-relaxed">
              You are about to irreversibly remove <span className="font-bold text-slate-900">{userToPurge?.name}</span> from the organizational registry. This will revoke all future access attempts and terminate their strategic profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="h-14 px-8 rounded-2xl font-bold text-xs uppercase tracking-widest bg-slate-50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executePurge} className="h-14 px-8 rounded-2xl font-bold text-xs uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20">
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
