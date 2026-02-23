"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid,
  List,
  ArrowUpDown,
  User,
  Clock,
  Loader2,
  Columns,
  ChevronRight,
  Briefcase,
  TrendingUp,
  X,
  Target,
  GitBranch
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

type ViewMode = "list" | "grid" | "split";

export default function ProjectsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);
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

  // Strategic Differentiator: Use sentinel ID "PIPELINE" to identify mirrored leads
  const productionProjects = useMemo(() => 
    filteredProjects.filter(p => p.clientId !== "PIPELINE"), 
  [filteredProjects]);

  const pipelineProjects = useMemo(() => 
    filteredProjects.filter(p => p.clientId === "PIPELINE"), 
  [filteredProjects]);

  const clientGroups = useMemo(() => {
    if (!clients || !productionProjects) return [];

    return clients.map(client => {
      const clientProjects = productionProjects.filter(p => p.clientId === client.id);
      return {
        ...client,
        projects: clientProjects,
        activeCount: clientProjects.length
      };
    }).filter(group => group.projects.length > 0);
  }, [clients, productionProjects]);

  const isLoading = isLoadingClients || isLoadingProjects;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'lead':
      case 'discussion':
        return 'bg-blue-50 text-blue-500';
      case 'pre production':
        return 'bg-slate-100 text-slate-500';
      case 'production':
        return 'bg-primary/10 text-primary';
      case 'post production':
        return 'bg-orange-50 text-orange-600';
      case 'released':
      case 'release':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const selectedProject = useMemo(() => {
    return projects?.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline tracking-normal text-slate-900 leading-none">Projects</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal mt-2">
            Managing global production assets and strategic deliverables.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm shrink-0">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={`h-10 w-10 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={`h-10 w-10 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'split' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('split')}
              className={`h-10 w-10 rounded-xl transition-all ${viewMode === 'split' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
          <Button asChild className="gap-2 h-12 px-8 shadow-lg shadow-primary/20 font-bold rounded-xl tracking-normal bg-primary hover:bg-primary/90 text-white border-none">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-base tracking-normal placeholder:text-slate-400" 
            placeholder="Filter projects by entity name or client..." 
          />
        </div>
      </div>

      {pipelineProjects.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-[1rem] bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <GitBranch className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">Pipeline Intelligence</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Entities currently in lead phase</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pipelineProjects.map((p) => (
              <Card key={p.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-md transition-all border border-slate-50">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase tracking-normal px-2 py-0.5 rounded-lg">
                      Pipeline Sync
                    </Badge>
                    <Target className="h-4 w-4 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal mb-1">{p.clientName || clientMap.get(p.clientId)}</p>
                    <h4 className="text-lg font-bold text-slate-900 tracking-normal leading-tight line-clamp-2">{p.name}</h4>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900 tracking-normal">₹{(p.budget || 0).toLocaleString('en-IN')}</div>
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-normal gap-2 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <Link href={`/pipeline/leads/${p.id}`}>
                        Lead Intelligence <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-normal">Synchronizing Global Workspace...</p>
          </div>
        ) : productionProjects.length > 0 ? (
          viewMode === 'list' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {clientGroups.map((group) => (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-[1rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <User className="h-5 w-5 text-primary/40" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">{group.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                        {group.activeCount} ACTIVE PROJECTS
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 px-10 py-5 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-normal bg-slate-50/30">
                      <div className="col-span-4">PRODUCTION ENTITY</div>
                      <div className="col-span-3 text-center">LIFECYCLE PHASE</div>
                      <div className="col-span-2">BUDGET (INR)</div>
                      <div className="col-span-2 text-center">DELIVERY</div>
                      <div className="col-span-1 text-right">ACTIONS</div>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                      {group.projects.map((project: any) => (
                        <div key={project.id} className="grid grid-cols-12 px-10 py-8 items-center group hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-4">
                            <h4 className="font-bold text-lg text-slate-900 tracking-normal leading-tight">{project.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-normal flex items-center gap-2">
                              <span className="text-primary/60">#{project.id.substring(0, 8).toUpperCase()}</span>
                              {project.tags?.slice(0, 1).map((tag: string) => (
                                <span key={tag} className="text-slate-300">• {tag}</span>
                              ))}
                            </p>
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <Badge className={`rounded-xl px-4 py-1.5 text-[10px] font-bold border-none shadow-none tracking-normal ${getStatusBadge(project.status)}`}>
                              {project.status || "DISCUSSION"}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm font-bold text-slate-900 tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="col-span-2 flex items-center justify-center gap-2 text-slate-400">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-bold text-slate-600 tracking-normal">TBD</span>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                              <Link href={`/projects/${project.id}`}>
                                <ChevronRight className="h-5 w-5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {productionProjects.map((project) => (
                <Card key={project.id} className="border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all rounded-[2.5rem] bg-white overflow-hidden group">
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-transparent z-10" />
                      <img 
                        src={`https://picsum.photos/seed/${project.id}/600/450`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="Project Visual" 
                      />
                      <div className="absolute top-6 left-6 z-20">
                        <Badge className={`rounded-xl px-4 py-1.5 text-[10px] font-bold border-none shadow-lg tracking-normal ${getStatusBadge(project.status)}`}>
                          {project.status || "DISCUSSION"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 left-8 right-8 z-20">
                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">{clientMap.get(project.clientId)}</p>
                        <h3 className="text-2xl font-bold font-headline text-white tracking-normal leading-tight line-clamp-2">{project.name}</h3>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Asset Value</p>
                        <p className="text-xl font-bold text-slate-900 tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {project.crew?.slice(0, 3).map((member: any, i: number) => (
                          <Avatar key={i} className="h-10 w-10 border-4 border-white shadow-sm rounded-xl">
                            <AvatarImage src={member.thumbnail} />
                            <AvatarFallback className="text-[10px] font-bold">{member.name?.[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                        {(project.crew?.length || 0) > 3 && (
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                            +{project.crew.length - 3}
                          </div>
                        )}
                      </div>
                      <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                        <Link href={`/projects/${project.id}`}>
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-[750px] gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-normal">Master Registry</h3>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                      {productionProjects.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedProjectId(p.id)}
                          className={`p-6 rounded-3xl cursor-pointer transition-all border ${
                            selectedProjectId === p.id 
                              ? 'bg-primary border-primary shadow-xl shadow-primary/20 translate-x-2' 
                              : 'bg-white border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${selectedProjectId === p.id ? 'text-white/60' : 'text-primary'}`}>
                            {clientMap.get(p.clientId)}
                          </p>
                          <h4 className={`text-sm font-bold tracking-normal leading-tight ${selectedProjectId === p.id ? 'text-white' : 'text-slate-900'}`}>
                            {p.name}
                          </h4>
                          <div className="flex items-center justify-between mt-4">
                            <Badge className={`text-[8px] font-bold uppercase rounded-lg border-none ${
                              selectedProjectId === p.id ? 'bg-white/20 text-white' : getStatusBadge(p.status)
                            }`}>
                              {p.status || "DISCUSSION"}
                            </Badge>
                            <span className={`text-[10px] font-bold ${selectedProjectId === p.id ? 'text-white/80' : 'text-slate-400'}`}>
                              ₹{(p.budget || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="flex-1">
                {selectedProject ? (
                  <Card className="h-full border-none shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="h-64 relative shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/${selectedProject.id}/1200/400`} 
                        className="w-full h-full object-cover" 
                        alt="Project Hero" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Button 
                        onClick={() => setSelectedProjectId(null)}
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-6 right-6 h-10 w-10 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <div className="absolute bottom-8 left-10 right-10">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-white border-none text-[10px] font-bold uppercase tracking-normal rounded-xl px-4 py-1">
                            {selectedProject.status}
                          </Badge>
                          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">#{selectedProject.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <h2 className="text-4xl font-bold font-headline text-white tracking-normal leading-tight">{selectedProject.name}</h2>
                      </div>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-12 space-y-12">
                        <div className="grid grid-cols-3 gap-8">
                          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Financial Load</p>
                            <p className="text-2xl font-bold font-headline text-slate-900 tracking-normal">₹{(selectedProject.budget || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Crew</p>
                            <p className="text-2xl font-bold font-headline text-slate-900 tracking-normal">{selectedProject.crew?.length || 0} Experts</p>
                          </div>
                          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Hub Hub</p>
                            <p className="text-2xl font-bold font-headline text-slate-900 tracking-normal flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-primary" />
                              {selectedProject.location || "Kerala"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold font-headline tracking-normal flex items-center gap-3">
                              <Activity className="h-5 w-5 text-primary" />
                              Deployment Velocity
                            </h3>
                            <span className="text-sm font-bold text-primary">{selectedProject.progress || 0}% Complete</span>
                          </div>
                          <Progress value={selectedProject.progress || 0} className="h-2 bg-slate-100" />
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xl font-bold font-headline tracking-normal flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-accent" />
                            Production Context
                          </h3>
                          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                            <p className="text-sm font-medium leading-relaxed text-slate-600 italic tracking-normal">
                              {selectedProject.description || "No strategic brief recorded for this entity."}
                            </p>
                          </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Partner</p>
                            <h4 className="text-lg font-bold text-slate-900 tracking-normal">{clientMap.get(selectedProject.clientId) || selectedProject.clientName}</h4>
                          </div>
                          <Button asChild className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-3 group tracking-normal">
                            <Link href={`/projects/${selectedProject.id}`}>
                              Open Workspace
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </Card>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 space-y-6 text-center p-12">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center">
                      <Columns className="h-12 w-12 text-primary" />
                    </div>
                    <div className="max-w-xs space-y-2">
                      <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Identify Intelligence</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed tracking-normal">
                        Select a production entity from the master registry to visualize its strategic brief and live performance metrics.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="col-span-full border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-32 min-h-[500px] bg-white/30 text-center space-y-6">
            <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
              <Briefcase className="h-10 w-10 text-slate-200" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-400 uppercase tracking-normal">No Production Entities Found</p>
              <p className="text-xs text-slate-300 italic tracking-normal max-w-sm mx-auto">Your pipeline is currently empty. Initiate a new project to start tracking your production throughput.</p>
              <Button asChild className="mt-6 rounded-xl px-10 h-12 font-bold tracking-normal">
                <Link href="/projects/new">Initiate First Project</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
