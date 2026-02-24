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
  Type,
  LayoutGrid
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

const PHASE_ROADMAP_PRESETS: Record<string, any[]> = {
  "Pre Production": [
    { name: "Project Planning & Scope Finalization", priority: "High", assignedRole: "Producer / Project Manager", subActivities: ["Finalize creative brief", "Confirm deliverables & formats", "Lock budget approval", "Define production timeline", "Risk assessment"] },
    { name: "Script & Concept Approval", priority: "High", assignedRole: "Creative Director", subActivities: ["Script draft review", "Client discussion", "Revisions", "Final approval", "Storyboard creation"] },
    { name: "Team & Resource Allocation", priority: "High", assignedRole: "Production Manager", subActivities: ["Assign crew members", "Equipment booking", "Location confirmation", "Vendor confirmation", "Contract agreements"] }
  ],
  "Production": [
    { name: "Shoot Execution", priority: "High", assignedRole: "Director", subActivities: ["Setup lighting & camera", "Sound check", "Scene execution", "Multiple takes", "Quality monitoring"] },
    { name: "Review & Alignment Meeting", priority: "Medium", assignedRole: "Project Manager", subActivities: ["Internal discussion", "Client review call", "Feedback documentation", "Change confirmation", "Next step approval"] }
  ],
  "Post Production": [
    { name: "Editing & Rough Cut", priority: "High", assignedRole: "Editor", subActivities: ["Footage review", "Rough cut creation", "Internal review", "Revisions", "Export draft"] },
    { name: "Client Review & Final Delivery", priority: "High", assignedRole: "Project Manager", subActivities: ["Send preview link", "Collect feedback", "Implement changes", "Final approval", "Deliver master files"] }
  ],
  "Release": [
    { name: "Internal Preview & Review", priority: "High", assignedRole: "Creative Director", subActivities: ["Screening session", "Quality check", "Fix final errors", "Export master"] }
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
  const [crewViewMode, setCrewViewMode] = useState<"grid" | "list">("grid");

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

  const categorizedCrew = useMemo(() => {
    const crew = project?.crew || [];
    return {
      production: crew.filter((c: any) => c.type === 'Internal'),
      freelancers: crew.filter((c: any) => c.type === 'External' && !["Models", "Influencer"].includes(c.category)),
      cast: crew.filter((c: any) => c.type === 'External' && ["Models", "Influencer"].includes(c.category))
    };
  }, [project?.crew]);

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

  const handleStatusChange = (newStatus: string) => {
    if (!projectRef) return;
    const newProgress = STATUS_PROGRESS_MAP[newStatus] || 0;
    updateDocumentNonBlocking(projectRef, { 
      status: newStatus, 
      progress: newProgress,
      updatedAt: serverTimestamp() 
    });
    setProgress([newProgress]);
    toast({ 
      title: "Lifecycle Advanced", 
      description: `Project phase transitioned to ${newStatus}.` 
    });
  };

  if (isUserLoading || isProjectLoading) return null;
  if (!project) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-full bg-white border-slate-100 shadow-xl shadow-slate-200/30" onClick={() => router.push("/projects")}>
            <ChevronLeft className="h-7 w-7 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">{project.name}</h1>
              <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-50" />
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-normal flex items-center gap-2 uppercase tracking-widest opacity-60">
              <MapPin className="h-4 w-4" /> {project.location || "Kerala Hub"} • <Briefcase className="h-4 w-4" /> {project.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" className="h-14 px-10 rounded-full font-bold gap-3 bg-white border-slate-100 text-slate-600 hover:bg-slate-50 shadow-xl shadow-slate-200/20 transition-all active:scale-95">
            <Settings2 className="h-5 w-5" /> Config Strategy
          </Button>
          <Button onClick={() => updateDocumentNonBlocking(projectRef!, { updatedAt: serverTimestamp() })} className="h-14 px-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 tracking-normal transition-all active:scale-95">Sync Intelligence</Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3.5rem] bg-white overflow-hidden p-3">
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {STAGES.map((stage, idx) => {
            const isActive = project.status === stage;
            const currentIdx = STAGES.indexOf(project.status);
            const isPast = currentIdx > idx;
            
            return (
              <button
                key={stage}
                onClick={() => handleStatusChange(stage)}
                className={`flex-1 min-w-[160px] py-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all group ${
                  isActive 
                    ? "bg-primary text-white shadow-2xl shadow-primary/30" 
                    : isPast 
                      ? "bg-primary/5 text-primary" 
                      : "bg-transparent text-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive ? "border-white bg-white/20" : isPast ? "border-primary bg-primary text-white" : "border-slate-200"
                }`}>
                  {isPast ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${isActive ? "text-white" : isPast ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {stage}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-9 space-y-10">
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3.5rem] bg-white p-12 space-y-12">
            <div className="flex flex-row items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Execution</p>
                <h3 className="text-2xl font-bold font-headline mt-1 tracking-tight">Phase: {activePhase}</h3>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Deployment Progress</span>
                <span className="text-4xl font-bold font-headline text-primary tracking-tight">{progress[0]}%</span>
              </div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="[&_.bg-primary]:bg-primary h-2" />
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border border-slate-100 p-2 h-auto rounded-full shadow-2xl shadow-slate-200/30 gap-2 mb-10 inline-flex">
              {[
                { val: "objectives", label: "Roadmap", icon: List },
                { val: "crew", label: "Production Crew", icon: Users },
                { val: "brief", label: "Creative Soul", icon: Zap }
              ].map(t => (
                <TabsTrigger key={t.val} value={t.val} className="rounded-full px-10 py-4 text-xs font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest"><t.icon className="h-4 w-4" /> {t.label}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="objectives" className="space-y-8 m-0 animate-in fade-in duration-500">
              {phaseTasks.length > 0 ? (
                phaseTasks.map((task) => (
                  <Card key={task.id} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:shadow-primary/5 transition-all border border-slate-50">
                    <div className="p-10 space-y-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-8">
                          <Checkbox checked={task.status === "Completed"} onCheckedChange={() => handleUpdateTask(task.id, { status: task.status === 'Completed' ? 'Active' : 'Completed' })} className="h-8 w-8 mt-1 rounded-xl border-slate-200 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
                          <div className="space-y-6">
                            <div>
                              <p className={`text-2xl font-bold tracking-tight ${task.status === "Completed" ? "line-through text-slate-300" : "text-slate-900"}`}>{task.name}</p>
                              <div className="flex items-center gap-8 mt-3">
                                <Badge className={`text-[9px] font-bold uppercase rounded-full tracking-widest border-none px-4 py-1 ${task.priority === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3"><User className="h-4 w-4" /> {task.assignedRole}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                              <div className="space-y-3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5" /> Deadline Assignment</label>
                                <Input type="date" value={task.dueDate || ""} onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-xs px-6" />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /> Executive Commentary</label>
                                <Input value={task.comments || ""} onChange={(e) => handleUpdateTask(task.id, { comments: e.target.value })} placeholder="Add strategic notes..." className="h-12 rounded-2xl bg-slate-50 border-none text-xs px-6" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "projects", projectId, "tasks", task.id))} className="text-slate-200 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-full"><X className="h-5 w-5" /></Button>
                      </div>

                      {task.subActivities && (
                        <div className="pl-16 space-y-4 pt-6 border-t border-slate-50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Milestone Checkpoints</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {task.subActivities.map((sub: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                                const newSubs = [...task.subActivities];
                                newSubs[idx].completed = !newSubs[idx].completed;
                                handleUpdateTask(task.id, { subActivities: newSubs });
                              }}>
                                <div className={`h-5 w-5 rounded-lg flex items-center justify-center border-2 ${sub.completed ? 'bg-green-500 border-green-500' : 'bg-white border-slate-200'}`}>
                                  {sub.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                </div>
                                <span className={`text-xs font-bold tracking-tight ${sub.completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-32 border-2 border-dashed border-slate-100 rounded-[4rem] text-center bg-slate-50/20 space-y-4">
                  <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No Roadmap Objectives Recorded</p>
                  <Button variant="link" className="text-primary font-bold text-xs uppercase tracking-widest p-0 h-auto">Generate Phase presets</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crew" className="space-y-12 m-0 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-headline tracking-tight text-slate-900">Personnel Hub</h3>
                  <p className="text-sm font-medium text-slate-500 tracking-normal">Strategic segmentation of internal experts, freelancers, and cast.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-slate-100 rounded-full p-1.5 shadow-sm">
                    <Button variant={crewViewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setCrewViewMode('grid')} className={`h-11 w-11 rounded-full transition-all ${crewViewMode === 'grid' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutGrid className="h-5 w-5" /></Button>
                    <Button variant={crewViewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setCrewViewMode('list')} className={`h-11 w-11 rounded-full transition-all ${crewViewMode === 'list' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><List className="h-5 w-5" /></Button>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="h-14 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase gap-3 tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95"><Plus className="h-5 w-5" /> Provision Resource</Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-[550px] rounded-l-[4rem] p-0 border-none shadow-2xl flex flex-col bg-slate-50">
                      <div className="p-12 bg-white border-b border-slate-100 rounded-bl-[4rem]">
                        <SheetTitle className="text-3xl font-bold font-headline tracking-tight">Resource Registry</SheetTitle>
                        <div className="relative mt-8 group">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input value={recruitSearch} onChange={(e) => setRecruitSearch(e.target.value)} placeholder="Identify expertise or identity..." className="pl-16 h-16 rounded-full bg-slate-50 border-none font-bold text-base" />
                        </div>
                      </div>
                      <ScrollArea className="flex-1 p-12 space-y-10">
                        <div className="space-y-6">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Organization Experts</p>
                          {staffSuggestions.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(recruitSearch.toLowerCase())).map((staff) => (
                            <Card key={staff.id} className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white p-6 hover:-translate-y-1 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                  <Avatar className="h-16 w-16 rounded-[1.5rem] border-4 border-slate-50 shadow-md">
                                    <AvatarImage src={staff.thumbnail || `https://picsum.photos/seed/${staff.id}/100/100`} />
                                    <AvatarFallback className="bg-blue-50 text-blue-500 font-bold">{staff.firstName[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-base text-slate-900 tracking-tight">{staff.firstName} {staff.lastName}</p>
                                      <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">{staff.roleId}</p>
                                  </div>
                                </div>
                                <Button onClick={() => handleRecruit(staff, 'Internal')} variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-slate-50 hover:bg-primary hover:text-white transition-all"><Plus className="h-6 w-6" /></Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <div className="space-y-16">
                {[
                  { title: "Production Crew", desc: "Internal experts managing central production logistics.", members: categorizedCrew.production },
                  { title: "Freelancers", desc: "External creative and technical collaborators assigned to specific project tasks.", members: categorizedCrew.freelancers },
                  { title: "Cast", desc: "On-camera talent, models, and influencers deployed for the production.", members: categorizedCrew.cast }
                ].map((tier, i) => (
                  <div key={i} className="space-y-8 animate-in fade-in duration-700">
                    <div className="px-4 flex items-center gap-4">
                      <h4 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">{tier.title}</h4>
                      <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] px-4 py-1 rounded-full">{tier.members.length}</Badge>
                    </div>
                    {crewViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {tier.members.map((member: any) => (
                          <Card key={member.talentId} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                            <div className="p-4 flex-grow">
                              <div className="relative aspect-square overflow-hidden rounded-[2.2rem]">
                                <img src={member.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={member.name} />
                                <Button onClick={() => updateDocumentNonBlocking(projectRef!, { crew: project.crew.filter((c: any) => c.talentId !== member.talentId) })} variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-destructive opacity-0 group-hover:opacity-100 transition-all"><X className="h-5 w-5" /></Button>
                              </div>
                              <div className="px-4 py-6 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-base text-slate-900 tracking-tight leading-tight line-clamp-1">{member.name}</h4>
                                  <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                                </div>
                                <p className={`text-[9px] font-bold uppercase tracking-widest ${member.type === 'Internal' ? 'text-blue-500' : 'text-primary'}`}>{member.category}</p>
                              </div>
                            </div>
                            <div className="px-6 pb-6">
                              <Button asChild variant="ghost" className="w-full h-10 rounded-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 font-bold text-[9px] uppercase transition-all shadow-none border-none gap-2">
                                <Link href={`/shoot-network/${member.talentId}`}>Profile +</Link>
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        {tier.members.map((member: any) => (
                          <div key={member.talentId} className="flex items-center justify-between px-10 py-6 group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                            <div className="flex items-center gap-6">
                              <Avatar className="h-14 w-14 rounded-2xl border-4 border-slate-50 shadow-md">
                                <AvatarImage src={member.thumbnail} />
                                <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 tracking-tight">{member.name}</p>
                                  <CheckCircle2 className="h-3 w-3 text-green-500 fill-green-50" />
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <Badge className={`text-[8px] font-bold uppercase rounded-full px-3 py-0.5 border-none tracking-widest ${member.type === 'Internal' ? 'bg-blue-50 text-blue-600' : 'bg-primary/5 text-primary'}`}>{member.type}</Badge>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.category}</span>
                                </div>
                              </div>
                            </div>
                            <Button onClick={() => updateDocumentNonBlocking(projectRef!, { crew: project.crew.filter((c: any) => c.talentId !== member.talentId) })} variant="ghost" size="icon" className="h-12 w-12 rounded-full text-slate-200 hover:text-destructive hover:bg-destructive/5 transition-all"><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="brief" className="space-y-10 m-0 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <Card className="md:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[3.5rem] bg-white p-12 space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center">
                      <Zap className="h-7 w-7 text-primary fill-primary/10" />
                    </div>
                    <h3 className="text-3xl font-bold font-headline tracking-tight">Creative Soul</h3>
                  </div>
                  <div className="p-12 rounded-[3.5rem] bg-slate-50/50 border border-slate-100 relative">
                    <p className="text-xl font-medium leading-relaxed text-slate-600 italic tracking-tight relative z-10 whitespace-pre-wrap">"{project.description || "Briefing pending executive synthesis."}"</p>
                  </div>
                </Card>
                <div className="space-y-8">
                  <Card className="border-none shadow-2xl shadow-primary/20 rounded-[3rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24" />
                    <div className="space-y-3 relative z-10">
                      <p className="text-[10px] font-bold text-slate-50 uppercase tracking-widest">Style Intelligence</p>
                      <h4 className="text-2xl font-bold font-headline tracking-tight">Visual Direction</h4>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 relative z-10">
                      <p className="text-sm font-medium text-slate-300 italic">"Ensure the color palette reflects the high-fidelity കേരള cultural aesthetic requested."</p>
                    </div>
                  </Card>
                  <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white p-10 space-y-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Deliverables</p>
                    <div className="space-y-4">
                      {[
                        { icon: Film, label: "1x Main Film (TVC)" },
                        { icon: Type, label: "3x Script Drafts" }
                      ].map((d, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-600">
                          <d.icon className="h-5 w-5 text-primary" /> {d.label}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <Card className="bg-slate-900 text-white border-none rounded-[3.5rem] p-12 space-y-10 relative overflow-hidden shadow-2xl shadow-slate-900/30 transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Load</p>
              <h2 className="text-4xl font-bold font-headline mt-3 tracking-tight">₹{(project.budget || 0).toLocaleString('en-IN')}</h2>
            </div>
            <Button asChild className="w-full h-16 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-[10px] uppercase border-none tracking-widest shadow-2xl transition-all active:scale-95 relative z-10">
              <Link href="/invoices/new">Issue Invoice +</Link>
            </Button>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: Camera, label: "Callsheet", color: "text-primary" },
              { icon: Scissors, label: "Post Log", color: "text-accent" }
            ].map((tool, i) => (
              <Button key={i} variant="outline" className="h-32 rounded-[3rem] border-slate-100 bg-white flex flex-col items-center justify-center gap-4 hover:bg-slate-50 shadow-2xl shadow-slate-200/30 transition-all group active:scale-95">
                <tool.icon className={`h-8 w-8 text-slate-300 group-hover:${tool.color} transition-colors`} />
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest group-hover:text-slate-900">{tool.label} Hub</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
