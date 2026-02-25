
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
  LayoutGrid,
  Database,
  Globe,
  Save
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
  const [activeTab, setActiveTab] = useState("roadmap");
  const [recruitSearch, setRecruitSearch] = useState("");

  const projectRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "projects", projectId);
  }, [db, projectId, user]);
  const { data: project, isLoading: isProjectLoading } = useDoc(projectRef);

  // Fetch Member & Role for Deletion Authority
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member } = useDoc(memberRef);

  const roleRef = useMemoFirebase(() => {
    if (!member?.roleId) return null;
    return doc(db, "roles", member.roleId);
  }, [db, member?.roleId]);
  const { data: role } = useDoc(roleRef);

  const isAuthorizedToDelete = role?.name === "Administrator" || role?.name === "root Administrator" || role?.name === "Root Administrator";

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects", projectId, "tasks"), orderBy("createdAt", "asc"));
  }, [db, projectId, user]);
  const { data: allTasks, isLoading: isTasksLoading } = useCollection(tasksQuery);

  const staffQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"));
  }, [db, user]);
  const { data: staffMembers } = useCollection(staffQuery);

  const talentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "talents"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: talentLibrary } = useCollection(talentsQuery);

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

  const handleUpdateProject = () => {
    if (!editData.name || !projectRef) return;
    
    updateDocumentNonBlocking(projectRef, {
      ...editData,
      updatedAt: serverTimestamp()
    });
    
    toast({
      title: "Strategy Synchronized",
      description: `Project details for ${editData.name} have been updated.`
    });
  };

  const handleDeleteProject = () => {
    if (!projectRef || !isAuthorizedToDelete) {
      toast({ variant: "destructive", title: "Access Denied", description: "You lack authority to purge projects." });
      return;
    }
    deleteDocumentNonBlocking(projectRef);
    toast({
      variant: "destructive",
      title: "Entity Purged",
      description: "Project has been removed from the workspace."
    });
    router.push("/projects");
  };

  const activePhase = project?.status || "Discussion";
  const phaseTasks = useMemo(() => allTasks?.filter(t => t.phase === activePhase) || [], [allTasks, activePhase]);

  const staffSuggestions = useMemo(() => 
    staffMembers?.filter(s => !project?.crew?.some((c: any) => c.talentId === s.id)) || [], 
  [staffMembers, project]);

  const talentSuggestions = useMemo(() => 
    talentLibrary?.filter(t => !project?.crew?.some((c: any) => c.talentId === t.id)) || [], 
  [talentLibrary, project]);

  const handleRecruit = (member: any, type: 'Internal' | 'Library') => {
    if (!projectRef || !project) return;
    const name = type === 'Internal' ? `${member.firstName} ${member.lastName}` : member.name;
    const thumbnail = type === 'Internal' 
      ? (member.thumbnail || `https://picsum.photos/seed/${member.id}/100/100`)
      : (member.profile_picture || `https://picsum.photos/seed/${member.id}/100/100`);
    
    let category = "Professional";
    if (type === 'Internal') category = member.roleId || "Expert";
    else category = Array.isArray(member.category) ? member.category[0] : member.category;

    const newCrew = [...(project.crew || []), {
      talentId: member.id,
      name,
      category,
      thumbnail,
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

  if (isUserLoading || isProjectLoading) return (
    <div className="h-full flex items-center justify-center py-32">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-14 px-10 rounded-full font-bold gap-3 bg-white border-slate-100 text-slate-600 hover:bg-slate-50 shadow-xl shadow-slate-200/20 transition-all active:scale-95">
                <Settings2 className="h-5 w-5" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Project Matrix</DialogTitle>
              </DialogHeader>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Identity</label>
                    <Input 
                      value={editData?.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Hub (Location)</label>
                    <Select value={editData?.location} onValueChange={(val) => setEditData({...editData, location: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                        <SelectValue placeholder="Select Hub" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {KERALA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Financial Load (INR)</label>
                    <Input 
                      type="number"
                      value={editData?.budget} 
                      onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lifecycle Status</label>
                    <Select value={editData?.status} onValueChange={(val) => setEditData({...editData, status: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Brief</label>
                  <Textarea 
                    value={editData?.description} 
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    placeholder="Refine the project's strategic objectives and creative direction..."
                    className="rounded-xl bg-slate-50 border-none min-h-[150px] resize-none p-4 tracking-normal"
                  />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between">
                {isAuthorizedToDelete ? (
                  <DialogClose asChild>
                    <Button variant="ghost" onClick={handleDeleteProject} className="text-destructive font-bold text-xs uppercase tracking-normal hover:bg-destructive/5 hover:text-destructive gap-2">
                      <Trash2 className="h-4 w-4" />
                      Purge Entity
                    </Button>
                  </DialogClose>
                ) : <div />}
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleUpdateProject} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6 h-11 gap-2 tracking-normal">
                      <Save className="h-4 w-4" />
                      Sync Changes
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                { val: "roadmap", label: "Roadmap", icon: List },
                { val: "team", label: "Production Team", icon: Users },
                { val: "brief", label: "Creative Soul", icon: Zap }
              ].map(t => (
                <TabsTrigger key={t.val} value={t.val} className="rounded-full px-10 py-4 text-xs font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest"><t.icon className="h-4 w-4" /> {t.label}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="roadmap" className="space-y-8 m-0 animate-in fade-in duration-500">
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
                          </div>
                        </div>
                        {isAuthorizedToDelete && (
                          <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "projects", projectId, "tasks", task.id))} className="text-slate-200 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-full"><X className="h-5 w-5" /></Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-32 border-2 border-dashed border-slate-100 rounded-[4rem] text-center bg-slate-50/20 space-y-4">
                  <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No Roadmap Objectives Recorded</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="space-y-12 m-0 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-headline tracking-tight text-slate-900">Personnel Hub</h3>
                  <p className="text-sm font-medium text-slate-500 tracking-normal">Strategic integration of internal experts and marketplace talent.</p>
                </div>
                <div className="flex items-center gap-4">
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
                        <div className="space-y-8">
                          {/* Internal Team Section */}
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                              <ShieldCheck className="h-3 w-3" /> Organization Experts
                            </p>
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

                          {/* Library Talent Section */}
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                              <Database className="h-3 w-3" /> Talent Library
                            </p>
                            {talentSuggestions.filter(t => t.name.toLowerCase().includes(recruitSearch.toLowerCase())).map((talent) => (
                              <Card key={talent.id} className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white p-6 hover:-translate-y-1 transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-5">
                                    <Avatar className="h-16 w-16 rounded-[1.5rem] border-4 border-slate-50 shadow-md">
                                      <AvatarImage src={talent.profile_picture || `https://picsum.photos/seed/${talent.id}/100/100`} />
                                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{talent.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-bold text-base text-slate-900 tracking-tight">{talent.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {Array.isArray(talent.category) ? talent.category[0] : talent.category}
                                      </p>
                                    </div>
                                  </div>
                                  <Button onClick={() => handleRecruit(talent, 'Library')} variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-slate-50 hover:bg-primary hover:text-white transition-all"><Plus className="h-6 w-6" /></Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <div className="space-y-16">
                <div className="space-y-8">
                  <div className="px-4 flex items-center gap-4">
                    <h4 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">Production Team</h4>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] px-4 py-1 rounded-full">{project.crew?.length || 0}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {project.crew?.map((member: any) => (
                      <Card key={member.talentId} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                        <div className="p-4 flex-grow">
                          <div className="relative aspect-square overflow-hidden rounded-[2.2rem]">
                            <img src={member.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={member.name} />
                            {isAuthorizedToDelete && (
                              <Button onClick={() => updateDocumentNonBlocking(projectRef!, { crew: project.crew.filter((c: any) => c.talentId !== member.talentId) })} variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-destructive opacity-0 group-hover:opacity-100 transition-all"><X className="h-5 w-5" /></Button>
                            )}
                          </div>
                          <div className="px-4 py-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-slate-900 tracking-tight leading-tight line-clamp-1">{member.name}</h4>
                              {member.type === 'Internal' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                              ) : (
                                <Badge variant="outline" className="text-[7px] font-bold uppercase tracking-widest h-4 px-1.5 border-slate-100">Library</Badge>
                              )}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500">{member.category}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {(!project.crew || project.crew.length === 0) && (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20 text-center space-y-4">
                        <Users className="h-10 w-10 text-slate-200" />
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No team members provisioned</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brief" className="space-y-10 m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3.5rem] bg-white p-12 space-y-12">
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
        </div>
      </div>
    </div>
  );
}
