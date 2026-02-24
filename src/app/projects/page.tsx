
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  LayoutGrid,
  List,
  Loader2,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Target,
  GitBranch,
  CheckCircle2,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card } from "@/components/ui/card";

type ViewMode = "list" | "grid";

/**
 * @fileOverview Projects Registry.
 * High-fidelity production management with high-density grid (5 items line).
 * Decoupled from user session for testing mode stability.
 */

export default function ProjectsPage() {
  const db = useFirestore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db]);
  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const projectsQuery = useMemoFirebase(() => {
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: projects, isLoading: isLoadingProjects } = useCollection(projectsQuery);

  const clientMap = useMemo(() => {
    const map = new Map();
    clients?.forEach(c => map.set(c.id, c.name));
    return map;
  }, [clients]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      const clientName = clientMap.get(p.clientId) || p.clientName || "";
      return p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             clientName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [projects, searchQuery, clientMap]);

  const productionProjects = useMemo(() => 
    filteredProjects.filter(p => p.clientId !== "PIPELINE"), 
  [filteredProjects]);

  const pipelineProjects = useMemo(() => 
    filteredProjects.filter(p => p.clientId === "PIPELINE"), 
  [filteredProjects]);

  const isLoading = isLoadingClients || isLoadingProjects;

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900 leading-none">Projects Registry</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal mt-2">
            Managing global production assets and high-fidelity deliverables.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center bg-white p-1.5 rounded-full shadow-sm border border-slate-100 shrink-0">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={`h-11 w-11 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={`h-11 w-11 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
          <Button asChild className="h-14 px-10 shadow-2xl shadow-primary/30 font-bold rounded-full tracking-widest bg-primary hover:bg-primary/90 text-white border-none transition-all active:scale-95 text-xs uppercase">
            <Link href="/projects/new">
              <Plus className="h-5 w-5 mr-2" />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base tracking-normal placeholder:text-slate-400 font-bold" 
          placeholder="Filter projects by entity name or client partner..." 
        />
      </div>

      {pipelineProjects.length > 0 && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4 px-4">
            <div className="h-12 w-12 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <GitBranch className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-tight leading-none">Pipeline Sync</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Discussion Entities</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {pipelineProjects.map((p) => (
              <Card key={p.id} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500 border border-slate-50 h-64 flex flex-col justify-between p-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Lead Intel
                    </Badge>
                    <Target className="h-5 w-5 text-blue-200 opacity-20" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{p.clientName || clientMap.get(p.clientId)}</p>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight leading-tight line-clamp-2">{p.name}</h4>
                  </div>
                </div>
                <Button asChild variant="ghost" className="w-full h-12 rounded-full bg-slate-50 hover:bg-blue-500 hover:text-white text-slate-900 font-bold text-[10px] uppercase transition-all gap-2 tracking-widest border-none">
                  <Link href={`/pipeline/leads/${p.id}`}>Analyze Lead +</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Global Workspace...</p>
          </div>
        ) : productionProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {productionProjects.map((project) => (
                <Card key={project.id} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                  <div className="p-4 flex-grow">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2.2rem] shadow-sm">
                      <img 
                        src={`https://picsum.photos/seed/${project.id}/600/450`} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt="Project Visual" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold text-[8px] uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                          {project.status || "DISCUSSION"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 left-8 right-8">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest truncate">{clientMap.get(project.clientId)}</p>
                          <CheckCircle2 className="h-3 w-3 text-green-400 fill-green-400/20" />
                        </div>
                        <h3 className="text-2xl font-bold font-headline text-white tracking-tight leading-tight line-clamp-2">{project.name}</h3>
                      </div>
                    </div>

                    <div className="px-6 py-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Value</p>
                          <p className="text-xl font-bold text-slate-900 tracking-tight">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {project.crew?.slice(0, 3).map((member: any, i: number) => (
                            <Avatar key={i} className="h-10 w-10 border-4 border-white shadow-sm rounded-xl">
                              <AvatarImage src={member.thumbnail} />
                              <AvatarFallback className="text-[10px] font-bold bg-slate-50">{member.name?.[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {(project.crew?.length || 0) > 3 && (
                            <div className="h-10 w-10 rounded-xl bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                              +{project.crew.length - 3}
                            </div>
                          )}
                        </div>
                        <Button asChild className="rounded-full h-11 px-8 bg-slate-900 hover:bg-primary text-white font-bold text-[10px] uppercase transition-all gap-2 tracking-widest shadow-xl shadow-slate-200 border-none">
                          <Link href={`/projects/${project.id}`}>Open +</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Production Entity</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Lifecycle Phase</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Personnel</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Budget (INR)</TableHead>
                    <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionProjects.map((p) => (
                    <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="px-10 py-8">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-xl text-slate-900 tracking-tight leading-tight">{p.name}</h4>
                            <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                            {clientMap.get(p.clientId)} • <span className="text-primary/60">#{p.id.substring(0, 8).toUpperCase()}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="rounded-full px-5 py-1.5 text-[9px] font-bold uppercase border-none tracking-widest bg-slate-100 text-slate-500">
                          {p.status || "DISCUSSION"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center -space-x-2">
                          {p.crew?.slice(0, 3).map((m: any, idx: number) => (
                            <Avatar key={idx} className="h-8 w-8 border-2 border-white rounded-lg shadow-sm">
                              <AvatarImage src={m.thumbnail} />
                              <AvatarFallback className="text-[8px] font-bold">{m.name?.[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-bold text-slate-900 tracking-tight">₹{(p.budget || 0).toLocaleString('en-IN')}</span>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Button asChild variant="ghost" size="sm" className="h-11 rounded-full px-8 font-bold text-[10px] uppercase gap-2 hover:bg-primary hover:text-white transition-all shadow-none border-none">
                          <Link href={`/projects/${p.id}`}>Open Workspace</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="col-span-full border-2 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center p-40 min-h-[500px] bg-white/30 text-center space-y-8">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
              <Briefcase className="h-12 w-12 text-slate-200" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold font-headline text-slate-400 uppercase tracking-widest">No Production Entities Found</p>
              <p className="text-sm text-slate-300 italic tracking-normal max-w-sm mx-auto">Your pipeline is currently empty. Initiate a new high-growth production to begin tracking assets.</p>
              <Button asChild className="mt-10 rounded-full px-14 h-16 font-bold tracking-widest bg-primary text-white shadow-2xl shadow-primary/20 transition-all active:scale-95 uppercase text-xs">
                <Link href="/projects/new">Initiate First Project</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
