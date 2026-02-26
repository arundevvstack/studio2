
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
  ShieldCheck,
  ArrowUpRight
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
 * @fileOverview Master Dashboard Node - Apple Inspired Redesign.
 * Features dynamic role-based module filtering and high-fidelity minimalist UI.
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
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4 bg-[#f5f5f7]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Executive Hub...</p>
      </div>
    );
  }

  if (!user || member?.status !== "Active") return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 max-w-[1400px] mx-auto">
      {/* Dynamic Grid Header */}
      {canSee('stats') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Portfolio Value", value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: "text-slate-900" },
            { title: "Production Load", value: `${stats.inProgress} Entities`, icon: Activity, color: "text-slate-900" },
            { title: "Internal Team", value: `${teamMembers?.length || 0} Experts`, icon: Users, color: "text-slate-900" }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-10 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all bg-white overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="h-5 w-5 text-slate-900" />
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{item.title}</p>
              <h3 className="text-4xl font-bold font-headline mt-2 tracking-tight text-slate-900">{item.value}</h3>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          {/* Hero Command Center */}
          {canSee('workspace') && (
            <div className="relative group overflow-hidden bg-white p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                  <div className="h-20 w-20 rounded-3xl bg-slate-950 flex items-center justify-center shadow-2xl shrink-0 group-hover:rotate-6 transition-transform duration-700">
                    <Zap className="h-10 w-10 text-white fill-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-950">Operational Hub</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Strategic Throughput Monitor</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-12">
                  <div className="flex flex-col items-start sm:items-end space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Release Velocity</span>
                    <div className="flex items-center gap-5">
                      <div className="h-1.5 w-32 bg-slate-50 rounded-full overflow-hidden">
                        <div className="bg-slate-950 h-full transition-all duration-1000 ease-out" style={{ width: `${stats.percent}%` }} />
                      </div>
                      <span className="text-lg font-bold text-slate-950 tabular-nums">{stats.percent}%</span>
                    </div>
                  </div>
                  <Button asChild size="icon" className="h-14 w-14 rounded-full bg-slate-950 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95">
                    <Link href="/projects/new"><Plus className="h-6 w-6" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Minimalist Project Grid */}
          {canSee('projects') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProjects?.slice(0, 4).map((project, idx) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                  <Card className={`border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 h-56 flex flex-col ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <div className="p-8 flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100">
                          <Briefcase className="h-4 w-4 text-slate-900" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-slate-400">Production Entity</p>
                        <h3 className="text-lg font-bold font-headline leading-tight tracking-tight text-slate-950 line-clamp-2">{project.name}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* High-Fidelity Chart */}
          {canSee('intelligence') && (
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[3rem] bg-white p-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Intelligence Hub</p>
                  <h3 className="text-3xl font-bold font-headline text-slate-950 tracking-tight">Revenue Projections</h3>
                </div>
                <Tabs value={forecastView} onValueChange={setForecastView} className="bg-slate-50 p-1.5 rounded-full border border-slate-100">
                  <TabsList className="bg-transparent h-10 gap-1 p-0">
                    <TabsTrigger value="weekly" className="text-[10px] font-bold uppercase px-6 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-[10px] font-bold uppercase px-6 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" x1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.03} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={15} stroke="#94a3b8" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Efficiency Index Sidecard */}
          {canSee('efficiency') && (
            <Card className="bg-white rounded-[3rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 space-y-10">
              <h3 className="font-bold text-xl tracking-tight text-slate-950">Efficiency Index</h3>
              <div className="grid grid-cols-2 gap-10">
                {[
                  { label: "Released", val: stats.completed, color: "text-slate-950" },
                  { label: "Production", val: stats.inProgress, color: "text-slate-950" },
                  { label: "Leads", val: stats.lead, color: "text-slate-950" },
                  { label: "Team", val: teamMembers?.length || 0, color: "text-slate-950" }
                ].map((s, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{s.label}</p>
                    <p className={`text-4xl font-bold font-headline tracking-tight ${s.color} tabular-nums`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dark Strategy Hub */}
          {canSee('market') && (
            <Card className="border-none shadow-[0_20px_50px_rgba(15,23,42,0.15)] rounded-[3rem] bg-slate-950 text-white p-10 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
              <div className="space-y-4 relative z-10">
                <Badge className="bg-white/10 text-white border-none rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">Live Intel</Badge>
                <h4 className="text-3xl font-bold font-headline tracking-tight leading-tight">Market Strategy Hub</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">Deploy AI research to identify production leads in Kerala districts.</p>
              </div>
              <Button asChild className="w-full h-16 bg-white text-slate-950 hover:bg-slate-100 rounded-full py-6 font-bold text-[11px] uppercase tracking-[0.2em] relative z-10 shadow-2xl transition-all active:scale-95">
                <Link href="/market-research">Analyze Markets</Link>
              </Button>
            </Card>
          )}

          {/* System Health / Badge Section */}
          <div className="flex flex-col items-center justify-center p-10 rounded-[3rem] border border-dashed border-slate-200 bg-white/50 space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-slate-900" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Status</p>
              <p className="text-sm font-bold text-slate-900">Environment Optimized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
