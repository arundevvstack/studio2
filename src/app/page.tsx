"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Clock, 
  ChevronRight,
  Briefcase,
  Loader2,
  TrendingUp,
  Activity,
  Zap,
  LayoutGrid,
  Users,
  Database,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState("production");
  const [forecastView, setForecastView] = useState("monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user record status for access guard
  const memberRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member, isLoading: memberLoading } = useDoc(memberRef);

  // Strategic Access Guard
  useEffect(() => {
    if (!isUserLoading && mounted) {
      if (!user) {
        router.push("/login");
      } else if (!user.isAnonymous && member && member.status === "Suspended") {
        router.push("/login");
      }
    }
  }, [user, isUserLoading, member, router, mounted]);

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
    return query(collection(db, "teamMembers"));
  }, [db, user]);
  const { data: teamMembers } = useCollection(teamQuery);

  const stats = useMemo(() => {
    if (!allProjects) return { completed: 0, inProgress: 0, lead: 0, totalRevenue: 0, percent: 0 };
    const completed = allProjects.filter(p => p.status === "Released").length;
    const inProgress = allProjects.filter(p => p.status === "In Progress" || p.status === "Post Production" || p.status === "Production").length;
    const totalRevenue = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const total = allProjects.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, lead: total - completed - inProgress, totalRevenue, percent };
  }, [allProjects]);

  const projectionData = useMemo(() => {
    if (!mounted) return [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map(m => ({
      name: m,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      leads: Math.floor(Math.random() * 5) + 2
    }));
  }, [mounted]);

  if (!mounted || isUserLoading || memberLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Synchronizing Executive Hub...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {[
          { title: "Portfolio Value", value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: "bg-primary/5 text-primary", sub: "Global assets" },
          { title: "Production Load", value: `${stats.inProgress} Entities`, icon: Activity, color: "bg-accent/5 text-accent", sub: "Active lifecycle" },
          { title: "Internal Team", value: `${teamMembers?.length || 0} Experts`, icon: Users, color: "bg-blue-50 text-blue-500", sub: "Staff resources" }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 group hover:-translate-y-1 transition-all bg-white">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-100">Live</Badge>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.title}</p>
            <h3 className="text-2xl sm:text-3xl font-bold font-headline mt-2 tracking-tight">{item.value}</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-3 opacity-60 text-slate-400">{item.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-slate-900">Workspace</h1>
                  <Badge className="bg-green-50 text-green-600 border-none text-[8px] font-bold uppercase tracking-widest px-3">System Optimized</Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic Throughput Monitor</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-10">
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Release Velocity</span>
                <div className="flex items-center gap-3 sm:gap-4 mt-2">
                  <Progress value={stats.percent} className="h-1.5 w-20 sm:w-24 bg-slate-100" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{stats.percent}%</span>
                </div>
              </div>
              <Button asChild size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all active:scale-95">
                <Link href="/projects/new"><Plus className="h-5 w-5 sm:h-6 sm:w-6" /></Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredProjects?.map((project, idx) => (
              <Card key={project.id} className={`border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden group cursor-pointer h-48 sm:h-56 flex flex-col ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-900 text-white'}`}>
                <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-2xl ${idx % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white'} backdrop-blur-md`}>
                      <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <Button asChild variant="ghost" size="icon" className={`rounded-full h-7 w-7 sm:h-8 sm:w-8 ${idx % 2 === 0 ? 'text-slate-300 hover:bg-slate-50' : 'text-white/30 hover:bg-white/10'}`}>
                      <Link href={`/projects/${project.id}`}><ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" /></Link>
                    </Button>
                  </div>
                  <div>
                    <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${idx % 2 === 0 ? 'text-slate-400' : 'text-white/40'}`}>Production Entity</p>
                    <h3 className="text-sm sm:text-base font-bold font-headline leading-tight tracking-tight line-clamp-2">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-2 sm:mt-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${idx % 2 === 0 ? 'text-slate-500' : 'text-white/60'}`}>{project.status}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white p-6 sm:p-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Hub</p>
                <h3 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 tracking-tight mt-1">Revenue Projections</h3>
              </div>
              <Tabs value={forecastView} onValueChange={setForecastView} className="bg-slate-50 p-1.5 rounded-full w-full sm:w-auto">
                <TabsList className="bg-transparent h-9 sm:h-10 gap-1 p-0 flex">
                  {['weekly', 'monthly'].map(v => (
                    <TabsTrigger key={v} value={v} className="flex-1 text-[9px] sm:text-[10px] font-bold uppercase px-4 sm:px-6 rounded-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all tracking-widest">{v}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="h-[250px] sm:h-[350px] w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" x1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={10} stroke="#94a3b8" />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1rem' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6 sm:space-y-10">
          <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 sm:space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">Efficiency Index</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-2 tracking-widest"><Clock className="h-3 w-3" /> System Uptime: 100%</p>
              </div>
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 fill-green-50" />
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-10">
              {[
                { label: "Released", val: stats.completed, color: "text-slate-900" },
                { label: "Production", val: stats.inProgress, color: "text-primary" },
                { label: "Leads", val: stats.lead, color: "text-blue-500" },
                { label: "Active Team", val: teamMembers?.length || 0, color: "text-accent" }
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-3xl sm:text-4xl font-bold font-headline mt-1 sm:mt-2 tracking-tight ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 sm:pt-8 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Brief</p>
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.2rem] bg-slate-50 border border-slate-100">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent mt-1 shrink-0" />
                <p className="text-[11px] sm:text-xs font-bold text-slate-600 tracking-normal leading-relaxed italic">
                  "Production throughput is currently optimized. High velocity detected in Pre-Production phase."
                </p>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] sm:rounded-[3.5rem] bg-slate-900 text-white p-8 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24" />
            <div className="space-y-3 relative z-10">
              <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-widest">Intelligence Live</Badge>
              <h4 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Market Strategy Hub</h4>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-400">Deploy hyper-local AI research to identify high-value production leads in Kerala districts.</p>
            </div>
            <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-6 sm:py-7 font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 relative z-10">
              <Link href="/market-research">Analyze Markets Hub</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
