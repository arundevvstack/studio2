
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Filter, 
  BarChart3, 
  Search,
  Briefcase,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Timer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

/**
 * @fileOverview Strategic Time Tracking Module.
 * Tracks billable hours against production entities with a live executive timer.
 */

export default function TimeTrackingPage() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const db = useFirestore();
  const { user } = useUser();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);
  const { data: projects, isLoading: projectsLoading } = useCollection(projectsQuery);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (!selectedProjectId) return;
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Production Chronos</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Monitor productivity and billable throughput across production tasks.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold text-xs uppercase gap-2 bg-white border-slate-200 tracking-normal shadow-sm">
            <BarChart3 className="h-4 w-4" />
            Timesheets
          </Button>
          <Button className="h-12 px-6 rounded-xl font-bold text-xs uppercase gap-2 shadow-lg shadow-primary/20 tracking-normal">
            <Clock className="h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-xl rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden relative p-12">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-[-20deg] translate-x-12 pointer-events-none" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest mb-1">Session Intelligence</p>
                <h3 className="text-3xl font-bold font-headline tracking-normal">Active Performance Timer</h3>
              </div>
              <Timer className="h-10 w-10 text-white opacity-20" />
            </div>

            <div className="flex flex-col items-center justify-center py-10">
              <span className="text-8xl font-bold tabular-nums leading-none tracking-tight shadow-text">
                {formatTime(seconds)}
              </span>
              <p className="text-primary-foreground/70 mt-6 font-bold uppercase text-xs tracking-widest">
                {isActive ? "High Productivity Phase" : "Awaiting Strategy Activation"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest">Production Entity</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="h-14 w-full bg-white/10 border-white/20 text-white rounded-2xl font-bold backdrop-blur-md focus:ring-white/20">
                    <SelectValue placeholder="Identify project..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl">
                    {projects?.map(p => (
                      <SelectItem key={p.id} value={p.id} className="font-medium">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleToggleTimer} 
                  disabled={!selectedProjectId}
                  size="lg" 
                  variant="secondary" 
                  className="flex-1 h-16 rounded-2xl font-bold text-primary shadow-xl hover:scale-105 transition-transform"
                >
                  {isActive ? (
                    <>
                      <Pause className="h-6 w-6 mr-2" />
                      Pause Strategy
                    </>
                  ) : (
                    <>
                      <Play className="h-6 w-6 mr-2" />
                      Start Tracking
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-2xl h-16 w-16 p-0"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-8">
            <h3 className="text-xl font-bold font-headline tracking-normal">Weekly Velocity</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                  <span className="text-slate-400">Hours Recorded</span>
                  <span className="text-slate-900">12 / 40 hrs</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[30%]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Load</p>
                  <p className="text-2xl font-bold font-headline text-slate-900 mt-1">3.4h</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Efficiency</p>
                  <p className="text-2xl font-bold font-headline text-accent mt-1">94%</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">System Guidance</p>
              <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal">
                "Maintaining consistent time records across all production verticals ensures accurate resource modeling for future lead generation."
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-bold font-headline text-slate-900 tracking-normal">Recent Chronology</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold text-[10px] uppercase gap-2 border-slate-100 bg-white">
              <Calendar className="h-3.5 w-3.5" />
              This Week
            </Button>
            <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold text-[10px] uppercase gap-2 border-slate-100 bg-white">
              <Filter className="h-3.5 w-3.5" />
              Refine
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          {projectsLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {projects?.slice(0, 5).map((project, i) => (
                <div key={project.id} className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-normal leading-none">{project.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-normal flex items-center gap-2">
                        <Briefcase className="h-3 w-3" /> Production Asset • Yesterday
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-xl font-bold tabular-nums text-slate-900 tracking-normal">04:20:00</p>
                      <Badge variant="outline" className="border-slate-100 text-[8px] font-bold uppercase px-2 py-0.5 mt-1 tracking-normal">Billable</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!projects || projects.length === 0) && (
                <div className="p-24 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center p-5 shadow-inner">
                    <Search className="h-full w-full text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No recent chronos entries</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
