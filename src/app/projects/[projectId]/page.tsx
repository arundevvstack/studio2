
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
  IndianRupee,
  Loader2,
  ArrowRight,
  Calendar as CalendarIcon,
  User,
  Clock,
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
  MapPin,
  Briefcase,
  List,
  Play,
  Sparkles,
  Rocket,
  Camera,
  Scissors,
  Share2,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Search,
  Users,
  Film,
  Type
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, serverTimestamp, orderBy, where, writeBatch } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const STAGES = ["Discussion", "Pre Production", "Production", "Post Production", "Release", "Social Media"];

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
  { title: "Viral BTS Loop", strategy: "Create a 15-second high-energy edit showing behind-the-scenes chaos.", platform: "Instagram Reels", impact: "High Reach" },
  { title: "Talent Reveal", strategy: "Highlight key talent profile with a 'Get to Know' carousel.", platform: "Instagram", impact: "High Engagement" },
  { title: "The Countdown", strategy: "Story series with countdown stickers to build anticipation.", platform: "Instagram Stories", impact: "Medium Conversion" }
];

const PHASE_ROADMAP_PRESETS: Record<string, any[]> = {
  "Pre Production": [
    { name: "Project Planning & Scope Finalization", priority: "High", assignedRole: "Producer / Project Manager", subActivities: ["Finalize creative brief", "Confirm deliverables & formats", "Lock budget approval", "Define production timeline", "Risk assessment"] },
    { name: "Script & Concept Approval", priority: "High", assignedRole: "Creative Director", subActivities: ["Script draft review", "Client discussion", "Revisions", "Final approval", "Storyboard creation"] },
    { name: "Team & Resource Allocation", priority: "High", assignedRole: "Production Manager", subActivities: ["Assign crew members", "Equipment booking", "Location confirmation", "Vendor confirmation", "Contract agreements"] },
    { name: "Scheduling & Logistics", priority: "Medium", assignedRole: "Line Producer", subActivities: ["Shoot schedule", "Call sheet creation", "Travel arrangements", "Permission approvals", "Backup planning"] }
  ],
  "Production": [
    { name: "Shoot Execution", priority: "High", assignedRole: "Director", subActivities: ["Setup lighting & camera", "Sound check", "Scene execution", "Multiple takes", "Quality monitoring"] },
    { name: "Daily Production Monitoring", priority: "High", assignedRole: "Production Manager", subActivities: ["Track timeline adherence", "Budget tracking", "Issue resolution", "Client update", "Daily wrap report"] },
    { name: "Data Backup & Media Management", priority: "High", assignedRole: "DIT / Editor", subActivities: ["Backup footage", "Verify file integrity", "Organize folder structure", "Cloud upload", "Create editing notes"] },
    { name: "Review & Alignment Meeting", priority: "Medium", assignedRole: "Project Manager", subActivities: ["Internal discussion", "Client review call", "Feedback documentation", "Change confirmation", "Next step approval"] }
  ],
  "Post Production": [
    { name: "Editing & Rough Cut", priority: "High", assignedRole: "Editor", subActivities: ["Footage review", "Rough cut creation", "Internal review", "Revisions", "Export draft"] },
    { name: "Sound Design & Music", priority: "Medium", assignedRole: "Sound Designer", subActivities: ["Clean audio", "Add background score", "Add sound effects", "Voice over sync", "Final mix"] },
    { name: "Color Grading & Visual Enhancement", priority: "Medium", assignedRole: "Colorist", subActivities: ["Color correction", "Look development", "Skin tone balance", "Final export test"] },
    { name: "Client Review & Final Delivery", priority: "High", assignedRole: "Project Manager", subActivities: ["Send preview link", "Collect feedback", "Implement changes", "Final approval", "Deliver master files"] }
  ],
  "Release": [
    { name: "Internal Preview & Review", priority: "High", assignedRole: "Creative Director", subActivities: ["Screening session", "Quality check", "Fix final errors", "Export master", "Metadata validation"] },
    { name: "Strategic Rollout & Ready to Release", priority: "High", assignedRole: "Producer", subActivities: ["Platform check", "Release schedule finalization", "Client final signoff", "Publicity check"] }
  ],
  "Social Media": [
    { name: "Review & Alignment Meeting", priority: "Medium", assignedRole: "Social Media Lead", subActivities: ["Internal discussion", "Client review call", "Feedback documentation", "Change confirmation", "Next step approval"] }
  ]
};

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [progress, setProgress] = useState([0]);
  const [activeTab, setActiveTab] = useState("objectives");
  const [recruitSearch, setRecruitSearch] = useState("");

  const projectRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "projects", projectId);
  }, [db, projectId, user]);
  const { data: project, isLoading: isProjectLoading } = useDoc(projectRef);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects", projectId, "tasks"), orderBy("createdAt", "asc"));
  }, [db, projectId, user]);
  const { data: allTasks, isLoading: isTasksLoading } = useCollection(tasksQuery);

  const talentQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "shoot_network"), where("isArchived", "==", false));
  }, [db, user]);
  const { data: shootNetwork } = useCollection(talentQuery);

  const staffQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"));
  }, [db, user]);
  const { data: staffMembers } = useCollection(staffQuery);

  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    if (project) {
      setEditData({
        name: project.name || "",
        status: project.status || "Discussion",
        budget: project.budget || 0,
        description: project.description || "",
        location: project.location || "",
      });
      setProgress([project.progress || 0]);
    }
  }, [project]);

  const activePhase = project?.status || "Discussion";
  const phaseTasks = useMemo(() => allTasks?.filter(t => t.phase === activePhase) || [], [allTasks, activePhase]);

  const suggestions = useMemo(() => shootNetwork?.filter(t => !project?.crew?.some((c: any) => c.talentId === t.id)) || [], [shootNetwork, project]);
  const staffSuggestions = useMemo(() => staffMembers?.filter(s => !project?.crew?.some((c: any) => c.talentId === s.id)) || [], [staffMembers, project]);

  const handleRecruit = (member: any, type: 'Internal' | 'External') => {
    if (!projectRef || !project) return;
    const name = type === 'Internal' ? `${member.firstName} ${member.lastName}` : member.name;
    const newCrew = [...(project.crew || []), {
      talentId: member.id,
      name,
      category: member.category || member.roleId,
      thumbnail: member.thumbnail || `https://picsum.photos/seed/${member.id}/100/100`,
      type,
      stage: project.status
    }];
    updateDocumentNonBlocking(projectRef, { crew: newCrew, updatedAt: serverTimestamp() });
    toast({ title: "Resource Assigned", description: `${name} provisioned to project.` });
  };

  const handleUpdateTask = (taskId: string, data: any) => {
    const taskRef = doc(db, "projects", projectId, "tasks", taskId);
    updateDocumentNonBlocking(taskRef, { ...data, updatedAt: serverTimestamp() });
  };

  const handleUpdateProject = () => {
    if (!editData?.name || !projectRef) return;
    updateDocumentNonBlocking(projectRef, { ...editData, progress: progress[0], updatedAt: serverTimestamp() });
    toast({ title: "Intelligence Synced", description: "Project parameters updated." });
  };

  const handleApplyPresets = (phase: string) => {
    if (!PHASE_ROADMAP_PRESETS[phase]) return;
    const batch = writeBatch(db);
    PHASE_ROADMAP_PRESETS[phase].forEach(obj => {
      const taskRef = doc(collection(db, "projects", projectId, "tasks"));
      batch.set(taskRef, {
        ...obj,
        id: taskRef.id,
        phase,
        status: "Active",
        dueDate: "",
        comments: "",
        subActivities: obj.subActivities.map((title: string) => ({ title, completed: false })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    batch.commit();
    toast({ title: "Roadmap Provisioned", description: `Presets applied for ${phase} phase.` });
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm" onClick={() => router.push("/projects")}>
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">{project.name}</h1>
              <Badge className="bg-primary/5 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">{project.status}</Badge>
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-normal flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {project.location || "Kerala Hub"} • <Briefcase className="h-4 w-4" /> {project.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 tracking-normal">
                <Settings2 className="h-4 w-4" /> Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0"><DialogTitle className="text-2xl font-bold font-headline tracking-normal">Project Context</DialogTitle></DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Title</Label>
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
                      <SelectContent className="rounded-xl shadow-xl">{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Roadmap Presets</Label>
                      <p className="text-xs font-medium text-slate-500">Apply standard production roadmap for current phase.</p>
                    </div>
                    <Button onClick={() => handleApplyPresets(editData.status)} size="sm" className="bg-slate-900 text-white rounded-lg h-9 font-bold gap-2 text-[10px]">
                      <RotateCcw className="h-3.5 w-3.5" /> Apply
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between">
                <DialogClose asChild><Button variant="ghost" onClick={() => deleteDocumentNonBlocking(projectRef!)} className="text-destructive font-bold text-xs uppercase tracking-normal"><Trash2 className="h-4 w-4 mr-2" /> Purge</Button></DialogClose>
                <DialogClose asChild><Button onClick={handleUpdateProject} className="bg-primary text-white rounded-xl px-8 h-11 font-bold tracking-normal">Sync Changes</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleUpdateProject} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 tracking-normal">Save Strategy</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-10">
            <div className="flex flex-row items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Phase: {activePhase}</p>
                <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Production Lifecycle</h3>
              </div>
              {NEXT_PHASE_MAP[project.status] && (
                <Button onClick={() => updateDocumentNonBlocking(projectRef!, { status: NEXT_PHASE_MAP[project.status], progress: STATUS_PROGRESS_MAP[NEXT_PHASE_MAP[project.status]!], updatedAt: serverTimestamp() })} className="h-10 px-6 rounded-xl bg-accent text-white font-bold text-[10px] gap-2 tracking-normal uppercase shadow-lg shadow-accent/20">
                  Advance to {NEXT_PHASE_MAP[project.status]} <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Overall Progress</span>
                <span className="text-3xl font-bold font-headline text-primary tracking-normal">{progress[0]}%</span>
              </div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="[&_.bg-primary]:bg-primary" />
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-[2rem] shadow-sm gap-1 mb-8">
              <TabsTrigger value="objectives" className="rounded-xl px-10 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal"><List className="h-4 w-4" /> Phase Roadmap</TabsTrigger>
              <TabsTrigger value="crew" className="rounded-xl px-10 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal"><Users className="h-4 w-4" /> Production Crew</TabsTrigger>
              <TabsTrigger value="brief" className="rounded-xl px-10 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal"><Briefcase className="h-4 w-4" /> Creative Soul</TabsTrigger>
            </TabsList>

            <TabsContent value="objectives" className="space-y-6 m-0 animate-in fade-in duration-300">
              {isTasksLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : phaseTasks.length > 0 ? (
                phaseTasks.map((task) => (
                  <Card key={task.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-md transition-all border border-slate-50">
                    <div className="p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-6">
                          <Checkbox checked={task.status === "Completed"} onCheckedChange={() => handleUpdateTask(task.id, { status: task.status === 'Completed' ? 'Active' : 'Completed' })} className="h-6 w-6 mt-1 rounded-lg border-slate-200" />
                          <div className="space-y-4">
                            <div>
                              <p className={`text-xl font-bold tracking-normal ${task.status === "Completed" ? "line-through text-slate-300" : "text-slate-900"}`}>{task.name}</p>
                              <div className="flex items-center gap-6 mt-2">
                                <Badge variant="outline" className={`text-[8px] font-bold uppercase rounded-md tracking-normal border-none ${task.priority === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2"><User className="h-3 w-3" /> {task.assignedRole}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                                  <CalendarIcon className="h-3 w-3" /> Deadline Assignment
                                </label>
                                <Input type="date" value={task.dueDate || ""} onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })} className="h-10 rounded-xl bg-slate-50 border-none font-bold text-xs" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                                  <MessageSquare className="h-3 w-3" /> Executive Comments
                                </label>
                                <Input value={task.comments || ""} onChange={(e) => handleUpdateTask(task.id, { comments: e.target.value })} placeholder="Add strategic notes..." className="h-10 rounded-xl bg-slate-50 border-none text-xs" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "projects", projectId, "tasks", task.id))} className="text-slate-200 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><X className="h-4 w-4" /></Button>
                      </div>

                      {task.subActivities && (
                        <div className="pl-12 space-y-3 pt-4 border-t border-slate-50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Milestone Checklist</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {task.subActivities.map((sub: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                                const newSubs = [...task.subActivities];
                                newSubs[idx].completed = !newSubs[idx].completed;
                                handleUpdateTask(task.id, { subActivities: newSubs });
                              }}>
                                <div className={`h-4 w-4 rounded-md flex items-center justify-center border ${sub.completed ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}>
                                  {sub.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <span className={`text-xs font-medium tracking-normal ${sub.completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-32 border-2 border-dashed border-slate-50 rounded-[3rem] text-center bg-slate-50/20">
                  <p className="text-sm font-bold text-slate-300 uppercase tracking-normal">No roadmap objectives for {activePhase}</p>
                  <Button onClick={() => handleApplyPresets(activePhase)} variant="link" className="text-primary font-bold text-xs uppercase tracking-normal mt-2">Load standardized roadmap</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crew" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-headline tracking-normal">Production Crew</h3>
                  <p className="text-xs font-medium text-slate-500 tracking-normal">Assigned internal staff and external partners.</p>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase gap-2 tracking-normal shadow-lg shadow-primary/20"><Plus className="h-4 w-4" /> Provision Resource</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-[500px] rounded-l-[3rem] p-0 border-none shadow-2xl flex flex-col bg-slate-50">
                    <div className="p-10 bg-white border-b border-slate-100">
                      <SheetTitle className="text-2xl font-bold font-headline tracking-normal">Deploy Team Member</SheetTitle>
                      <div className="relative mt-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input value={recruitSearch} onChange={(e) => setRecruitSearch(e.target.value)} placeholder="Identify expertise or identity..." className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-10 pt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal px-2">Internal Experts</p>
                          {staffSuggestions.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(recruitSearch.toLowerCase())).map((staff) => (
                            <Card key={staff.id} className="border-none shadow-sm rounded-2xl bg-white p-5 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-12 w-12 rounded-xl border-2 border-slate-50 shadow-sm"><AvatarFallback>{staff.firstName[0]}</AvatarFallback></Avatar>
                                  <div><p className="font-bold text-sm text-slate-900 tracking-normal">{staff.firstName} {staff.lastName}</p><p className="text-[9px] font-bold text-blue-500 uppercase tracking-normal">{staff.roleId}</p></div>
                                </div>
                                <Button onClick={() => handleRecruit(staff, 'Internal')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-blue-500 hover:text-white transition-all"><Plus className="h-4 w-4" /></Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal px-2">Talent Network Partners</p>
                          {suggestions.filter(t => t.name?.toLowerCase().includes(recruitSearch.toLowerCase())).map((talent) => (
                            <Card key={talent.id} className="border-none shadow-sm rounded-2xl bg-white p-5 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-12 w-12 rounded-xl border-2 border-slate-50 shadow-sm"><AvatarFallback>{talent.name?.[0]}</AvatarFallback></Avatar>
                                  <div><p className="font-bold text-sm text-slate-900 tracking-normal">{talent.name}</p><p className="text-[9px] font-bold text-primary uppercase tracking-normal">{talent.category}</p></div>
                                </div>
                                <Button onClick={() => handleRecruit(talent, 'External')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all"><Plus className="h-4 w-4" /></Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(project.crew || []).map((member: any) => (
                  <Card key={member.talentId} className="border-none shadow-sm rounded-[2rem] bg-white p-8 relative group hover:shadow-xl transition-all duration-500 border border-slate-50">
                    <Button onClick={() => updateDocumentNonBlocking(projectRef!, { crew: project.crew.filter((c: any) => c.talentId !== member.talentId) })} variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-lg text-slate-200 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><X className="h-4 w-4" /></Button>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-20 w-20 rounded-3xl shadow-lg border-4 border-slate-50"><AvatarImage src={member.thumbnail} /><AvatarFallback>{member.name?.[0]}</AvatarFallback></Avatar>
                      <div>
                        <h4 className="font-bold text-lg text-slate-900 tracking-normal leading-tight">{member.name}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-normal mt-1 ${member.type === 'Internal' ? 'text-blue-500' : 'text-primary'}`}>{member.category}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="brief" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-12">
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold font-headline tracking-normal">Creative Soul</h3>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 relative">
                      <p className="text-lg font-medium leading-relaxed text-slate-600 italic tracking-normal relative z-10 whitespace-pre-wrap">"{project.description || "Briefing pending executive synthesis."}"</p>
                    </div>
                  </div>
                </Card>
                <div className="space-y-6">
                  <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="space-y-2 relative z-10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Visual Alignment</p>
                      <h4 className="text-xl font-bold font-headline tracking-normal">Style Direction</h4>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative z-10">
                      <p className="text-xs font-medium text-slate-300 italic">"Ensure the color palette reflects the high-fidelity கேரள cultural aesthetic requested."</p>
                    </div>
                  </Card>
                  <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Core Deliverables</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Film className="h-3 w-3 text-primary" /> 1x Main Film (TVC)
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Type className="h-3 w-3 text-primary" /> 3x Script Drafts
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Financial Load</p>
              <h2 className="text-4xl font-bold font-headline mt-2 tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</h2>
            </div>
            <Button asChild className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase border border-white/10 tracking-normal relative z-10">
              <Link href="/invoices/new">Issue Invoice</Link>
            </Button>
          </Card>

          {project.status === 'Social Media' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-normal">Social Intelligence</p>
              {SOCIAL_MEDIA_SUGGESTIONS.map((s, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl bg-white p-6 border border-slate-50 group hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 tracking-normal">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{s.strategy}</p>
                    <Badge variant="outline" className="text-[8px] font-bold border-slate-100 uppercase">{s.platform}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 rounded-3xl border-slate-100 bg-white flex flex-col items-center justify-center gap-2 hover:bg-slate-50 shadow-sm transition-all group">
              <Camera className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" /><span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Callsheet</span>
            </Button>
            <Button variant="outline" className="h-24 rounded-3xl border-slate-100 bg-white flex flex-col items-center justify-center gap-2 hover:bg-slate-50 shadow-sm transition-all group">
              <Scissors className="h-5 w-5 text-slate-400 group-hover:text-accent transition-colors" /><span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Post Log</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
