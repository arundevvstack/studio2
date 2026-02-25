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
  Sparkles
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
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function ProposalsRegistryPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = React.useState("");

  const proposalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "proposals"), orderBy("updatedAt", "desc"));
  }, [db, user]);

  const { data: proposals, isLoading } = useCollection(proposalsQuery);

  const stats = useMemo(() => {
    if (!proposals) return { total: 0, pending: 0, winRate: 0 };
    const total = proposals.length;
    const approved = proposals.filter(p => p.status === 'Approved').length;
    const pending = proposals.filter(p => p.status === 'Sent to Client' || p.status === 'Under Review').length;
    return { 
      total, 
      pending, 
      winRate: total > 0 ? Math.round((approved / total) * 100) : 0 
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

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">Smart Proposals</h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              <Sparkles className="h-3 w-3 mr-1" /> AI Optimized
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Generate, validate, and track high-stakes production bids.</p>
        </div>
        <Button asChild className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Link href="/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Proposals</p>
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
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conversion Rate</p>
            <h3 className="text-3xl font-bold font-headline mt-1">{stats.winRate}%</h3>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400 font-bold" 
            placeholder="Search proposals by client or project..." 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm text-xs uppercase tracking-widest">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Proposal Entity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Investment</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredProposals.length > 0 ? (
                filteredProposals.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="px-10 py-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 tracking-tight">{p.projectTitle}</h4>
                          {p.status === 'Approved' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{p.clientName} • {p.brandName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-100 text-slate-500 font-bold text-[9px] uppercase px-3 py-1 rounded-lg">
                        {p.projectType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900 tracking-tight">{p.budgetRange}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full ${
                        p.status === 'Approved' ? 'bg-green-50 text-green-600' :
                        p.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                        p.status === 'Sent to Client' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-none">
                          <Link href={`/proposals/${p.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all shadow-none">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center text-slate-400 font-medium italic">
                    No proposals found in the registry.
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
