
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
  Play,
  Sparkles,
  Rocket,
  Camera,
  Scissors,
  Share2
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, serverTimestamp, orderBy, where } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  "Discussion", 
  "Pre Production", 
  "Production", 
  "Post Production", 
  "Release", 
  "Social Media"
];

const STATUS_PROGRESS_MAP: Record<string, number> = {
  "Discussion": 10,
  "Pre Production": 30,
  "Production": 50,
  "Post Production": 75,
  "Release": 90,
  "Social Media": 100,
};

const NEXT_PHASE_MAP: Record<string, string | null> = {
  "Discussion": "Pre Production",
  "Pre Production": "Production",
  "Production": "Post Production",
  "Post Production": "Release",
  "Release": "Social Media",
  "Social Media": null
};

const SOCIAL_MEDIA_SUGGESTIONS = [
  {
    title: "Viral BTS Loop",
    strategy: "Create a 15-second high-energy edit showing the 'behind-the-scenes' chaos versus the final polished shot.",
    platform: "Instagram Reels / TikTok",
    impact: "High Reach"
  },
  {
    title: "Talent Reveal",
    strategy: "Highlight key talent profile with a 'Get to Know' carousel or quick interview snippet.",
    platform: "Instagram / Facebook",
    impact: "High Engagement"
  },
  {
    title: "The Countdown",
    strategy: "Story series with countdown stickers and daily 'sneak peek' frames to build anticipation.",
    platform: "Instagram Stories",
    impact: "Medium Conversion"
  }
];

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [progress, setProgress] = useState([0]);
  
  // UI State
  const [crewSearch, setCrewSearch] = useState("");
  const [crewTypeFilter, setCrewTypeFilter] = useState("all");
  const [crewViewMode, setCrewViewMode] = useState<"tile" | "list">("tile");
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
    assignedMemberId: "" 
  });

  useEffect(() => {
    if (project) {
      setEditData({
        name: project.name || "",
        status: project.status || "Discussion",
        budget: project.budget || 0,
        description: project.description || "",
        location: project.location || "",
      });
      if (typeof project.progress === 'number') {
        setProgress([project.progress]);
      } else {
        const initialProgress = STATUS_PROGRESS_MAP[project.status] || 0;
        setProgress([initialProgress]);
      }
    }
  }, [project]);

  const activePhase = project?.status || "Discussion";

  const phaseTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter(t => t.phase === activePhase);
  }, [allTasks, activePhase]);

  const suggestions = useMemo(() => {
    if (!shootNetwork || !project) return [];
    return shootNetwork.filter(t => !project.crew?.some((c: any) => c.talentId === t.id))
      .filter(t => t.name?.toLowerCase().includes(recruitSearch.toLowerCase()) || t.category?.toLowerCase().includes(recruitSearch.toLowerCase()));
  }, [shootNetwork, project, recruitSearch]);

  const staffSuggestions = useMemo(() => {
    if (!staffMembers || !project) return [];
    return staffMembers.filter(s => !project.crew?.some((c: any) => c.talentId === s.id))
      .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(recruitSearch.toLowerCase()));
  }, [staffMembers, project, recruitSearch]);

  const handleRecruit = (member: any, type: 'Internal' | 'External') => {
    if (!projectRef || !project) return;
    const name = type === 'Internal' ? `${member.firstName} ${member.lastName}` : member.name;
    const newCrew = [...(project.crew || []), {
      talentId: member.id,
      name,
      category: member.category || member.roleId,
      thumbnail: member.thumbnail || `https://picsum.photos/seed/${member.id}/100/100`,
      type,
      stage: project.status || "Discussion"
    }];
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ title: "Resource Provisioned", description: `${name} assigned to project.` });
  };

  const handleRemoveCrew = (talentId: string) => {
    if (!projectRef || !project) return;
    const newCrew = (project.crew || []).filter((c: any) => c.talentId !== talentId);
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ variant: "destructive", title: "Resource Removed", description: "Crew member de-provisioned." });
  };

  const handleUpdateProject = () => {
    if (!editData?.name || !projectRef) return;
    updateDocumentNonBlocking(projectRef, {
      ...editData,
      progress: progress[0],
      updatedAt: serverTimestamp()
    });
    toast({ title: "Intelligence Synced", description: "Project parameters updated." });
  };

  const handleStatusChange = (val: string) => {
    if (!projectRef) return;
    updateDocumentNonBlocking(projectRef, {
      status: val,
      progress: STATUS_PROGRESS_MAP[val] || 0,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Phase Shifted", description: `Lifecycle advanced to ${val}.` });
  };

  const handleAddObjective = () => {
    if (!newObjective.name) return;
    const tasksRef = collection(db, "projects", projectId, "tasks");
    addDocumentNonBlocking(tasksRef, {
      ...newObjective,
      status: "Active",
      phase: activePhase,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setNewObjective({ name: "", description: "", dueDate: "", assignedMemberId: "" });
    toast({ title: "Objective Logged", description: "Goal added to phase checklist." });
  };

  if (isUserLoading || isProjectLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Authorizing Executive Access...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm" onClick={() => router.push("/projects")}>
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">{project.name}</h1>
              <Badge className="bg-primary/5 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                {project.status}
              </Badge>
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-normal flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {project.location || "Kerala Hub"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 tracking-normal">
                <Settings2 className="h-4 w-4" />
                Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0"><DialogTitle className="text-2xl font-bold font-headline tracking-normal">Project Context</DialogTitle></DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Identity</Label>
                  <Input value={editData?.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Asset Value</Label>
                    <Input type="number" value={editData?.budget} onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})} className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lifecycle</Label>
                    <Select value={editData?.status} onValueChange={(val) => setEditData({...editData, status: val})}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Briefing</Label>
                  <Textarea value={editData?.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="rounded-xl bg-slate-50 border-none min-h-[120px] resize-none p-4" />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between">
                <DialogClose asChild><Button variant="ghost" onClick={() => deleteDocumentNonBlocking(projectRef!)} className="text-destructive font-bold text-xs uppercase tracking-normal hover:bg-destructive/5"><Trash2 className="h-4 w-4 mr-2" /> Purge</Button></DialogClose>
                <DialogClose asChild><Button onClick={handleUpdateProject} className="bg-primary text-white rounded-xl px-8 h-11 font-bold tracking-normal">Sync Changes</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleUpdateProject} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 tracking-normal">
            Save Strategy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          {/* Executive Phase Manager */}
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-10">
            <div className="flex flex-row items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lifecycle Performance</p>
                <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Production Management</h3>
              </div>
              {NEXT_PHASE_MAP[project.status] && (
                <Button onClick={() => handleStatusChange(NEXT_PHASE_MAP[project.status]!)} className="h-10 px-6 rounded-xl bg-accent text-white font-bold text-[10px] gap-2 tracking-normal uppercase shadow-lg shadow-accent/20">
                  Advance to {NEXT_PHASE_MAP[project.status]} <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Phase</label>
                <Select value={project.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 w-full bg-transparent border-none p-0 font-bold font-headline text-xl shadow-none focus:ring-0 tracking-normal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {STAGES.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Phase Velocity</label>
                <p className="text-xl font-bold font-headline text-slate-900 tracking-normal">{phaseTasks.filter(t => t.status === 'Completed').length} / {phaseTasks.length} Done</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Asset Value</label>
                <p className="text-xl font-bold font-headline tracking-normal text-slate-900">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Saturation</span>
                <span className="text-3xl font-bold font-headline text-primary tracking-normal">{progress[0]}%</span>
              </div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="[&_.bg-primary]:bg-primary" />
            </div>
          </Card>

          {/* Social Media Intelligence Block */}
          {project.status === 'Social Media' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">Social Intelligence Hub</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic content deployment suggestions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SOCIAL_MEDIA_SUGGESTIONS.map((s, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 group hover:shadow-xl transition-all border border-slate-50">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          <Share2 className="h-5 w-5 text-primary" />
                        </div>
                        <Badge className="bg-slate-50 text-slate-500 border-none text-[8px] font-bold uppercase px-2 tracking-normal">{s.impact}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-slate-900 tracking-normal">{s.title}</h4>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed tracking-normal">{s.strategy}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{s.platform}</span>
                        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase gap-2 hover:bg-primary hover:text-white transition-all">
                          Draft <Sparkles className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Activity Workspaces */}
          <Tabs defaultValue="objectives" className="w-full">
            <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-[2rem] shadow-sm gap-1 mb-8">
              <TabsTrigger value="objectives" className="rounded-xl px-10 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
                <List className="h-4 w-4" /> Stage Checklist
              </TabsTrigger>
              <TabsTrigger value="crew" className="rounded-xl px-10 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
                <Users className="h-4 w-4" /> Production Crew
              </TabsTrigger>
              <TabsTrigger value="brief" className="rounded-xl px-10 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
                <Briefcase className="h-4 w-4" /> Strategic Brief
              </TabsTrigger>
            </TabsList>

            <TabsContent value="objectives" className="space-y-6 m-0 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline tracking-normal">{activePhase} Objectives</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-primary font-bold text-[10px] uppercase gap-2 tracking-normal hover:bg-primary/5 rounded-xl px-4">
                      <Plus className="h-4 w-4" /> New Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem]">
                    <DialogHeader><DialogTitle className="font-headline tracking-normal">Define Phase Milestone</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Objective Title</Label>
                        <Input value={newObjective.name} onChange={(e) => setNewObjective({...newObjective, name: e.target.value})} className="rounded-xl h-12" placeholder="e.g. Talent Booking Completed" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Target Date</Label>
                          <Input type="date" value={newObjective.dueDate} onChange={(e) => setNewObjective({...newObjective, dueDate: e.target.value})} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Primary Assignee</Label>
                          <Select value={newObjective.assignedMemberId} onValueChange={(val) => setNewObjective({...newObjective, assignedMemberId: val})}>
                            <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Identify..." /></SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">{project.crew?.map((m: any) => <SelectItem key={m.talentId} value={m.talentId}>{m.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button onClick={handleAddObjective} className="bg-primary text-white w-full h-12 rounded-xl font-bold tracking-normal">Deploy Goal</Button></DialogClose></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {isTasksLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : phaseTasks.length > 0 ? (
                  phaseTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-8 bg-white rounded-[2rem] border border-slate-50 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-8">
                        <Checkbox checked={task.status === "Completed"} onCheckedChange={() => updateDocumentNonBlocking(doc(db, "projects", projectId, "tasks", task.id), { status: task.status === 'Completed' ? 'Active' : 'Completed' })} className="h-6 w-6 rounded-lg border-slate-200" />
                        <div>
                          <p className={`text-xl font-bold tracking-normal ${task.status === "Completed" ? "line-through text-slate-300" : "text-slate-900"}`}>{task.name}</p>
                          <div className="flex items-center gap-6 mt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2"><CalendarIcon className="h-3 w-3" /> {task.dueDate || "TBD"}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2"><User className="h-3 w-3" /> {project.crew?.find((m: any) => m.talentId === task.assignedMemberId)?.name || "Not Assigned"}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "projects", projectId, "tasks", task.id))} className="text-slate-200 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))
                ) : (
                  <div className="p-32 border-2 border-dashed border-slate-50 rounded-[3rem] text-center bg-slate-50/20">
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-normal">No objectives defined for {activePhase}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="crew" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-headline tracking-normal">Production Crew</h3>
                  <p className="text-xs font-medium text-slate-500 tracking-normal">Assigned internal staff and external partners.</p>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase gap-2 tracking-normal shadow-lg shadow-primary/20">
                      <Plus className="h-4 w-4" /> Provision Resource
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-[500px] rounded-l-[3rem] p-0 border-none shadow-2xl flex flex-col bg-slate-50">
                    <div className="p-10 bg-white border-b border-slate-100">
                      <SheetTitle className="text-2xl font-bold font-headline tracking-normal">Deploy Team Member</SheetTitle>
                      <div className="relative mt-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input value={recruitSearch} onChange={(e) => setRecruitSearch(e.target.value)} placeholder="Identify expertise or identity..." className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-10 pt-6 space-y-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal px-2">Internal Experts</p>
                        {staffSuggestions.map((staff) => (
                          <Card key={staff.id} className="border-none shadow-sm rounded-2xl bg-white p-5 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 rounded-xl border-2 border-slate-50 shadow-sm">
                                  <AvatarImage src={staff.thumbnail} />
                                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{staff.firstName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-sm text-slate-900 tracking-normal">{staff.firstName} {staff.lastName}</p>
                                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-normal">{staff.roleId}</p>
                                </div>
                              </div>
                              <Button onClick={() => handleRecruit(staff, 'Internal')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-blue-500 hover:text-white transition-all"><Plus className="h-4 w-4" /></Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal px-2">Talent Network Partners</p>
                        {suggestions.map((talent) => (
                          <Card key={talent.id} className="border-none shadow-sm rounded-2xl bg-white p-5 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 rounded-xl border-2 border-slate-50 shadow-sm">
                                  <AvatarImage src={talent.thumbnail} />
                                  <AvatarFallback className="bg-primary/5 text-primary font-bold">{talent.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-sm text-slate-900 tracking-normal">{talent.name}</p>
                                  <p className="text-[9px] font-bold text-primary uppercase tracking-normal">{talent.category}</p>
                                </div>
                              </div>
                              <Button onClick={() => handleRecruit(talent, 'External')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all"><Plus className="h-4 w-4" /></Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(project.crew || []).map((member: any) => (
                  <Card key={member.talentId} className="border-none shadow-sm rounded-[2rem] bg-white p-8 relative group hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-50">
                    <Button onClick={() => handleRemoveCrew(member.talentId)} variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-lg text-slate-200 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-24 w-24 rounded-3xl shadow-xl border-4 border-slate-50 group-hover:scale-105 transition-transform duration-500">
                        <AvatarImage src={member.thumbnail} />
                        <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">{member.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-lg text-slate-900 tracking-normal leading-tight">{member.name}</h4>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <p className={`text-[10px] font-bold uppercase tracking-normal ${member.type === 'Internal' ? 'text-blue-500' : 'text-primary'}`}>{member.category}</p>
                          {member.type === 'Internal' && <ShieldCheck className="h-3 w-3 text-blue-500" />}
                        </div>
                      </div>
                      <div className="w-full pt-4 border-t border-slate-50">
                        <Badge variant="outline" className="rounded-lg px-3 py-1 text-[8px] font-bold uppercase border-slate-100 text-slate-400">Phase: {member.stage}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
                {(project.crew || []).length === 0 && (
                  <div className="col-span-full py-32 border-2 border-dashed border-slate-50 rounded-[3rem] text-center flex flex-col items-center justify-center space-y-6 bg-slate-50/20">
                    <Users className="h-12 w-12 text-slate-200" />
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-normal">No crew assigned to production lifecycle</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="brief" className="space-y-8 m-0 animate-in fade-in duration-300">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-12">
                <div className="space-y-10">
                  <div>
                    <h3 className="text-2xl font-bold font-headline tracking-normal">Mission Intelligence</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1 tracking-normal">Defining the project's strategic and creative soul.</p>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 relative">
                    <div className="absolute top-10 right-10 opacity-10"><Zap className="h-20 w-20 text-primary" /></div>
                    <p className="text-lg font-medium leading-relaxed text-slate-600 italic tracking-normal relative z-10 whitespace-pre-wrap">
                      "{project.description || "Project briefing pending executive synthesis."}"
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Primary Deliverables</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags?.map((tag: string) => (
                          <Badge key={tag} className="bg-slate-900 text-white border-none font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl tracking-normal">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Lead</p>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 rounded-xl shadow-sm"><AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">MF</AvatarFallback></Avatar>
                        <span className="text-sm font-bold text-slate-900 tracking-normal">Production Command</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Intelligence Column */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Financial Load</p>
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
                <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Strategic Hub</p><p className="text-xs font-bold text-slate-900 tracking-normal">{project.location || "Kerala Hub"}</p></div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="h-8 w-8 rounded-xl bg-accent/5 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-accent" /></div>
                <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Status</p><p className="text-xs font-bold text-slate-900 tracking-normal">Nominal Flow</p></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium italic tracking-normal pt-4 border-t border-slate-50 leading-relaxed">
              "Maintaining consistent throughput across the {activePhase} phase to ensure delivery velocity."
            </p>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 rounded-3xl border-slate-100 bg-white flex flex-col items-center justify-center gap-2 hover:bg-slate-50 shadow-sm transition-all group">
              <Camera className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Callsheet</span>
            </Button>
            <Button variant="outline" className="h-24 rounded-3xl border-slate-100 bg-white flex flex-col items-center justify-center gap-2 hover:bg-slate-50 shadow-sm transition-all group">
              <Scissors className="h-5 w-5 text-slate-400 group-hover:text-accent transition-colors" />
              <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Post Log</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
