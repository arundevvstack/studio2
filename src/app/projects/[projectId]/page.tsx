"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Settings2, 
  Sparkles, 
  Trash2, 
  Plus, 
  Users, 
  Clock, 
  Target,
  LayoutGrid,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const [progress, setProgress] = useState([65]);

  const projectRef = useMemoFirebase(() => doc(db, "projects", projectId), [db, projectId]);
  const { data: project, isLoading } = useDoc(projectRef);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24">
        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl bg-white border-slate-200 shadow-sm"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900">
                {project?.name || "Production"}
              </h1>
              <span className="text-primary font-bold text-xs uppercase">
                #{projectId.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="text-primary">Campaign Entity</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="h-4 w-4" />
                Target: {project?.status || "TBD"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2 bg-white border-slate-200">
            <Settings2 className="h-4 w-4" />
            SCOPE
          </Button>
          <Button className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
            Edit Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-10 pt-10 pb-6">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase">
                Throughput Analysis
              </CardTitle>
              <Button variant="outline" className="h-9 px-4 rounded-xl text-primary border-primary/20 bg-primary/5 font-bold text-[10px] gap-2 hover:bg-primary/10 transition-colors">
                <Sparkles className="h-3 w-3" />
                AI INTEL
              </Button>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phase</label>
                  <Select defaultValue={project?.status?.toLowerCase() || "planned"}>
                    <SelectTrigger className="h-12 bg-transparent border-none p-0 text-xl font-bold font-headline shadow-none focus:ring-0">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Pitch</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="pre production">Pre Production</SelectItem>
                      <SelectItem value="in progress">Production</SelectItem>
                      <SelectItem value="post production">Post Production</SelectItem>
                      <SelectItem value="completed">Released</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Criticality</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="h-12 bg-transparent border-none p-0 text-xl font-bold font-headline shadow-none focus:ring-0">
                      <SelectValue placeholder="Select criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cap-Ex Budget</label>
                  <div className="h-12 flex items-center text-xl font-bold font-headline">₹{(project?.budget || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Optimization Progress</span>
                  <span className="text-3xl font-bold font-headline text-primary">{progress}%</span>
                </div>
                <Slider 
                  value={progress} 
                  onValueChange={setProgress} 
                  max={100} 
                  step={1} 
                  className="[&>[data-orientation=horizontal]]:bg-slate-100 [&_.bg-primary]:bg-primary [&_.border-primary]:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden">
            <Tabs defaultValue="objectives" className="w-full">
              <TabsList className="h-auto bg-transparent px-10 pt-6 gap-8 border-b rounded-none">
                <TabsTrigger 
                  value="objectives" 
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2"
                >
                  <LayoutGrid className="h-3 w-3" />
                  Mission Objectives
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2"
                >
                  <History className="h-3 w-3" />
                  Log History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="objectives" className="p-10 space-y-8 m-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Active Elements</p>
                    <h3 className="text-xl font-bold font-headline mt-1">Production Objectives</h3>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase">0/1 Synced</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-50 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-6">
                      <Checkbox className="h-5 w-5 rounded-md border-slate-200" />
                      <div>
                        <p className="font-bold text-lg">Initialize Production</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                            <Clock className="h-3 w-3" /> NO DEADLINE
                          </span>
                          <Users className="h-3 w-3 text-slate-300" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-50 text-blue-500 border-none font-bold text-[10px] uppercase px-3">ACTIVE</Badge>
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2">
                    <Plus className="h-4 w-4" />
                    Define Objective
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase">Strategic Talent</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="border-2 border-dashed border-slate-100 rounded-2xl h-24 flex items-center justify-center">
                <Button variant="ghost" className="text-slate-400 font-bold text-[10px] uppercase hover:bg-transparent">
                  Manage Staff
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] text-white border-none rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-[10px] font-bold text-slate-500 uppercase">Financial Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div>
                <h2 className="text-4xl font-bold font-headline">₹{(project?.budget || 0).toLocaleString('en-IN')}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Deployment Limit</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Allocation</span>
                  <span className="text-primary">45%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '45%' }} />
                </div>
              </div>

              <Button className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase transition-colors border border-white/10">
                Generate Billing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
