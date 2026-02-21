"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Send, Filter, MoreHorizontal, FileText, CheckCircle2, Clock, AlertCircle, Search, Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function InvoicesPage() {
  const db = useFirestore();
  const { user } = useUser();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: projects, isLoading } = useCollection(projectsQuery);

  const stats = useMemo(() => {
    if (!projects) return { total: 0, pending: 0, overdue: 0 };
    const total = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const pending = projects.filter(p => p.status !== "Released").length;
    return { total, pending, overdue: 0 };
  }, [projects]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Billing & Revenue</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Manage strategic financial records and project quotes.</p>
        </div>
        <Button asChild className="h-12 px-6 shadow-lg shadow-primary/20 font-bold rounded-xl tracking-normal">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Asset Value (Portfolio)</p>
              <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">₹{stats.total.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Contracts</p>
              <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{stats.pending}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">High Risk Entities</p>
              <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">0</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-bold font-headline text-slate-900 tracking-normal">Recent Production Ledger</h3>
          <Button variant="outline" size="sm" className="gap-2 border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-normal">
            <Filter className="h-3.5 w-3.5" />
            Refine
          </Button>
        </div>
        
        {isLoading ? (
          <div className="p-24 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : projects && projects.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Entity ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-normal">Production Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-normal">Strategic Quote</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-normal">Phase</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((proj) => (
                <TableRow key={proj.id} className="group transition-colors">
                  <TableCell className="font-bold text-primary px-10 tracking-normal">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-300" />
                      #{proj.id.substring(0, 8).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 tracking-normal">{proj.name}</TableCell>
                  <TableCell className="font-bold text-slate-900 tracking-normal">₹{(proj.budget || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge className={`border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal ${proj.status === 'Released' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                      {proj.status || "Planned"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                        <Link href={`/invoices/${proj.id}/view`}>
                          <Download className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center space-y-6">
            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center p-6 shadow-inner">
              <Search className="h-full w-full text-slate-200" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No Production Entities Found</p>
              <Button asChild variant="link" className="text-primary font-bold text-xs tracking-normal">
                <Link href="/projects/new">Initiate your first production pitch</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
