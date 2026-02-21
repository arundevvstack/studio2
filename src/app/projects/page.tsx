
"use client";

import { useMemo } from "react";
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
  Pencil,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function ProjectsPage() {
  const db = useFirestore();
  const { user } = useUser();

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

  const clientGroups = useMemo(() => {
    if (!clients || !projects) return [];

    return clients.map(client => {
      const clientProjects = projects.filter(p => p.clientId === client.id);
      return {
        ...client,
        projects: clientProjects,
        activeCount: clientProjects.length
      };
    }).filter(group => group.projects.length > 0);
  }, [clients, projects]);

  const isLoading = isLoadingClients || isLoadingProjects;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'lead':
      case 'discussion':
        return 'bg-blue-50 text-blue-500';
      case 'pre production':
        return 'bg-slate-100 text-slate-500';
      case 'in progress':
        return 'bg-primary/10 text-primary';
      case 'released':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-normal">Projects</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium tracking-normal">
            Managing global production assets grouped by client.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md"><List className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400"><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <Button asChild className="gap-2 px-6 shadow-lg shadow-primary/20 font-bold rounded-xl tracking-normal">
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
          <Input className="pl-11 h-14 bg-white border-none shadow-sm rounded-xl text-base tracking-normal" placeholder="Search projects or clients..." />
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="h-10 rounded-lg border-slate-200 text-xs font-bold gap-2 text-slate-600 bg-white tracking-normal">
            <ArrowUpDown className="h-3.5 w-3.5" />
            CLIENT A-Z
          </Button>
          <Button variant="outline" className="h-10 rounded-lg border-slate-200 text-xs font-bold gap-2 text-slate-600 bg-white tracking-normal">
            <Filter className="h-3.5 w-3.5" />
            Refine
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-sm uppercase tracking-normal">Loading Pipeline...</p>
          </div>
        ) : clientGroups.length > 0 ? (
          clientGroups.map((group) => (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-primary/40" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">{group.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                    {group.activeCount} ACTIVE PROJECTS
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 px-8 py-4 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                  <div className="col-span-4">PRODUCTION ENTITY</div>
                  <div className="col-span-3 text-center">CURRENT PHASE</div>
                  <div className="col-span-2">BUDGET (INR)</div>
                  <div className="col-span-2 text-center">DELIVERY</div>
                  <div className="col-span-1 text-right">ACTIONS</div>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {group.projects.map((project: any) => (
                    <div key={project.id} className="grid grid-cols-12 px-8 py-6 items-center group hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-4">
                        <h4 className="font-bold text-base text-slate-900 tracking-normal">{project.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-normal">ID: {project.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <Badge className={`rounded-lg px-4 py-1.5 text-[10px] font-bold border-none shadow-none tracking-normal ${getStatusBadge(project.status)}`}>
                          {project.status || "LEAD"}
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 group-hover:border-primary/20 group-hover:text-primary transition-all shadow-sm tracking-normal">
                                <Link href={`/projects/${project.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-[10px] font-bold uppercase tracking-normal">Edit Project</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-20 min-h-[400px] bg-white/30">
            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 p-5">
              <Search className="h-full w-full text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No Active Projects</p>
            <Button asChild variant="link" className="text-primary font-bold text-xs mt-2 tracking-normal">
              <Link href="/projects/new">Initiate new production</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
