"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  Calendar,
  IndianRupee,
  AlertCircle
} from "lucide-react";
import { salesForecastGeneration } from "@/ai/flows/sales-forecast-generation";
import type { SalesForecastGenerationOutput } from "@/ai/flows/sales-forecast-generation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function SalesForecastPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState("4");
  const [forecastData, setForecastData] = useState<SalesForecastGenerationOutput | null>(null);

  const db = useFirestore();
  const { user } = useUser();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);
  const { data: projects, isLoading: projectsLoading } = useCollection(projectsQuery);

  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "clients"));
  }, [db, user]);
  const { data: clients, isLoading: clientsLoading } = useCollection(clientsQuery);

  const historicalProjects = useMemo(() => {
    if (!projects || !clients) return [];
    const clientMap = new Map();
    clients.forEach(c => clientMap.set(c.id, c.name));

    return projects.map(p => ({
      projectName: p.name,
      clientName: clientMap.get(p.clientId) || "Unknown",
      revenue: p.budget || 0,
      startDate: p.startDate || "2024-01-01",
      endDate: p.endDate || "2024-12-31",
      status: p.status || "Planned"
    }));
  }, [projects, clients]);

  const clientInfo = useMemo(() => {
    if (!clients) return [];
    return clients.map(c => ({
      clientName: c.name,
      industry: c.industry || "Media",
      pastProjectCount: projects?.filter(p => p.clientId === c.id).length || 0
    }));
  }, [clients, projects]);

  const handleGenerateForecast = async () => {
    if (historicalProjects.length === 0) return;
    
    setIsGenerating(true);
    try {
      const result = await salesForecastGeneration({
        historicalProjects: historicalProjects,
        clients: clientInfo,
        forecastPeriodInWeeks: parseInt(forecastPeriod),
      });
      setForecastData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'hsl(var(--accent))';
      case 'Medium': return '#EAB308';
      case 'Low': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--primary))';
    }
  };

  const isLoadingData = projectsLoading || clientsLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Strategic Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">AI-powered revenue projections based on actual production performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[200px] h-12 rounded-xl border-slate-100 font-bold text-xs tracking-normal">
              <SelectValue placeholder="Forecast period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="4" className="text-xs font-bold uppercase">Next 4 Weeks</SelectItem>
              <SelectItem value="8" className="text-xs font-bold uppercase">Next 8 Weeks</SelectItem>
              <SelectItem value="12" className="text-xs font-bold uppercase">Next 12 Weeks</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerateForecast} 
            disabled={isGenerating || historicalProjects.length === 0 || isLoadingData} 
            className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 tracking-normal"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {forecastData ? "Update Intelligence" : "Analyze Strategy"}
          </Button>
        </div>
      </div>

      {!forecastData && !isGenerating && (
        <Card className="border-2 border-dashed border-slate-100 bg-white/50 rounded-[3rem]">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="bg-primary/10 p-6 rounded-[2rem] shadow-sm">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Project Your Future Revenue</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed tracking-normal">
                MediaFlow AI analyzes your historical client data, production asset loads, and market trends to predict upcoming earnings.
              </p>
            </div>
            <Button 
              onClick={handleGenerateForecast} 
              disabled={historicalProjects.length === 0 || isLoadingData} 
              className="mt-4 rounded-xl px-10 h-12 font-bold tracking-normal"
            >
              {historicalProjects.length === 0 ? "Insufficient Data" : "Start Analysis"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="space-y-2">
            <p className="text-lg font-bold text-slate-900 tracking-normal">Synthesizing Intelligence...</p>
            <p className="text-sm text-slate-400 animate-pulse uppercase font-bold tracking-normal">Analyzing trends and asset throughput</p>
          </div>
        </div>
      )}

      {forecastData && !isGenerating && (
        <div className="grid gap-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 h-full">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Weekly Revenue Projections (INR)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData.forecasts}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                      <XAxis dataKey="period" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Projected Revenue']}
                      />
                      <Bar dataKey="projectedRevenue" radius={[8, 8, 8, 8]} barSize={32}>
                        {forecastData.forecasts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getConfidenceColor(entry.confidenceLevel)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-8 mt-8 text-[10px] font-bold uppercase tracking-normal text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" /> High Confidence
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> Medium
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" /> Low
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
              <CardHeader className="p-0 mb-8 relative z-10">
                <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Executive Intelligence Brief</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-8">
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
                    <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal">
                      "{forecastData.overallSummary}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-normal mb-1">Total Projected</p>
                      <p className="text-3xl font-bold font-headline tracking-normal">
                        ₹{forecastData.forecasts.reduce((acc, curr) => acc + curr.projectedRevenue, 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-normal mb-1">Avg Confidence</p>
                      <p className="text-3xl font-bold font-headline tracking-normal">Medium</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-bold font-headline text-slate-900 tracking-normal">Period Breakdown</h3>
            </div>
            <CardContent className="p-10 space-y-4">
              {forecastData.forecasts.map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg tracking-normal">{item.period}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 tracking-normal">{item.explanation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-normal mb-1">Projected Revenue</p>
                      <p className="font-bold text-2xl text-slate-900 tracking-normal">₹{item.projectedRevenue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-normal mb-1">Confidence</p>
                      <Badge className={`border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal ${
                        item.confidenceLevel === 'High' ? 'bg-accent/10 text-accent' :
                        item.confidenceLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {item.confidenceLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
