"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles,
  ArrowRight,
  Loader2,
  Clock,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";

export default function PipelinePage() {
  const db = useFirestore();
  const { user } = useUser();

  const pipelineQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "projects"),
      where("status", "==", "Pitch"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: projects, isLoading: isProjectsLoading } = useCollection(pipelineQuery);

  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "clients"));
  }, [db, user]);

  const { data: clients } = useCollection(clientsQuery);

  const clientMap = useMemo(() => {
    const map = new Map();
    clients?.forEach(c => map.set(c.id, c.name));
    return map;
  }, [clients]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">
              Strategic Pipeline
            </h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5 uppercase tracking-normal">
              <Sparkles className="h-3 w-3 mr-1" />
              Early Stage
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Managing high-potential opportunities currently in the Pitch phase.
          </p>
        </div>
        <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Pitch
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400" 
            placeholder="Search pending pitches..." 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="grid grid-cols-12 px-10 py-6 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
          <div className="col-span-4">Potential Production</div>
          <div className="col-span-3">Client Partnership</div>
          <div className="col-span-2 text-center">Budget (INR)</div>
          <div className="col-span-2 text-center">Initiated</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        
        <div className="flex-1">
          {isProjectsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {projects.map((project) => (
                <div key={project.id} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-slate-50/50 transition-colors group">
                  <div className="col-span-4">
                    <h4 className="font-bold text-lg text-slate-900 tracking-normal">{project.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-2 tracking-normal">
                      <Briefcase className="h-3 w-3" />
                      ID: {project.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm font-bold text-primary tracking-normal">
                      {clientMap.get(project.clientId) || "Unknown Client"}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-base font-bold text-slate-900 tracking-normal">
                      ₹{(project.budget || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-normal">
                      {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all">
                      <Link href={`/projects/${project.id}`}>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="bg-slate-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 p-5 shadow-inner">
                  <Search className="h-full w-full text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium italic text-sm tracking-normal">
                  No projects currently in the Pitch pipeline.
                </p>
                <Button asChild variant="link" className="text-primary font-bold text-xs tracking-normal">
                  <Link href="/projects/new">Initiate a new production pitch</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}