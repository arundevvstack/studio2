
"use client";

import React, { useMemo } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  MoreHorizontal,
  Loader2,
  Filter,
  Sparkles,
  IndianRupee,
  Briefcase,
  Printer,
  Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview Proposals Registry.
 * Master list of all strategic bids and AI-synthesized proposals.
 */

export default function ProposalsRegistryPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch Member & Role for Deletion Authority
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member } = useDoc(memberRef);

  const roleRef = useMemoFirebase(() => {
    if (!member?.roleId) return null;
    return doc(db, "roles", member.roleId);
  }, [db, member?.roleId]);
  const { data: role } = useDoc(roleRef);

  const isAuthorizedToDelete = role?.name === "Administrator" || role?.name === "root Administrator" || role?.name === "Root Administrator";

  const proposalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "proposals"), orderBy("updatedAt", "desc"));
  }, [db, user]);

  const { data: proposals, isLoading } = useCollection(proposalsQuery);

  const stats = useMemo(() => {
    if (!proposals) return { total: 0, pending: 0, winRate: 0, totalValue: 0 };
    const total = proposals.length;
    const approved = proposals.filter(p => p.status === 'Approved').length;
    const pending = proposals.filter(p => p.status === 'Sent to Client' || p.status === 'Under Review' || p.status === 'Validated').length;
    const totalValue = proposals.reduce((acc, p) => acc + (p.totalBudget || 0), 0);
    return { 
      total, 
      pending, 
      winRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      totalValue
    };
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    if (!proposals) return [];
    return proposals.filter(p => 
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [proposals, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!isAuthorizedToDelete) {
      toast({ variant: "destructive", title: "Access Denied", description: "You lack the authority to purge strategic bids." });
      return;
    }
    if (!confirm(`Are you sure you want to purge proposal: ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "proposals", id));
      toast({ title: "Proposal Purged", description: "The bid has been removed from the registry." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed", description: e.message });
    }
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">Smart Proposals</h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              <Sparkles className="h-3 w-3 mr-1" /> AI Synthesis
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Generate and manage high-stakes production bids with market intelligence.</p>
        </div>
        <Button asChild className="h-14 px-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] text-sm uppercase tracking-widest">
          <Link href="/proposals/new">
            <Plus className="h-5 w-5 mr-2" />
            Create Proposal
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Registry</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{stats.total}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Decision</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{stats.pending}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Potential</p>
            <h3 className="text-3xl font-bold font-headline mt-1">₹{(stats.totalValue / 1000).toFixed(0)}k</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Win Efficiency</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{stats.winRate}%</h3>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base placeholder:text-slate-400 font-bold" 
            placeholder="Search proposals by client, brand or title..." 
          />
        </div>
        <Button variant="outline" className="h-16 px-8 bg-white border-slate-100 rounded-full font-bold text-slate-600 gap-3 shadow-sm text-xs uppercase tracking-widest">
          <Filter className="h-4 w-4" />
          Refine Registry
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden border border-slate-50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Proposal Entity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vertical</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quote Value</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Bids...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProposals.length > 0 ? (
                filteredProposals.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                          <FileText className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 tracking-tight text-lg">{p.projectTitle}</h4>
                            {p.status === 'Approved' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{p.clientName} • {p.brandName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-100 text-slate-500 font-bold text-[9px] uppercase px-4 py-1 rounded-xl">
                        {p.projectType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900 text-lg tracking-tight">₹{(p.totalBudget || 0).toLocaleString('en-IN')}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`border-none font-bold text-[9px] uppercase px-4 py-1.5 rounded-full tracking-widest ${
                        p.status === 'Approved' ? 'bg-green-50 text-green-600' :
                        p.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                        p.status === 'Sent to Client' ? 'bg-blue-50 text-blue-600' :
                        p.status === 'Validated' ? 'bg-primary/10 text-primary' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex items-center justify-end gap-3">
                        <Button asChild className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-primary text-white font-bold text-[10px] uppercase transition-all shadow-lg shadow-primary/20 border-none">
                          <Link href={`/proposals/${p.id}`}>
                            Open Hub
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl w-52 p-2 shadow-2xl border-slate-100">
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Quick Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer gap-3">
                              <Link href={`/proposals/${p.id}/view`}>
                                <Printer className="h-4 w-4 text-slate-600" />
                                <span className="font-bold text-xs">Print Ready PDF</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer gap-3">
                              <Link href={`/proposals/${p.id}`}>
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="font-bold text-xs">AI Synthesis</span>
                              </Link>
                            </DropdownMenuItem>
                            {isAuthorizedToDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(p.id, p.projectTitle)}
                                  className="rounded-xl p-3 cursor-pointer gap-3 text-destructive focus:text-destructive focus:bg-destructive/5"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="font-bold text-xs">Purge Bid</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-48 text-center px-10">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
                        <Briefcase className="h-10 w-10 text-slate-200" />
                      </div>
                      <div className="max-w-xs mx-auto space-y-2">
                        <p className="text-xl font-bold font-headline text-slate-400 uppercase tracking-widest">Registry Empty</p>
                        <p className="text-sm text-slate-300 italic font-medium leading-relaxed">No strategic proposals have been generated yet. Initiate your first bid from the dashboard.</p>
                      </div>
                      <Button asChild className="h-14 px-10 rounded-2xl font-bold bg-primary text-white shadow-2xl shadow-primary/20 transition-all uppercase text-xs tracking-widest">
                        <Link href="/proposals/new">Deploy First Bid</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
