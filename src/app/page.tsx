
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
  CheckCircle2,
  ShieldCheck
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

/**
 * @fileOverview Master Dashboard Node.
 * Features dynamic role-based module filtering and identity governance guards.
 */

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [forecastView, setForecastView] = useState("monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user record status
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member, isLoading: memberLoading } = useDoc(memberRef);

  // Fetch Role for strategic filtering
  const roleRef = useMemoFirebase(() => {
    if (!member?.roleId) return null;
    return doc(db, "roles", member.roleId);
  }, [db, member?.roleId]);
  const { data: role } = useDoc(roleRef);

  // Strategic Access Guard
  useEffect(() => {
    if (!isUserLoading && mounted) {
      if (!user) {
        router.push("/login");
      } else if (member && member.status !== "Active") {
        router.push("/login");
      }
    }
  }, [user, isUserLoading, router, mounted, member]);

  // Visibility Logic
  const isAdmin = role?.name === "Administrator" || role?.name === "root Administrator" || role?.name === "Root Administrator" || member?.roleId === 'root-admin' || user?.isAnonymous;
  const canSee = (item: string) => {
    if (isAdmin) return true;
    return role?.permissions?.includes(`dash:${item}`) || false;
  };

  const allProjectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("updatedAt", "desc"));
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
    const inProgress = allProjects.filter(p => ["In Progress", "Post Production", "Production"].includes(p.status || "")).length;
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
    }));
  }, [mounted]);

  if (!mounted || isUserLoading || (user && !member)) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Synchronizing Executive Hub...</p>
      </div>
    );
  }

  if (!user || member?.status !== "Active") return null;

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-20">
      {canSee('stats') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {[
            { title: "Portfolio Value", value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: "bg-primary/5 text-primary" },
            { title: "Production Load", value: `${stats.inProgress} Entities`, icon: Activity, color: "bg-accent/5 text-accent" },
            { title: "Internal Team", value: `${teamMembers?.length || 0} Experts`, icon: Users, color: "bg-blue-50 text-blue-500" }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-6 sm:p-10 group hover:-translate-y-1 transition-all bg-white">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-100">Live</Badge>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.title}</p>
              <h3 className="text-2xl sm:text-3xl font-bold font-headline mt-2 tracking-tight">{item.value}</h3>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
          {canSee('workspace') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-slate-900">Operational Hub</h1>
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
                <Button asChild size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95">
                  <Link href="/projects/new"><Plus className="h-5 w-5 sm:h-6 sm:w-6" /></Link>
                </Button>
              </div>
            </div>
          )}

          {canSee('projects') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {allProjects?.slice(0, 4).map((project, idx) => (
                <Card key={project.id} className={`border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group cursor-pointer h-48 sm:h-56 flex flex-col ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-900 text-white'}`}>
                  <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-2xl ${idx % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white'} backdrop-blur-md`}>
                        <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <Button asChild variant="ghost" size="icon" className={`rounded-full h-7 w-7 ${idx % 2 === 0 ? 'text-slate-300' : 'text-white/30'}`}>
                        <Link href={`/projects/${project.id}`}><ChevronRight className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                    <div>
                      <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${idx % 2 === 0 ? 'text-slate-400' : 'text-white/40'}`}>Production Entity</p>
                      <h3 className="text-sm sm:text-base font-bold font-headline leading-tight tracking-tight line-clamp-2">{project.name}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {canSee('intelligence') && (
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-6 sm:p-12">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Hub</p>
                  <h3 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 tracking-tight mt-1">Revenue Projections</h3>
                </div>
                <Tabs value={forecastView} onValueChange={setForecastView} className="bg-slate-50 p-1.5 rounded-full">
                  <TabsList className="bg-transparent h-9 gap-1 p-0">
                    <TabsTrigger value="weekly" className="text-[9px] font-bold uppercase px-4 rounded-full">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-[9px] font-bold uppercase px-4 rounded-full">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="h-[250px] sm:h-[350px] w-full">
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
                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6 sm:space-y-10">
          {canSee('efficiency') && (
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 sm:space-y-10">
              <h3 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">Efficiency Index</h3>
              <div className="grid grid-cols-2 gap-6 sm:gap-10">
                {[
                  { label: "Released", val: stats.completed, color: "text-slate-900" },
                  { label: "Production", val: stats.inProgress, color: "text-primary" },
                  { label: "Leads", val: stats.lead, color: "text-blue-500" },
                  { label: "Team", val: teamMembers?.length || 0, color: "text-accent" }
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className={`text-3xl sm:text-4xl font-bold font-headline mt-1 tracking-tight ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canSee('market') && (
            <Card className="border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24" />
              <div className="space-y-3 relative z-10">
                <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-widest">Live Intel</Badge>
                <h4 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Market Strategy Hub</h4>
                <p className="text-xs sm:text-sm text-slate-400">Deploy AI research to identify production leads in Kerala districts.</p>
              </div>
              <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-6 font-bold text-[10px] uppercase tracking-widest relative z-10">
                <Link href="/market-research">Analyze Markets</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
