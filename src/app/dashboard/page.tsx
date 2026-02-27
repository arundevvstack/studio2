
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  Target, 
  Zap, 
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Activity,
  IndianRupee,
  PieChart as PieIcon,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";

const CHART_COLORS = ['#2E86C1', '#4CAF50', '#F39C12', '#9B59B6', '#E74C3C', '#1ABC9C'];

/**
 * @fileOverview Analytics Dashboard.
 * High-fidelity monitoring of organizational throughput and revenue.
 */
export default function AnalyticsDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: userData, isLoading: isUserRegistryLoading } = useDoc(userRef);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: projects, isLoading: isProjectsLoading } = useCollection(projectsQuery);

  const leadsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "leads"));
  }, [db, user]);
  const { data: leads } = useCollection(leadsQuery);

  useEffect(() => {
    if (!isUserLoading && !isUserRegistryLoading && mounted) {
      if (!user || !userData || userData.status !== "active" || !userData.strategicPermit) {
        router.push("/login");
      }
    }
  }, [user, userData, isUserLoading, isUserRegistryLoading, router, mounted]);

  const stats = useMemo(() => {
    if (!projects) return { totalRevenue: 0, activeProjects: 0, pipelineValue: 0, conversionRate: 0, verticalData: [] };
    
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const activeProjects = projects.filter(p => p.status !== "Released").length;
    const pipelineValue = leads?.reduce((sum, l) => sum + (l.estimatedBudget || 0), 0) || 0;
    
    const wonLeads = leads?.filter(l => l.status === 'Won').length || 0;
    const totalLeads = leads?.length || 0;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const verticals = projects.reduce((acc: any, p) => {
      const type = p.type || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const verticalData = Object.entries(verticals).map(([name, value]) => ({ name, value }));

    return { totalRevenue, activeProjects, pipelineValue, conversionRate, verticalData };
  }, [projects, leads]);

  if (!mounted || isUserLoading || isUserRegistryLoading || isProjectsLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Synchronizing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring organizational throughput and strategic financial metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest border-slate-100 bg-white">
            <Link href="/intelligence">Operations Hub</Link>
          </Button>
          <Button asChild className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 gap-2 text-xs uppercase tracking-widest">
            <Link href="/projects/new"><Plus className="h-4 w-4" /> New Production</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Portfolio Value", val: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: "bg-blue-50 text-blue-600" },
          { label: "Active Loads", val: stats.activeProjects, icon: Briefcase, color: "bg-orange-50 text-orange-600" },
          { label: "Pipeline Depth", val: `₹${(stats.pipelineValue / 100000).toFixed(1)}L`, icon: Target, color: "bg-emerald-50 text-emerald-600" },
          { label: "Conversion Index", val: `${stats.conversionRate}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" }
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
            <div className={`h-12 w-12 rounded-2xl ${s.color} flex items-center justify-center`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-3xl font-bold font-headline mt-1">{s.val}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-sm rounded-[2.5rem] bg-white p-10">
          <CardHeader className="p-0 mb-10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold font-headline">Revenue Trajectory</CardTitle>
              <p className="text-sm text-slate-400 font-medium">Aggregated project budgets across the current cycle.</p>
            </div>
            <BarChart3 className="h-6 w-6 text-slate-200" />
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects?.slice(0, 10).reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                <XAxis dataKey="name" hide />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Budget']}
                />
                <Bar dataKey="budget" radius={[6, 6, 0, 0]} barSize={40}>
                  {projects?.slice(0, 10).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm rounded-[2.5rem] bg-white p-10 flex flex-col">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-xl font-bold font-headline">Vertical Split</CardTitle>
            <p className="text-sm text-slate-400 font-medium">Asset distribution by vertical.</p>
          </CardHeader>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.verticalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.verticalData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {stats.verticalData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold font-headline text-slate-900">Recent Production Feed</h3>
            <Button variant="link" asChild className="text-primary font-bold text-[10px] uppercase tracking-widest p-0">
              <Link href="/projects">View All Registry <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-50">
            {projects?.slice(0, 5).map((p) => (
              <div key={p.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <Activity className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 tracking-tight">{p.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.status || "In Discussion"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <p className="text-sm font-bold text-slate-900 tracking-tight">₹{(p.budget || 0).toLocaleString('en-IN')}</p>
                  <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all">
                    <Link href={`/projects/${p.id}`}><ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] rounded-full -mr-24 -mt-24" />
          <div className="space-y-6 relative z-10">
            <Badge className="bg-white/10 text-white border-none rounded-full px-4 py-1 text-[9px] font-bold uppercase tracking-widest">Efficiency index</Badge>
            <h3 className="text-3xl font-bold font-headline tracking-tight leading-tight">Operating at High Fidelity</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Your current production load is balanced with {stats.activeProjects} active assets moving through stages.</p>
          </div>
          <div className="relative z-10 pt-10 border-t border-white/5 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Network utilization</span>
                <span className="text-primary">82%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '82%' }} />
              </div>
            </div>
            <Button asChild className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest shadow-2xl">
              <Link href="/intelligence">Operations Hub</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
