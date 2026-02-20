"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  History,
  Save,
  IndianRupee,
  Loader2
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const STATUS_PROGRESS_MAP: Record<string, number> = {
  "Planned": 0,
  "Discussion": 20,
  "Pre Production": 40,
  "In Progress": 60,
  "Post Production": 80,
  "Completed": 100,
};

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const [progress, setProgress] = useState([0]);

  const projectRef = useMemoFirebase(() => doc(db, "projects", projectId), [db, projectId]);
  const { data: project, isLoading } = useDoc(projectRef);

  // Edit State
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    if (project) {
      setEditData({
        name: project.name || "",
        status: project.status || "Planned",
        budget: project.budget || 0,
        description: project.description || "",
      });
      if (typeof project.progress === 'number') {
        setProgress([project.progress]);
      } else {
        const initialProgress = STATUS_PROGRESS_MAP[project.status || "Planned"] || 0;
        setProgress([initialProgress]);
      }
    }
  }, [project]);

  // Dirty check to activate Save button
  const isDirty = useMemo(() => {
    if (!project || !editData) return false;
    return (
      editData.name !== (project.name || "") ||
      editData.status !== (project.status || "Planned") ||
      editData.budget !== (project.budget || 0) ||
      editData.description !== (project.description || "") ||
      progress[0] !== (project.progress || 0)
    );
  }, [project, editData, progress]);

  const handleUpdateProject = () => {
    if (!editData?.name) return;
    
    updateDocumentNonBlocking(projectRef, {
      ...editData,
      progress: progress[0],
      updatedAt: serverTimestamp()
    });
    
    toast({
      title: "Strategy Updated",
      description: `${editData.name} has been synchronized.`
    });
  };

  const handleStatusChange = (val: string) => {
    setEditData((prev: any) => ({ ...prev, status: val }));
    const newProgress = STATUS_PROGRESS_MAP[val] || 0;
    setProgress([newProgress]);
  };

  const handleDeleteProject = () => {
    deleteDocumentNonBlocking(projectRef);
    toast({
      variant: "destructive",
      title: "Project Purged",
      description: "Production entity has been removed from the pipeline."
    });
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center">Loading Production Entity...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline">Project Not Found</h2>
        <Button onClick={() => router.push("/projects")}>Return to Pipeline</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0"
            onClick={() => router.push("/projects")}
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none">
                {project.name}
              </h1>
              <span className="text-primary font-bold text-xs uppercase bg-primary/5 px-2 py-0.5 rounded-md">
                #{projectId.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="text-primary uppercase text-[10px]">Campaign Entity</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="h-4 w-4" />
                Phase: {project.status || "TBD"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <Settings2 className="h-4 w-4" />
                Edit Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline">Update Production Entity</DialogTitle>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title</label>
                    <Input 
                      value={editData?.name || ""} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12"
                      placeholder="Enter project title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Campaign Phase</label>
                    <Select value={editData?.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 shadow-none focus:ring-0">
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="Planned">Pitch</SelectItem>
                        <SelectItem value="Discussion">Discussion</SelectItem>
                        <SelectItem value="Pre Production">Pre Production</SelectItem>
                        <SelectItem value="In Progress">Production</SelectItem>
                        <SelectItem value="Post Production">Post Production</SelectItem>
                        <SelectItem value="Completed">Released</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Strategic Quote (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="number"
                      value={editData?.budget || 0} 
                      onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})}
                      className="rounded-xl bg-slate-50 border-none h-12 pl-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Executive Summary</label>
                  <Textarea 
                    value={editData?.description || ""} 
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="rounded-xl bg-slate-50 border-none min-h-[120px] resize-none"
                    placeholder="Briefly describe the campaign strategy"
                  />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between">
                <DialogClose asChild>
                  <Button variant="ghost" onClick={handleDeleteProject} className="text-destructive font-bold text-xs uppercase hover:bg-destructive/5 hover:text-destructive gap-2">
                    <Trash2 className="h-4 w-4" />
                    Purge Campaign
                  </Button>
                </DialogClose>
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      onClick={handleUpdateProject} 
                      disabled={!isDirty}
                      className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6 h-11 gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleUpdateProject} 
            disabled={!isDirty}
            className="h-12 flex-1 md:flex-none px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Phase</label>
                  <Select value={editData?.status || project.status || "Planned"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-12 bg-transparent border-none p-0 text-xl font-bold font-headline shadow-none focus:ring-0">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="Planned">Pitch</SelectItem>
                      <SelectItem value="Discussion">Discussion</SelectItem>
                      <SelectItem value="Pre Production">Pre Production</SelectItem>
                      <SelectItem value="In Progress">Production</SelectItem>
                      <SelectItem value="Post Production">Post Production</SelectItem>
                      <SelectItem value="Completed">Released</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Criticality</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="h-12 bg-transparent border-none p-0 text-xl font-bold font-headline shadow-none focus:ring-0">
                      <SelectValue placeholder="Select criticality" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cap-Ex Budget</label>
                  <div className="h-12 flex items-center text-xl font-bold font-headline">₹{(project.budget || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Optimization Progress</span>
                  <span className="text-3xl font-bold font-headline text-primary">{progress[0]}%</span>
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
              <TabsList className="h-auto bg-transparent px-10 pt-6 gap-8 border-b rounded-none p-0">
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
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
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
                <h2 className="text-4xl font-bold font-headline">₹{(project.budget || 0).toLocaleString('en-IN')}</h2>
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

              <Button asChild className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase transition-colors border border-white/10">
                <Link href="/invoices/new">Generate Billing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
