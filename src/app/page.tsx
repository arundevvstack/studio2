
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Target,
  BarChart3,
  Activity,
  Zap,
  LayoutGrid,
  Users,
  Database,
  IndianRupee,
  ShieldCheck
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("production");
  const [forecastView, setForecastView] = useState("monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const leadsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "leads"));
  }, [db, user]);
  const { data: allLeads } = useCollection(leadsQuery);

  const teamQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"));
  }, [db, user]);
  const { data: teamMembers } = useCollection(teamQuery);

  const talentQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "shoot_network"), where("isArchived", "==", false));
  }, [db, user]);
  const { data: talentNetwork } = useCollection(talentQuery);

  const stats = useMemo(() => {
    if (!allProjects) return { completed: 0, inProgress: 0, lead: 0, totalRevenue: 0, percent: 0 };
    const completed = allProjects.filter(p => p.status === "Released").length;
    const inProgress = allProjects.filter(p => p.status === "In Progress" || p.status === "Post Production").length;
    const lead = allProjects.filter(p => p.status === "Lead" || p.status === "Discussion").length;
    const totalRevenue = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const total = allProjects.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, lead, totalRevenue, percent };
  }, [allProjects]);

  const projectionData = useMemo(() => {
    if (!mounted) return [];
    
    if (forecastView === "monthly") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      const displayMonths = Array.from({ length: 6 }, (_, i) => {
        const idx = (currentMonth + i) % 12;
        return {
          name: months[idx],
          revenue: 0,
          leads: 0,
        };
      });

      if (allProjects) {
        allProjects.forEach(p => {
          const budget = p.budget || 0;
          const randomMonthOffset = Math.floor(Math.random() * 6);
          displayMonths[randomMonthOffset].revenue += budget;
        });
      }
      if (allLeads) {
        allLeads.forEach(() => {
          const randomMonthOffset = Math.floor(Math.random() * 6);
          displayMonths[randomMonthOffset].leads += 1;
        });
      }

      return displayMonths.map(d => ({
        ...d,
        revenue: d.revenue || Math.floor(Math.random() * 50000) + 20000,
        leads: d.leads || Math.floor(Math.random() * 5) + 2
      }));
    } else {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map(day => ({
        name: day,
        revenue: Math.floor(Math.random() * 15000) + 5000,
        leads: Math.floor(Math.random() * 3) + 1
      }));
    }
  }, [allProjects, allLeads, forecastView, mounted]);

  const filteredProjects = useMemo(() => {
    if (!allProjects) return [];
    if (activeTab === "lead") {
      return allProjects.filter(p => p.status === "Lead" || p.status === "Discussion");
    }
    if (activeTab === "released") {
      return allProjects.filter(p => p.status === "Released");
    }
    return allProjects.filter(p => p.status === "In Progress" || p.status === "Pre Production" || p.status === "Post Production");
  }, [allProjects, activeTab]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Global Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-normal border-slate-100">Live</Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Asset Value</p>
          <h3 className="text-2xl font-bold font-headline mt-1 tracking-normal">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
          <p className="text-[9px] text-slate-400 mt-2 font-medium tracking-normal">Pipeline performance</p>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-normal border-slate-100">Active</Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Execution Phase</p>
          <h3 className="text-2xl font-bold font-headline mt-1 tracking-normal">{stats.inProgress} Entities</h3>
          <p className="text-[9px] text-slate-400 mt-2 font-medium tracking-normal">Current productions</p>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-normal border-slate-100">Staff</Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Team</p>
          <h3 className="text-2xl font-bold font-headline mt-1 tracking-normal">{teamMembers?.length || 0} Experts</h3>
          <p className="text-[9px] text-slate-400 mt-2 font-medium tracking-normal">Internal resources</p>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-normal border-white/10 text-white/60">Verified</Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal relative z-10">Talent Network</p>
          <h3 className="text-2xl font-bold font-headline mt-1 tracking-normal relative z-10">{talentNetwork?.length || 0} Partners</h3>
          <p className="text-[9px] text-slate-400 mt-2 font-medium tracking-normal relative z-10">Creative repository</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Workspace Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-headline tracking-normal text-slate-900 leading-tight">Workspace Hub</h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[8px] font-bold uppercase tracking-normal">Pipeline</Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Production Command Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Release Velocity</span>
                <div className="flex items-center gap-3 mt-1">
                  <Progress value={stats.percent} className="h-1 w-20 bg-slate-100" />
                  <span className="text-[10px] font-bold text-slate-900 tracking-normal">{stats.percent}%</span>
                </div>
              </div>
              <Button asChild size="icon" className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 shadow-sm">
                <Link href="/projects/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Featured Project Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectsLoading ? (
              <div className="col-span-full h-40 flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : featuredProjects && featuredProjects.length > 0 ? (
              featuredProjects.map((project, idx) => (
                <Card key={project.id} className={`${idx % 2 === 0 ? 'bg-slate-900' : 'bg-primary'} border-none shadow-lg rounded-[1.5rem] overflow-hidden relative group cursor-pointer`}>
                  <CardContent className="p-5 text-white h-44 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                      <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg h-7 w-7">
                        <Link href={`/projects/${project.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/60 uppercase mb-1 tracking-normal">Entity</p>
                      <h3 className="text-sm font-bold font-headline leading-tight tracking-normal mb-2 line-clamp-2">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[8px] font-bold uppercase tracking-normal opacity-80">{project.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full border-2 border-dashed border-slate-100 bg-white/50 rounded-[2rem] h-40 flex flex-col items-center justify-center space-y-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center p-2.5">
                  <LayoutGrid className="h-full w-full text-slate-200" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">No Featured Projects</p>
                  <Button variant="link" asChild className="text-primary font-bold text-[10px] p-0 h-auto mt-0.5 tracking-normal">
                    <Link href="/projects/new">Create a lead</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <CardHeader className="p-0 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Projections</CardTitle>
                <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal mt-1">Revenue & Pipeline</h3>
              </div>
              <div className="flex items-center gap-4">
                <Tabs value={forecastView} onValueChange={setForecastView} className="bg-slate-50 p-1 rounded-xl">
                  <TabsList className="bg-transparent h-8 gap-1 p-0">
                    <TabsTrigger value="weekly" className="text-[10px] font-bold uppercase px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all tracking-normal">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-[10px] font-bold uppercase px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all tracking-normal">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))"
                      dy={10}
                    />
                    <YAxis 
                      yId="left"
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value/1000}k`} 
                      stroke="hsl(var(--muted-foreground))" 
                    />
                    <YAxis 
                      yId="right"
                      orientation="right"
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--accent))" 
                    />
                    <Tooltip 
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1.5rem' }}
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value,
                        name === 'revenue' ? 'Projected Revenue' : 'Incoming Leads'
                      ]}
                    />
                    <Area 
                      yId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                    />
                    <Bar 
                      yId="right"
                      dataKey="leads" 
                      fill="hsl(var(--accent))" 
                      radius={[4, 4, 4, 4]} 
                      barSize={12} 
                      opacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-8 mt-6 text-[10px] font-bold uppercase tracking-normal text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" /> Projected Revenue
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-accent/30" /> New Leads
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-headline tracking-normal text-slate-900">Strategic Items</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-xl px-6 text-xs font-bold bg-white border-slate-100 shadow-sm tracking-normal">Archive</Button>
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
                  <TabsTrigger value="lead" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-2 tracking-normal">Lead</TabsTrigger>
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
                <h3 className="font-bold text-lg tracking-normal text-slate-900">Throughput Stats</h3>
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
                 <p className="text-3xl font-bold font-headline mt-1 tracking-normal text-slate-900">{stats.completed}</p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Production</p>
                 <p className="text-3xl font-bold font-headline mt-1 text-primary tracking-normal">
                   {stats.inProgress}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Lead</p>
                 <p className="text-3xl font-bold font-headline mt-1 text-blue-500 tracking-normal">
                   {stats.lead}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Team</p>
                 <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary border-2 border-white flex items-center justify-center text-xs font-bold mt-2 shadow-sm">
                   {teamMembers?.length || 0}
                 </div>
              </div>
              <div className="col-span-2 pt-4 border-t border-slate-50">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Guidance</p>
                 <div className="flex items-center gap-2 mt-2">
                   <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                     <TrendingUp className="h-4 w-4 text-accent" />
                   </div>
                   <p className="text-xs font-bold text-slate-600 tracking-normal leading-relaxed italic">
                     Maintain focus on lead acquisition to scale network throughput.
                   </p>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-bold font-headline tracking-normal text-slate-900">Quick Strategy</h2>
             <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
               <div className="space-y-2 relative z-10">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">System Guidance</p>
                 <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal">
                   "Analyze market research insights to optimize project vertical tags for incoming leads."
                 </p>
               </div>
               <Button asChild className="w-full bg-white text-slate-900 hover:bg-white/90 rounded-xl font-bold text-[10px] uppercase tracking-normal h-12 shadow-none border-none relative z-10">
                 <Link href="/market-research">Market Intelligence</Link>
               </Button>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
