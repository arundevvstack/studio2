
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Settings2, 
  Trash2, 
  Plus, 
  Target,
  LayoutGrid,
  History,
  IndianRupee,
  Loader2,
  ArrowRight,
  Calendar as CalendarIcon,
  User,
  Clock,
  Ticket as TicketIcon,
  AlertCircle,
  MessageSquare,
  Users,
  Search,
  Star,
  MapPin,
  CheckCircle2,
  Filter,
  X,
  Zap,
  TrendingUp,
  Tag
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
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, serverTimestamp, orderBy, where } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const STATUS_PROGRESS_MAP: Record<string, number> = {
  "Lead": 0,
  "Discussion": 0,
  "Pre Production": 0,
  "In Progress": 33,
  "Post Production": 66,
  "Released": 100,
};

const NEXT_PHASE_MAP: Record<string, string | null> = {
  "Lead": "Discussion",
  "Discussion": "Pre Production",
  "Pre Production": "In Progress",
  "In Progress": "Post Production",
  "Post Production": "Released",
  "Released": null
};

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [progress, setProgress] = useState([0]);
  const [recruitSearch, setRecruitSearch] = useState("");

  const projectRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "projects", projectId);
  }, [db, projectId, user]);
  const { data: project, isLoading: isProjectLoading } = useDoc(projectRef);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "projects", projectId, "tasks"),
      orderBy("createdAt", "asc")
    );
  }, [db, projectId, user]);
  const { data: allTasks, isLoading: isTasksLoading } = useCollection(tasksQuery);

  const ticketsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "projects", projectId, "tickets"),
      orderBy("createdAt", "desc")
    );
  }, [db, projectId, user]);
  const { data: tickets, isLoading: isTicketsLoading } = useCollection(ticketsQuery);

  // Shoot Network for Team Suggestions
  const talentQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "shoot_network"), where("isArchived", "==", false));
  }, [db, user]);
  const { data: shootNetwork, isLoading: isTalentLoading } = useCollection(talentQuery);

  const [editData, setEditData] = useState<any>(null);
  const [newObjective, setNewObjective] = useState({ 
    name: "", 
    description: "", 
    dueDate: "", 
    assignedTeamMemberId: "" 
  });
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "Medium",
    type: "Bug",
    assignedToTeamMemberId: ""
  });

  useEffect(() => {
    if (project) {
      setEditData({
        name: project.name || "",
        status: project.status || "Lead",
        budget: project.budget || 0,
        description: project.description || "",
        location: project.location || "",
        tags: project.tags || [],
      });
      if (typeof project.progress === 'number') {
        setProgress([project.progress]);
      } else {
        const initialProgress = STATUS_PROGRESS_MAP[project.status || "Lead"] || 0;
        setProgress([initialProgress]);
      }
    }
  }, [project]);

  const activeViewPhase = project?.status || "Lead";

  const currentPhaseTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter(t => t.phase === activeViewPhase);
  }, [allTasks, activeViewPhase]);

  const canTransition = useMemo(() => {
    if (currentPhaseTasks.length === 0) return false;
    return currentPhaseTasks.every(t => t.status === 'Completed');
  }, [currentPhaseTasks]);

  const isDirty = useMemo(() => {
    if (!project || !editData) return false;
    return (
      editData.name !== (project.name || "") ||
      editData.status !== (project.status || "Lead") ||
      editData.budget !== (project.budget || 0) ||
      editData.description !== (project.description || "") ||
      editData.location !== (project.location || "") ||
      JSON.stringify(editData.tags) !== JSON.stringify(project.tags || []) ||
      progress[0] !== (project.progress || 0)
    );
  }, [project, editData, progress]);

  // --- Talent Suggestion Logic ---
  const suggestions = useMemo(() => {
    if (!shootNetwork || !project) return [];
    
    return shootNetwork.map(talent => {
      let score = 0;
      
      // Location Match
      if (project.location && talent.district === project.location) score += 5;
      
      // Rank Score
      score += (talent.rank || 0);
      
      // Tag Match
      if (project.tags && talent.suitableProjectTypes) {
        const matchCount = project.tags.filter((t: string) => talent.suitableProjectTypes.includes(t)).length;
        score += matchCount * 2;
      }

      return { ...talent, score };
    })
    .filter(t => !project.crew?.some((c: any) => c.talentId === t.id)) // Hide already recruited
    .filter(t => t.name?.toLowerCase().includes(recruitSearch.toLowerCase()) || t.category?.toLowerCase().includes(recruitSearch.toLowerCase()))
    .sort((a, b) => b.score - a.score);
  }, [shootNetwork, project, recruitSearch]);

  const handleRecruit = (talent: any) => {
    if (!projectRef || !project) return;
    const newCrew = [...(project.crew || []), {
      talentId: talent.id,
      name: talent.name,
      category: talent.category,
      thumbnail: talent.thumbnail || `https://picsum.photos/seed/${talent.id}/100/100`,
      role: "Assigned"
    }];
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ title: "Talent Recruited", description: `${talent.name} added to production crew.` });
  };

  const handleRemoveRecruit = (talentId: string) => {
    if (!projectRef || !project) return;
    const newCrew = (project.crew || []).filter((c: any) => c.talentId !== talentId);
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ variant: "destructive", title: "Member Removed", description: "Crew member de-provisioned." });
  };

  const handleUpdateProject = () => {
    if (!editData?.name || !projectRef) return;
    updateDocumentNonBlocking(projectRef, {
      ...editData,
      progress: progress[0],
      updatedAt: serverTimestamp()
    });
    toast({ title: "Project Synchronized", description: `${editData.name} has been updated.` });
  };

  const handleStatusChange = (val: string) => {
    if (!projectRef) return;
    updateDocumentNonBlocking(projectRef, {
      status: val,
      progress: STATUS_PROGRESS_MAP[val] || 0,
      updatedAt: serverTimestamp()
    });
    toast({
      title: "Stage Updated",
      description: `Project phase advanced to ${val}.`
    });
  };

  const handleTransition = () => {
    const nextPhase = NEXT_PHASE_MAP[project?.status || "Lead"];
    if (!nextPhase || !projectRef) return;
    updateDocumentNonBlocking(projectRef, {
      status: nextPhase,
      progress: STATUS_PROGRESS_MAP[nextPhase] || 0,
      updatedAt: serverTimestamp()
    });
    toast({
      title: "Stage Advanced",
      description: `Project has transitioned to ${nextPhase}.`
    });
  };

  const handleAddObjective = () => {
    if (!newObjective.name) return;
    const tasksRef = collection(db, "projects", projectId, "tasks");
    addDocumentNonBlocking(tasksRef, {
      name: newObjective.name,
      description: newObjective.description,
      dueDate: newObjective.dueDate,
      assignedTeamMemberId: newObjective.assignedTeamMemberId,
      status: "Active",
      phase: activeViewPhase,
      projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setNewObjective({ name: "", description: "", dueDate: "", assignedTeamMemberId: "" });
    toast({ title: "Objective Defined", description: "New mission objective added." });
  };

  const handleAddTicket = () => {
    if (!newTicket.title) return;
    const ticketsRef = collection(db, "projects", projectId, "tickets");
    addDocumentNonBlocking(ticketsRef, {
      ...newTicket,
      projectId,
      status: "Open",
      reportedByTeamMemberId: user?.uid || "Unknown",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setNewTicket({
      title: "",
      description: "",
      priority: "Medium",
      type: "Bug",
      assignedToTeamMemberId: ""
    });
    toast({ title: "Ticket Logged", description: "Support request has been recorded." });
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const taskRef = doc(db, "projects", projectId, "tasks", taskId);
    updateDocumentNonBlocking(taskRef, {
      status: currentStatus === "Completed" ? "Active" : "Completed",
      updatedAt: serverTimestamp()
    });
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: string) => {
    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);
    updateDocumentNonBlocking(ticketRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Ticket Updated", description: `Status changed to ${newStatus}.` });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskRef = doc(db, "projects", projectId, "tasks", taskId);
    deleteDocumentNonBlocking(taskRef);
  };

  const handleDeleteProject = () => {
    if (!projectRef) return;
    deleteDocumentNonBlocking(projectRef);
    toast({ variant: "destructive", title: "Project Purged", description: "Production entity removed." });
    router.push("/projects");
  };

  const isLoading = isUserLoading || isProjectLoading;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center tracking-normal">Loading Production Entity...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline tracking-normal text-slate-900">Project Not Found</h2>
        <Button onClick={() => router.push("/projects")} className="font-bold tracking-normal rounded-xl">Return to Pipeline</Button>
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
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">
                {project.name}
              </h1>
              <span className="text-primary font-bold text-[10px] uppercase bg-primary/5 px-3 py-1 rounded-lg tracking-normal">
                #{projectId.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold tracking-normal">
              <span className="text-primary uppercase text-[10px] tracking-normal">Project Entity</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2 text-slate-400 tracking-normal">
                <Target className="h-4 w-4" />
                Phase: {project.status || "Lead"}
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2 text-slate-400 tracking-normal">
                <MapPin className="h-4 w-4" />
                Hub: {project.location || "Central"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors tracking-normal shadow-sm">
                <Settings2 className="h-4 w-4" />
                Configure Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Production Entity</DialogTitle>
              </DialogHeader>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Title</label>
                    <Input 
                      value={editData?.name || ""} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Phase</label>
                    <Select value={editData?.status} onValueChange={(val) => setEditData({...editData, status: val})}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 shadow-none focus:ring-0 tracking-normal">
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Discussion">Discussion</SelectItem>
                        <SelectItem value="Pre Production">Pre Production</SelectItem>
                        <SelectItem value="In Progress">Production</SelectItem>
                        <SelectItem value="Post Production">Post Production</SelectItem>
                        <SelectItem value="Released">Released</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Hub (District)</label>
                    <Select value={editData?.location} onValueChange={(val) => setEditData({...editData, location: val})}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 tracking-normal">
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
                        {KERALA_DISTRICTS.map(d => <SelectItem key={d} value={d} className="tracking-normal">{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Quote (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number"
                        value={editData?.budget || 0} 
                        onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})}
                        className="rounded-xl bg-slate-50 border-none h-12 pl-12 tracking-normal"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Summary</label>
                  <Textarea 
                    value={editData?.description || ""} 
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="rounded-xl bg-slate-50 border-none min-h-[120px] resize-none tracking-normal p-4"
                  />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center">
                <DialogClose asChild>
                  <Button variant="ghost" onClick={handleDeleteProject} className="text-destructive font-bold text-xs uppercase gap-2 tracking-normal hover:bg-destructive/5 hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Purge Project
                  </Button>
                </DialogClose>
                <div className="flex gap-3">
                  <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal">Cancel</Button></DialogClose>
                  <DialogClose asChild><Button onClick={handleUpdateProject} disabled={!isDirty} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6 h-11 gap-2 tracking-normal">Save Changes</Button></DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleUpdateProject} disabled={!isDirty} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] tracking-normal">Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-10 pt-10 pb-6">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Throughput Analysis</CardTitle>
              {canTransition && NEXT_PHASE_MAP[project.status] && (
                <Button onClick={handleTransition} className="h-9 px-4 rounded-xl bg-accent text-white font-bold text-[10px] gap-2 hover:bg-accent/90 transition-all animate-bounce tracking-normal uppercase shadow-lg shadow-accent/20">
                  Advance to {NEXT_PHASE_MAP[project.status]} <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lifecycle Stage</label>
                  <Select value={project.status || "Lead"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-full bg-transparent border-none p-0 font-bold font-headline text-xl shadow-none focus:ring-0 tracking-normal">
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="Lead" className="font-bold">Lead</SelectItem>
                      <SelectItem value="Discussion" className="font-bold">Discussion</SelectItem>
                      <SelectItem value="Pre Production" className="font-bold">Pre Production</SelectItem>
                      <SelectItem value="In Progress" className="font-bold">Production</SelectItem>
                      <SelectItem value="Post Production" className="font-bold">Post Production</SelectItem>
                      <SelectItem value="Released" className="font-bold">Released</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Team</label>
                  <p className="text-xl font-bold font-headline text-slate-900 tracking-normal">{project.crew?.length || 0} Members</p>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Cap-Ex Budget</label>
                  <div className="h-8 flex items-center text-xl font-bold font-headline tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Optimization Progress</span>
                  <span className="text-3xl font-bold font-headline text-primary tracking-normal">{progress[0]}%</span>
                </div>
                <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="[&_.bg-primary]:bg-primary" />
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
            <Tabs defaultValue="team" className="w-full">
              <TabsList className="h-auto bg-transparent px-10 pt-6 gap-8 border-b rounded-none p-0 overflow-x-auto custom-scrollbar">
                <TabsTrigger value="team" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal">
                  <Users className="h-3.5 w-3.5" /> Project Team
                </TabsTrigger>
                <TabsTrigger value="objectives" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal">
                  <LayoutGrid className="h-3.5 w-3.5" /> Production Objectives
                </TabsTrigger>
                <TabsTrigger value="tickets" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal">
                  <TicketIcon className="h-3.5 w-3.5" /> Support Tickets
                </TabsTrigger>
                <TabsTrigger value="history" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal">
                  <History className="h-3.5 w-3.5" /> Log History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="team" className="p-10 space-y-8 m-0 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Recruitment & Deployment</p>
                    <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Production Crew</h3>
                  </div>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase gap-2 tracking-normal shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Recruit Talent
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-[500px] rounded-l-[3rem] p-0 border-none shadow-2xl overflow-hidden bg-slate-50">
                      <SheetHeader className="p-8 pb-4 bg-white border-b border-slate-100">
                        <SheetTitle className="text-2xl font-bold font-headline tracking-normal">Recruit Partner</SheetTitle>
                        <p className="text-xs text-slate-500 font-medium tracking-normal">Discover and assign verified professionals from the Shoot Network.</p>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={recruitSearch}
                            onChange={(e) => setRecruitSearch(e.target.value)}
                            placeholder="Search by name or category..." 
                            className="pl-12 h-12 rounded-xl bg-white border-none shadow-sm font-bold tracking-normal"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                              <Zap className="h-3 w-3 text-primary" /> Intelligence Suggestions
                            </h4>
                            <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold uppercase px-2 tracking-normal">Optimized</Badge>
                          </div>
                          
                          {isTalentLoading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                          ) : suggestions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                              {suggestions.slice(0, 15).map((talent) => (
                                <Card key={talent.id} className="border-none shadow-sm rounded-2xl bg-white p-4 hover:shadow-md transition-all group">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-12 w-12 rounded-xl shadow-sm border-2 border-slate-50">
                                        <AvatarImage src={talent.thumbnail || `https://picsum.photos/seed/${talent.id}/100/100`} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{talent.name?.[0]}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-bold text-sm text-slate-900 tracking-normal">{talent.name}</p>
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-normal">{talent.category}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="flex items-center gap-1">
                                            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-[9px] font-bold text-slate-500">{talent.rank || 5}.0</span>
                                          </div>
                                          <span className="text-[9px] text-slate-200">•</span>
                                          <div className="flex items-center gap-1">
                                            <MapPin className="h-2.5 w-2.5 text-slate-300" />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">{talent.district}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      onClick={() => handleRecruit(talent)}
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="py-20 text-center space-y-2 bg-white/50 rounded-2xl border-2 border-dashed border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-normal">No talent matching search</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {project.crew && project.crew.length > 0 ? (
                    project.crew.map((member: any) => (
                      <Card key={member.talentId} className="border-none shadow-sm rounded-3xl bg-white p-6 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-slate-50">
                        <Button 
                          onClick={() => handleRemoveRecruit(member.talentId)}
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 h-8 w-8 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col items-center text-center space-y-4">
                          <Avatar className="h-20 w-20 rounded-[1.5rem] shadow-lg border-4 border-slate-50 group-hover:scale-105 transition-transform">
                            <AvatarImage src={member.thumbnail} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">{member.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 tracking-normal leading-tight">{member.name}</h4>
                            <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-normal">{member.category}</p>
                          </div>
                          <Badge className="bg-slate-50 text-slate-500 border-none text-[9px] font-bold uppercase px-4 py-1 rounded-lg tracking-normal">
                            {member.role || "Recruited"}
                          </Badge>
                          <div className="flex gap-2 w-full pt-2">
                            <Button asChild variant="outline" className="flex-1 h-9 rounded-xl border-slate-100 font-bold text-[9px] uppercase tracking-normal">
                              <Link href={`/shoot-network/${member.talentId}`}>Profile</Link>
                            </Button>
                            <Button variant="outline" className="flex-1 h-9 rounded-xl border-slate-100 font-bold text-[9px] uppercase tracking-normal">
                              Chat
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-32 border-2 border-dashed border-slate-50 rounded-[3rem] text-center space-y-6 flex flex-col items-center">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center">
                        <Users className="h-8 w-8 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No crew members assigned</p>
                        <p className="text-xs text-slate-300 italic tracking-normal">Launch recruitment to build your production team.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="p-10 space-y-8 m-0 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Elements: {activeViewPhase}</p>
                    <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Strategic Checklist</h3>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2 tracking-normal">
                        <Plus className="h-4 w-4" /> Define Objective
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[500px]">
                      <DialogHeader><DialogTitle className="font-headline tracking-normal">Define Mission Objective</DialogTitle></DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Objective Title</label>
                          <Input value={newObjective.name} onChange={(e) => setNewObjective({...newObjective, name: e.target.value})} className="rounded-xl h-12 tracking-normal" placeholder="e.g. Creative Brief Approval" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Due Date</label>
                            <Input 
                              type="date" 
                              value={newObjective.dueDate} 
                              onChange={(e) => setNewObjective({...newObjective, dueDate: e.target.value})} 
                              className="rounded-xl h-12 tracking-normal" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Assignee</label>
                            <Select 
                              value={newObjective.assignedTeamMemberId} 
                              onValueChange={(val) => setNewObjective({...newObjective, assignedTeamMemberId: val})}
                            >
                              <SelectTrigger className="rounded-xl h-12 border-slate-200 tracking-normal">
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {project.crew?.map((member: any) => (
                                  <SelectItem key={member.talentId} value={member.talentId} className="tracking-normal">
                                    {member.name}
                                  </SelectItem>
                                ))}
                                {(!project.crew || project.crew.length === 0) && (
                                  <SelectItem value="none" disabled className="tracking-normal">No crew recruited</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Description</label>
                          <Textarea value={newObjective.description} onChange={(e) => setNewObjective({...newObjective, description: e.target.value})} className="rounded-xl resize-none h-24 tracking-normal p-4" placeholder="Provide strategic context..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button onClick={handleAddObjective} className="bg-primary w-full h-12 rounded-xl font-bold tracking-normal text-white">Sync Objective</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {isTasksLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : currentPhaseTasks.length > 0 ? (
                    currentPhaseTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-50 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-6">
                          <Checkbox checked={task.status === "Completed"} onCheckedChange={() => handleToggleTask(task.id, task.status)} className="h-5 w-5 rounded-md border-slate-200" />
                          <div>
                            <p className={`font-bold text-lg tracking-normal ${task.status === "Completed" ? "line-through text-slate-300" : "text-slate-900"}`}>{task.name}</p>
                            <p className="text-xs text-slate-400 mt-1 tracking-normal">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {task.dueDate && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                                  <CalendarIcon className="h-3 w-3" /> {task.dueDate}
                                </span>
                              )}
                              {task.assignedTeamMemberId && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                                  <User className="h-3 w-3" /> {project.crew?.find((m: any) => m.talentId === task.assignedTeamMemberId)?.name || "Unassigned"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={`border-none font-bold text-[10px] uppercase px-3 py-1 rounded-lg tracking-normal ${task.status === 'Completed' ? 'bg-accent/10 text-accent' : 'bg-blue-50 text-blue-500'}`}>
                            {task.status === 'Completed' ? 'FINALIZED' : 'ACTIVE'}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-slate-200 hover:text-destructive transition-colors tracking-normal rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 border-2 border-dashed border-slate-50 rounded-[2rem] text-center space-y-2">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No active objectives for this phase</p>
                      <p className="text-xs text-slate-300 italic tracking-normal">Define mission goals to advance the project.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="p-10 space-y-8 m-0 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Support</p>
                    <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Mission Intelligence Logs</h3>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2 tracking-normal">
                        <Plus className="h-4 w-4" /> Log Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[500px]">
                      <DialogHeader><DialogTitle className="font-headline tracking-normal text-slate-900">Log Support Ticket</DialogTitle></DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Subject</label>
                          <Input value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} className="rounded-xl h-12 tracking-normal" placeholder="e.g. Color Grade Mismatch" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Category</label>
                            <Select value={newTicket.type} onValueChange={(val) => setNewTicket({...newTicket, type: val})}>
                              <SelectTrigger className="rounded-xl h-12 tracking-normal">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl">
                                <SelectItem value="Bug">Bug</SelectItem>
                                <SelectItem value="Feature Request">Feature</SelectItem>
                                <SelectItem value="Question">Question</SelectItem>
                                <SelectItem value="Change Request">Change Request</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Priority</label>
                            <Select value={newTicket.priority} onValueChange={(val) => setNewTicket({...newTicket, priority: val})}>
                              <SelectTrigger className="rounded-xl h-12 tracking-normal">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl">
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Assignee</label>
                          <Select 
                            value={newTicket.assignedToTeamMemberId} 
                            onValueChange={(val) => setNewTicket({...newTicket, assignedToTeamMemberId: val})}
                          >
                            <SelectTrigger className="rounded-xl h-12 tracking-normal">
                              <SelectValue placeholder="Identify member" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                              {project.crew?.map((member: any) => (
                                <SelectItem key={member.talentId} value={member.talentId} className="tracking-normal">
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Diagnostic Brief</label>
                          <Textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="rounded-xl resize-none h-24 tracking-normal p-4" placeholder="Describe the issue..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button onClick={handleAddTicket} className="bg-primary w-full h-12 rounded-xl font-bold tracking-normal text-white">Log Intelligence</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {isTicketsLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <Card key={ticket.id} className="border-none shadow-sm rounded-2xl bg-white border border-slate-50 overflow-hidden group hover:shadow-md transition-all">
                        <div className="p-6 flex items-start justify-between">
                          <div className="flex items-start gap-5">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                              ticket.priority === 'Critical' ? 'bg-red-50 text-red-500' :
                              ticket.priority === 'High' ? 'bg-orange-50 text-orange-500' :
                              'bg-slate-50 text-slate-400'
                            }`}>
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-lg text-slate-900 tracking-normal">{ticket.title}</h4>
                                <Badge variant="outline" className="text-[8px] font-bold uppercase rounded-md tracking-normal border-slate-100">
                                  {ticket.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl tracking-normal">{ticket.description}</p>
                              <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-slate-300" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                                    {project.crew?.find((m: any) => m.talentId === ticket.assignedToTeamMemberId)?.name || "Unassigned"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-slate-300" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                                    {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : "Pending"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <Select value={ticket.status} onValueChange={(val) => handleUpdateTicketStatus(ticket.id, val)}>
                              <SelectTrigger className="h-8 w-32 rounded-lg bg-slate-50 border-none font-bold text-[10px] uppercase tracking-normal shadow-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl">
                                <SelectItem value="Open" className="text-[10px] font-bold uppercase">Open</SelectItem>
                                <SelectItem value="In Progress" className="text-[10px] font-bold uppercase">In Progress</SelectItem>
                                <SelectItem value="Resolved" className="text-[10px] font-bold uppercase">Resolved</SelectItem>
                                <SelectItem value="Closed" className="text-[10px] font-bold uppercase">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-lg tracking-normal ${
                              ticket.status === 'Resolved' ? 'bg-accent/10 text-accent' :
                              ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-500' :
                              'bg-slate-100 text-slate-400'
                            }`}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="p-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center space-y-4 flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No active tickets</p>
                        <p className="text-xs text-slate-300 italic tracking-normal">Intelligence flow is currently nominal.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="p-10 m-0 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-300 space-y-4">
                  <Clock className="h-12 w-12 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-normal">No historical records found</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <CardHeader className="p-10 pb-4"><CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Financial Ledger</CardTitle></CardHeader>
            <CardContent className="p-10 pt-0 space-y-8 relative z-10">
              <div>
                <h2 className="text-4xl font-bold font-headline tracking-normal text-white">₹{(project.budget || 0).toLocaleString('en-IN')}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-normal">Deployment Limit</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-normal">
                  <span className="text-slate-500">Allocation</span>
                  <span className="text-primary">{progress[0]}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progress[0]}%` }} />
                </div>
              </div>
              <Button asChild className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase transition-colors border border-white/10 tracking-normal">
                <Link href="/invoices/new">Generate Billing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white p-8 space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Intelligence</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Hub</p>
                  <p className="text-xs font-bold text-slate-900 tracking-normal">{project.location || "Central Kerala"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                <div className="h-8 w-8 rounded-xl bg-accent/5 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Momentum</p>
                  <p className="text-xs font-bold text-slate-900 tracking-normal">{project.status === 'Released' ? 'Finalized' : 'Optimal'}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic tracking-normal pt-4 border-t border-slate-50">
              "Throughput is currently optimized for the {project.status} stage deliverables."
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
