"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Grid,
  ChevronRight,
  Search,
  Briefcase,
  Loader2,
  TrendingUp,
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function Dashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("production");

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("updatedAt", "desc"), limit(4));
  }, [db, user]);
  const { data: featuredProjects, isLoading: projectsLoading } = useCollection(projectsQuery);

  const allProjectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"));
  }, [db, user]);
  const { data: allProjects } = useCollection(allProjectsQuery);

  const teamQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "team_members"));
  }, [db, user]);
  const { data: teamMembers } = useCollection(teamQuery);

  const stats = useMemo(() => {
    if (!allProjects) return { completed: 0, inProgress: 0, pitch: 0, totalRevenue: 0, percent: 0 };
    const completed = allProjects.filter(p => p.status === "Released").length;
    const inProgress = allProjects.filter(p => p.status === "In Progress" || p.status === "Post Production").length;
    const pitch = allProjects.filter(p => p.status === "Pitch" || p.status === "Discussion").length;
    const totalRevenue = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const total = allProjects.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, pitch, totalRevenue, percent };
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (!allProjects) return [];
    if (activeTab === "pitch") {
      return allProjects.filter(p => p.status === "Pitch" || p.status === "Discussion");
    }
    if (activeTab === "released") {
      return allProjects.filter(p => p.status === "Released");
    }
    return allProjects.filter(p => p.status === "In Progress" || p.status === "Pre Production" || p.status === "Post Production");
  }, [allProjects, activeTab]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-full animate-in fade-in duration-500">
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-normal text-slate-900">Welcome back!</h1>
            <p className="text-sm text-slate-500 font-medium tracking-normal">Production pipeline overview.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{stats.percent}% items released</span>
               <Progress value={stats.percent} className="h-2 w-32 bg-slate-100" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectsLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProjects && featuredProjects.length > 0 ? (
            featuredProjects.map((project, idx) => (
              <Card key={project.id} className={`${idx % 2 === 0 ? 'bg-slate-900' : 'bg-primary'} border-none shadow-xl rounded-3xl overflow-hidden relative group cursor-pointer`}>
                <CardContent className="p-8 text-white h-64 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl">
                      <Link href={`/projects/${project.id}`}>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase mb-1 tracking-normal">Active Entity</p>
                    <h3 className="text-xl font-bold font-headline leading-tight tracking-normal mb-4">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-normal">{project.status}</span>
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-20 group-hover:scale-110 transition-transform">
                     <div className="w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full border-2 border-dashed border-slate-100 bg-white/50 rounded-[2rem] h-64 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center p-3">
                <Grid className="h-full w-full text-slate-200" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-normal">No Featured Projects</p>
                <Button variant="link" asChild className="text-primary font-bold text-xs p-0 h-auto mt-1 tracking-normal">
                  <Link href="/projects/new">Create a new pitch</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline tracking-normal">Strategic Items</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl px-6 text-xs font-bold bg-white/50 border-slate-100 shadow-sm tracking-normal">Archive</Button>
              <Button className="rounded-xl px-6 text-xs font-bold shadow-lg shadow-primary/20 tracking-normal" asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-transparent gap-8 h-auto p-0">
                <TabsTrigger value="pitch" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-2 tracking-normal">Pitch</TabsTrigger>
                <TabsTrigger value="production" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-2 tracking-normal">Production</TabsTrigger>
                <TabsTrigger value="released" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-2 tracking-normal">Released</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
              <Search className="h-3 w-3" />
              <span>Filter Assets</span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-slate-900 tracking-normal leading-none">{project.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-normal">{project.status || "Planned"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Budget</p>
                      <p className="text-sm font-bold text-slate-900 tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Link href={`/projects/${project.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-normal">No items found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg tracking-normal">Throughput Stats</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1 tracking-normal">
                 <Clock className="h-3 w-3" />
                 Global Records
              </p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Released</p>
               <p className="text-3xl font-bold font-headline mt-1 tracking-normal">{stats.completed}</p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Production</p>
               <p className="text-3xl font-bold font-headline mt-1 text-primary tracking-normal">
                 {stats.inProgress}
               </p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Pitch</p>
               <p className="text-3xl font-bold font-headline mt-1 text-blue-500 tracking-normal">
                 {stats.pitch}
               </p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Team</p>
               <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary border-2 border-white flex items-center justify-center text-xs font-bold mt-2 shadow-sm">
                 {teamMembers?.length || 0}
               </div>
            </div>
            <div className="col-span-2 pt-4 border-t border-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Revenue</p>
               <div className="flex items-center gap-2 mt-2">
                 <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                   <TrendingUp className="h-4 w-4 text-accent" />
                 </div>
                 <p className="text-2xl font-bold font-headline text-slate-900 tracking-normal">
                   ₹{(stats.totalRevenue / 100000).toFixed(1)}L
                 </p>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-bold font-headline tracking-normal">Quick Strategy</h2>
           <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
             <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">System Guidance</p>
               <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal">
                 "Maintain strategic focus on {allProjects?.[0]?.status === 'In Progress' ? 'delivery' : 'client acquisition'} to optimize growth."
               </p>
             </div>
             <Button asChild className="w-full bg-white text-slate-900 hover:bg-white/90 rounded-xl font-bold text-[10px] uppercase tracking-normal h-12 shadow-none border-none">
               <Link href="/projects/new">New Project</Link>
             </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
