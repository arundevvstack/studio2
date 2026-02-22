
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
  Tag,
  ShieldCheck,
  Briefcase,
  List,
  Play
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

const STAGES = ["Lead", "Discussion", "Pre Production", "In Progress", "Post Production", "Released"];

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [progress, setProgress] = useState([0]);
  
  // Crew Management State
  const [crewSearch, setCrewSearch] = useState("");
  const [crewTypeFilter, setCrewTypeFilter] = useState("all");
  const [crewViewMode, setCrewViewMode] = useState<"tile" | "list">("tile");
  const [teamFilter, setTeamFilter] = useState<"all" | "current">("all");
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

  // Internal Team Data
  const staffQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"));
  }, [db, user]);
  const { data: staffMembers, isLoading: isStaffLoading } = useCollection(staffQuery);

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

  // --- Recruitment Logic ---
  const suggestions = useMemo(() => {
    if (!shootNetwork || !project) return [];
    
    return shootNetwork.map(talent => {
      let score = 0;
      if (project.location && talent.district === project.location) score += 5;
      score += (talent.rank || 0);
      if (project.tags && talent.suitableProjectTypes) {
        const matchCount = project.tags.filter((t: string) => talent.suitableProjectTypes.includes(t)).length;
        score += matchCount * 2;
      }
      return { ...talent, score, type: 'External' };
    })
    .filter(t => !project.crew?.some((c: any) => c.talentId === t.id))
    .filter(t => t.name?.toLowerCase().includes(recruitSearch.toLowerCase()) || t.category?.toLowerCase().includes(recruitSearch.toLowerCase()))
    .sort((a, b) => b.score - a.score);
  }, [shootNetwork, project, recruitSearch]);

  const staffSuggestions = useMemo(() => {
    if (!staffMembers || !project) return [];
    return staffMembers.map(staff => ({
      ...staff,
      name: `${staff.firstName} ${staff.lastName}`,
      category: staff.roleId,
      type: 'Internal'
    }))
    .filter(s => !project.crew?.some((c: any) => c.talentId === s.id))
    .filter(s => s.name?.toLowerCase().includes(recruitSearch.toLowerCase()) || s.category?.toLowerCase().includes(recruitSearch.toLowerCase()));
  }, [staffMembers, project, recruitSearch]);

  const handleRecruit = (member: any) => {
    if (!projectRef || !project) return;
    const newCrew = [...(project.crew || []), {
      talentId: member.id,
      name: member.name,
      category: member.category,
      thumbnail: member.thumbnail || `https://picsum.photos/seed/${member.id}/100/100`,
      role: member.type === 'Internal' ? "Staff" : "Contractor",
      stage: project.status || "All Phases",
      type: member.type
    }];
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ title: "Member Provisioned", description: `${member.name} assigned to ${project.status} phase.` });
  };

  const handleUpdateMemberStage = (talentId: string, newStage: string) => {
    if (!projectRef || !project) return;
    const newCrew = (project.crew || []).map((c: any) => 
      c.talentId === talentId ? { ...c, stage: newStage } : c
    );
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ title: "Stage Reassigned", description: `Deployment phase updated to ${newStage}.` });
  };

  const handleRemoveRecruit = (talentId: string) => {
    if (!projectRef || !project) return;
    const newCrew = (project.crew || []).filter((c: any) => c.talentId !== talentId);
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ variant: "destructive", title: "Member De-provisioned", description: "Crew member removed from project." });
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
    toast({ title: "Lifecycle Advanced", description: `Project moved to ${val}.` });
  };

  const handleTransition = () => {
    const nextPhase = NEXT_PHASE_MAP[project?.status || "Lead"];
    if (!nextPhase || !projectRef) return;
    updateDocumentNonBlocking(projectRef, {
      status: nextPhase,
      progress: STATUS_PROGRESS_MAP[nextPhase] || 0,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Phase Transitioned", description: `Project advanced to ${nextPhase}.` });
  };

  const handleAddObjective = () => {
    if (!newObjective.name) return;
    const tasksRef = collection(db, "projects", projectId, "tasks");
    addDocumentNonBlocking(tasksRef, {
      ...newObjective,
      status: "Active",
      phase: activeViewPhase,
      projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setNewObjective({ name: "", description: "", dueDate: "", assignedTeamMemberId: "" });
    toast({ title: "Objective Synced", description: "Goal added to production checklist." });
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
    setNewTicket({ title: "", description: "", priority: "Medium", type: "Bug", assignedToTeamMemberId: "" });
    toast({ title: "Issue Logged", description: "Support ticket recorded." });
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const taskRef = doc(db, "projects", projectId, "tasks", taskId);
    updateDocumentNonBlocking(taskRef, {
      status: currentStatus === "Completed" ? "Active" : "Completed",
      updatedAt: serverTimestamp()
    });
  };

  const handleDeleteProject = () => {
    if (!projectRef) return;
    deleteDocumentNonBlocking(projectRef);
    toast({ variant: "destructive", title: "Project Purged", description: "Entity removed from engine." });
    router.push("/projects");
  };

  const filteredCrew = useMemo(() => {
    if (!project?.crew) return [];
    return project.crew.filter((member: any) => {
      const matchesSearch = member.name?.toLowerCase().includes(crewSearch.toLowerCase()) || 
                           member.category?.toLowerCase().includes(crewSearch.toLowerCase());
      const matchesType = crewTypeFilter === "all" || member.type === crewTypeFilter;
      const matchesStage = teamFilter === "all" || 
                          (teamFilter === "current" && (member.stage === project.status || member.stage === "All Phases"));
      return matchesSearch && matchesType && matchesStage;
    });
  }, [project, crewSearch, crewTypeFilter, teamFilter]);

  if (isUserLoading || isProjectLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Identifying Project Strategy...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0" onClick={() => router.push("/projects")}>
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">{project.name}</h1>
              <Badge className="bg-primary/5 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                #{projectId.substring(0, 8).toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-500 tracking-normal">
              <span className="flex items-center gap-2"><Target className="h-4 w-4" />{project.status}</span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{project.location || "Kerala Hub"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 tracking-normal">
                <Settings2 className="h-4 w-4" />
                Configure Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0"><DialogTitle className="text-2xl font-bold font-headline tracking-normal">Configure Production Entity</DialogTitle></DialogHeader>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Title</label>
                    <Input value={editData?.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 tracking-normal" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Phase</label>
                    <Select value={editData?.status} onValueChange={(val) => setEditData({...editData, status: val})}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 tracking-normal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Hub</label>
                    <Select value={editData?.location} onValueChange={(val) => setEditData({...editData, location: val})}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">{KERALA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Asset Value (INR)</label>
                    <Input type="number" value={editData?.budget} onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})} className="rounded-xl bg-slate-50 border-none h-12 tracking-normal" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Mission Brief</label>
                  <Textarea value={editData?.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="rounded-xl bg-slate-50 border-none min-h-[120px] resize-none tracking-normal p-4" />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center">
                <DialogClose asChild><Button variant="ghost" onClick={handleDeleteProject} className="text-destructive font-bold text-xs uppercase gap-2 tracking-normal hover:bg-destructive/5"><Trash2 className="h-4 w-4" /> Purge Entity</Button></DialogClose>
                <div className="flex gap-3">
                  <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal">Cancel</Button></DialogClose>
                  <DialogClose asChild><Button onClick={handleUpdateProject} disabled={!isDirty} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6 h-11 gap-2 tracking-normal">Sync Intelligence</Button></DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleUpdateProject} disabled={!isDirty} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 tracking-normal">
            {isDirty ? "Deploy Changes" : "Synchronized"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          {/* Analysis Block */}
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-10">
            <div className="flex flex-row items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Throughput Analysis</p>
                <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Production Lifecycle</h3>
              </div>
              {canTransition && NEXT_PHASE_MAP[project.status] && (
                <Button onClick={handleTransition} className="h-10 px-6 rounded-xl bg-accent text-white font-bold text-[10px] gap-2 hover:bg-accent/90 transition-all tracking-normal uppercase shadow-lg shadow-accent/20">
                  Advance to {NEXT_PHASE_MAP[project.status]} <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Current Stage</label>
                <Select value={project.status || "Lead"} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 w-full bg-transparent border-none p-0 font-bold font-headline text-xl shadow-none focus:ring-0 tracking-normal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {STAGES.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Resources</label>
                <p className="text-xl font-bold font-headline text-slate-900 tracking-normal">{project.crew?.length || 0} Entities</p>
              </div>
              <div className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Capital Allocation</label>
                <p className="text-xl font-bold font-headline tracking-normal text-slate-900">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Deployment Progress</span>
                <span className="text-3xl font-bold font-headline text-primary tracking-normal">{progress[0]}%</span>
              </div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="[&_.bg-primary]:bg-primary" />
            </div>
          </Card>

          {/* Team Block */}
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Production Crew & Resources</p>
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold font-headline tracking-normal">Project Team</h3>
                  <div className="flex items-center bg-slate-50 p-1 rounded-xl shadow-sm border border-slate-100">
                    <Button 
                      variant={crewViewMode === 'tile' ? 'secondary' : 'ghost'} 
                      size="icon" 
                      onClick={() => setCrewViewMode('tile')}
                      className={`h-8 w-8 rounded-lg transition-all ${crewViewMode === 'tile' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={crewViewMode === 'list' ? 'secondary' : 'ghost'} 
                      size="icon" 
                      onClick={() => setCrewViewMode('list')}
                      className={`h-8 w-8 rounded-lg transition-all ${crewViewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase gap-2 tracking-normal shadow-lg shadow-primary/20">
                      <Plus className="h-4 w-4" /> Provision Member
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-[550px] rounded-l-[3rem] p-0 border-none shadow-2xl flex flex-col bg-slate-50">
                    <SheetHeader className="p-10 pb-6 bg-white border-b border-slate-100">
                      <SheetTitle className="text-2xl font-bold font-headline tracking-normal">Deploy Production Resource</SheetTitle>
                      <p className="text-sm text-slate-500 font-medium tracking-normal mt-1">Assign verified partners or internal staff to specific project stages.</p>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <div className="p-10 pb-0 space-y-6">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input value={recruitSearch} onChange={(e) => setRecruitSearch(e.target.value)} placeholder="Identify expertise or identity..." className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm font-bold tracking-normal text-sm" />
                        </div>
                      </div>

                      <Tabs defaultValue="network" className="flex-1 flex flex-col mt-6 overflow-hidden">
                        <TabsList className="mx-10 bg-slate-100/50 p-1 h-auto rounded-xl gap-1 shrink-0">
                          <TabsTrigger value="network" className="flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-normal">Talent Network</TabsTrigger>
                          <TabsTrigger value="staff" className="flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-normal">Internal Staff</TabsTrigger>
                        </TabsList>

                        <TabsContent value="network" className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-6 space-y-4 m-0">
                          {isTalentLoading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                          ) : suggestions.length > 0 ? (
                            suggestions.map((talent) => (
                              <Card key={talent.id} className="border-none shadow-sm rounded-2xl bg-white p-5 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 rounded-xl shadow-sm border-2 border-slate-50">
                                      <AvatarImage src={talent.thumbnail} />
                                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{talent.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-bold text-sm text-slate-900 tracking-normal">{talent.name}</p>
                                      <p className="text-[9px] font-bold text-primary uppercase tracking-normal">{talent.category}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-[9px] font-bold text-slate-500">{talent.rank || 5}.0</span>
                                        <span className="text-slate-200 text-[10px]">•</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">{talent.district}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button onClick={() => handleRecruit(talent)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </Card>
                            ))
                          ) : (
                            <div className="py-20 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-normal">No talent matching criteria</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="staff" className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-6 space-y-4 m-0">
                          {isStaffLoading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                          ) : staffSuggestions.length > 0 ? (
                            staffSuggestions.map((staff) => (
                              <Card key={staff.id} className="border-none shadow-sm rounded-2xl bg-white p-5 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 rounded-xl shadow-sm border-2 border-slate-50">
                                      <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">{staff.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-bold text-sm text-slate-900 tracking-normal">{staff.name}</p>
                                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-normal">{staff.roleId}</p>
                                      <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-bold uppercase mt-1 px-2 tracking-normal">Internal</Badge>
                                    </div>
                                  </div>
                                  <Button onClick={() => handleRecruit(staff)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-blue-500 hover:text-white transition-all">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </Card>
                            ))
                          ) : (
                            <div className="py-20 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-normal">All staff members provisioned</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Team Block Toolbar: Search + Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  value={crewSearch}
                  onChange={(e) => setCrewSearch(e.target.value)}
                  placeholder="Search crew by name or role..." 
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal text-sm" 
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Select value={crewTypeFilter} onValueChange={setCrewTypeFilter}>
                  <SelectTrigger className="h-12 w-[140px] rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-normal">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all" className="text-[10px] font-bold uppercase">All Types</SelectItem>
                    <SelectItem value="Internal" className="text-[10px] font-bold uppercase">Internal</SelectItem>
                    <SelectItem value="External" className="text-[10px] font-bold uppercase">External</SelectItem>
                  </SelectContent>
                </Select>
                
                <Tabs value={teamFilter} onValueChange={(v: any) => setTeamFilter(v)} className="bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
                  <TabsList className="bg-transparent h-10 gap-1 p-0">
                    <TabsTrigger value="all" className="text-[10px] font-bold uppercase px-4 rounded-lg tracking-normal data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Global</TabsTrigger>
                    <TabsTrigger value="current" className="text-[10px] font-bold uppercase px-4 rounded-lg tracking-normal data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Phase</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Crew Display Area */}
            {crewViewMode === 'tile' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCrew.length > 0 ? (
                  filteredCrew.map((member: any) => (
                    <Card key={member.talentId} className="border-none shadow-sm rounded-3xl bg-white p-6 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-slate-50 overflow-hidden">
                      <Button onClick={() => handleRemoveRecruit(member.talentId)} variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-lg text-slate-200 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all">
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-20 w-20 rounded-[1.5rem] shadow-lg border-4 border-slate-50 group-hover:scale-105 transition-transform duration-500">
                          <AvatarImage src={member.thumbnail} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">{member.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg text-slate-900 tracking-normal leading-tight">{member.name}</h4>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-normal">{member.category}</p>
                            {member.type === 'Internal' && <ShieldCheck className="h-3 w-3 text-blue-500" />}
                          </div>
                        </div>
                        
                        <div className="w-full space-y-2 pt-2 border-t border-slate-50">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-normal">Assigned Phase</p>
                          <Select value={member.stage || "All Phases"} onValueChange={(val) => handleUpdateMemberStage(member.talentId, val)}>
                            <SelectTrigger className="h-8 w-full border-none bg-slate-50/50 rounded-xl text-[9px] font-bold uppercase tracking-normal hover:bg-slate-100 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                              <SelectItem value="All Phases" className="text-[10px] font-bold uppercase tracking-normal">All Phases</SelectItem>
                              {STAGES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-normal">{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 w-full pt-2">
                          <Button asChild variant="outline" className="flex-1 h-9 rounded-xl border-slate-100 font-bold text-[9px] uppercase tracking-normal hover:bg-slate-900 hover:text-white transition-all">
                            <Link href={member.type === 'Internal' ? `/team` : `/shoot-network/${member.talentId}`}>Profile</Link>
                          </Button>
                          <Button variant="outline" className="flex-1 h-9 rounded-xl border-slate-100 font-bold text-[9px] uppercase tracking-normal hover:bg-slate-900 hover:text-white transition-all">Chat</Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-24 border-2 border-dashed border-slate-50 rounded-[3rem] text-center flex flex-col items-center justify-center space-y-6 bg-slate-50/20">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white flex items-center justify-center shadow-sm"><Users className="h-8 w-8 text-slate-200" /></div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No crew matching filters</p>
                      <p className="text-xs text-slate-300 italic tracking-normal">Adjust search or deploy a new resource.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal">Crew Identity</th>
                        <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal">Role / Category</th>
                        <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal">Resource Type</th>
                        <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal">Lifecycle Phase</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredCrew.length > 0 ? (
                        filteredCrew.map((member: any) => (
                          <tr key={member.talentId} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm rounded-xl shrink-0">
                                  <AvatarImage src={member.thumbnail} />
                                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{member.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-sm text-slate-900 tracking-normal leading-none">{member.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-normal">ID: {member.talentId.substring(0, 6).toUpperCase()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase px-3 tracking-normal">
                                {member.category}
                              </Badge>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                {member.type === 'Internal' ? (
                                  <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-bold uppercase px-3 tracking-normal flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Internal
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-50 text-orange-600 border-none text-[9px] font-bold uppercase px-3 tracking-normal">
                                    External
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <Select value={member.stage || "All Phases"} onValueChange={(val) => handleUpdateMemberStage(member.talentId, val)}>
                                <SelectTrigger className="h-9 w-[160px] border-none bg-slate-50/50 rounded-xl text-[9px] font-bold uppercase tracking-normal hover:bg-slate-100 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl">
                                  <SelectItem value="All Phases" className="text-[10px] font-bold uppercase tracking-normal">All Phases</SelectItem>
                                  {STAGES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-normal">{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all">
                                  <Link href={member.type === 'Internal' ? `/team` : `/shoot-network/${member.talentId}`}>
                                    <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button onClick={() => handleRemoveRecruit(member.talentId)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-destructive hover:text-white transition-all">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-24 text-center">
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <Users className="h-10 w-10 text-slate-200" />
                              <p className="text-xs font-bold text-slate-300 uppercase tracking-normal">No crew matching filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Activity Hub */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
            <Tabs defaultValue="objectives" className="w-full">
              <TabsList className="h-auto bg-transparent px-10 pt-6 gap-8 border-b rounded-none p-0 overflow-x-auto custom-scrollbar">
                <TabsTrigger value="objectives" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal"><LayoutGrid className="h-3.5 w-3.5" /> Stage Objectives</TabsTrigger>
                <TabsTrigger value="tickets" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal"><TicketIcon className="h-3.5 w-3.5" /> Support Records</TabsTrigger>
                <TabsTrigger value="history" className="bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-[10px] font-bold uppercase gap-2 tracking-normal"><History className="h-3.5 w-3.5" /> Event Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="objectives" className="p-10 space-y-8 m-0 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{activeViewPhase} Checklist</p>
                    <h3 className="text-xl font-bold font-headline tracking-normal">Target Deliverables</h3>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2 tracking-normal"><Plus className="h-4 w-4" /> New Objective</Button></DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[500px]">
                      <DialogHeader><DialogTitle className="font-headline tracking-normal">Define Phase Goal</DialogTitle></DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Title</label>
                          <Input value={newObjective.name} onChange={(e) => setNewObjective({...newObjective, name: e.target.value})} className="rounded-xl h-12 tracking-normal" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Deadline</label>
                            <Input type="date" value={newObjective.dueDate} onChange={(e) => setNewObjective({...newObjective, dueDate: e.target.value})} className="rounded-xl h-12 tracking-normal" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Assignee</label>
                            <Select value={newObjective.assignedTeamMemberId} onValueChange={(val) => setNewObjective({...newObjective, assignedTeamMemberId: val})}>
                              <SelectTrigger className="rounded-xl h-12 border-slate-200 tracking-normal"><SelectValue placeholder="Identify..." /></SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl">{project.crew?.map((m: any) => <SelectItem key={m.talentId} value={m.talentId}>{m.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Execution Context</label>
                          <Textarea value={newObjective.description} onChange={(e) => setNewObjective({...newObjective, description: e.target.value})} className="rounded-xl resize-none h-24 tracking-normal p-4" />
                        </div>
                      </div>
                      <DialogFooter><DialogClose asChild><Button onClick={handleAddObjective} className="bg-primary w-full h-12 rounded-xl font-bold tracking-normal text-white">Sync Strategy</Button></DialogClose></DialogFooter>
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
                            <div className="flex items-center gap-4 mt-2">
                              {task.dueDate && <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-normal"><CalendarIcon className="h-3 w-3" /> {task.dueDate}</span>}
                              {task.assignedTeamMemberId && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                                  <User className="h-3 w-3" /> {project.crew?.find((m: any) => m.talentId === task.assignedTeamMemberId)?.name || "Unassigned"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "projects", projectId, "tasks", task.id))} className="text-slate-200 hover:text-destructive rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 border-2 border-dashed border-slate-50 rounded-[2rem] text-center bg-slate-50/20">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-normal">Mission Intelligence: No active goals for {project.status}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="p-10 space-y-8 m-0 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Risk Intelligence</p>
                    <h3 className="text-xl font-bold font-headline tracking-normal">Support Tickets</h3>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2 tracking-normal"><Plus className="h-4 w-4" /> Log Request</Button></DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[500px]">
                      <DialogHeader><DialogTitle className="font-headline tracking-normal text-slate-900">Issue Diagnosis</DialogTitle></DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Subject</label>
                          <Input value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} className="rounded-xl h-12 tracking-normal" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Category</label>
                            <Select value={newTicket.type} onValueChange={(val) => setNewTicket({...newTicket, type: val})}>
                              <SelectTrigger className="rounded-xl h-12 tracking-normal"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl"><SelectItem value="Bug">Bug</SelectItem><SelectItem value="Feature">Feature</SelectItem><SelectItem value="CR">Change</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Urgency</label>
                            <Select value={newTicket.priority} onValueChange={(val) => setNewTicket({...newTicket, priority: val})}>
                              <SelectTrigger className="rounded-xl h-12 tracking-normal"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl shadow-xl"><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Brief</label>
                          <Textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="rounded-xl resize-none h-24 tracking-normal p-4" />
                        </div>
                      </div>
                      <DialogFooter><DialogClose asChild><Button onClick={handleAddTicket} className="bg-primary w-full h-12 rounded-xl font-bold tracking-normal text-white">Log Event</Button></DialogClose></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {isTicketsLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <Card key={ticket.id} className="border-none shadow-sm rounded-2xl bg-white border border-slate-50 p-6 flex items-start justify-between group hover:shadow-md transition-all">
                        <div className="flex items-start gap-5">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ticket.priority === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}><AlertCircle className="h-5 w-5" /></div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg text-slate-900 tracking-normal">{ticket.title}</h4>
                              <Badge variant="outline" className="text-[8px] font-bold uppercase rounded-md tracking-normal border-slate-100">{ticket.type}</Badge>
                            </div>
                            <div className="flex items-center gap-6 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                              <span className="flex items-center gap-2"><User className="h-3 w-3" /> {project.crew?.find((m: any) => m.talentId === ticket.assignedToTeamMemberId)?.name || "Unassigned"}</span>
                              <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {ticket.status}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-lg tracking-normal ${ticket.status === 'Resolved' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-400'}`}>{ticket.status}</Badge>
                      </Card>
                    ))
                  ) : (
                    <div className="p-20 text-center text-slate-300 font-bold text-[10px] uppercase tracking-normal">Intelligence flow nominal: No active issues.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="p-10 m-0 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-300 space-y-4">
                  <Clock className="h-12 w-12 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-normal">No historical records in archive.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Financial Threshold</p>
              <h2 className="text-4xl font-bold font-headline mt-2 tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</h2>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                <span className="text-slate-500">Utilization</span>
                <span className="text-primary">{progress[0]}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${progress[0]}%` }} />
              </div>
            </div>
            <Button asChild className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase border border-white/10 tracking-normal relative z-10">
              <Link href="/invoices/new">Issue Invoice</Link>
            </Button>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Intelligence</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center"><MapPin className="h-4 w-4 text-primary" /></div>
                <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Hub</p><p className="text-xs font-bold text-slate-900 tracking-normal">{project.location || "Kerala Central"}</p></div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="h-8 w-8 rounded-xl bg-accent/5 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-accent" /></div>
                <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Momentum</p><p className="text-xs font-bold text-slate-900 tracking-normal">Optimized</p></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium italic tracking-normal pt-4 border-t border-slate-50 leading-relaxed">"Strategic focus maintained on {project.status} phase targets."</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
