"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles,
  ArrowRight,
  Loader2,
  Briefcase,
  IndianRupee,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  MoreVertical,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, serverTimestamp } from "firebase/firestore";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export default function PipelinePage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState("pitches");

  // --- Data Fetching ---
  const allProjectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);
  const { data: allProjects, isLoading: isProjectsLoading } = useCollection(allProjectsQuery);

  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: clients } = useCollection(clientsQuery);

  const followUpsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "followUps"), orderBy("scheduledDate", "asc"));
  }, [db, user]);
  const { data: followUps, isLoading: isFollowUpsLoading } = useCollection(followUpsQuery);

  // --- Logic & Filtering ---
  const pitchProjects = useMemo(() => {
    if (!allProjects) return [];
    return allProjects.filter(p => p.status === "Pitch");
  }, [allProjects]);

  const clientMap = useMemo(() => {
    const map = new Map();
    clients?.forEach(c => map.set(c.id, c.name));
    return map;
  }, [clients]);

  // --- Follow-up Module State ---
  const [newFollowUp, setNewFollowUp] = useState({
    subject: "",
    followUpType: "Call",
    scheduledDate: "",
    description: "",
    clientId: "",
    projectId: ""
  });

  const handleAddFollowUp = () => {
    if (!newFollowUp.subject || !newFollowUp.scheduledDate) return;
    
    const followUpsRef = collection(db, "followUps");
    addDocumentNonBlocking(followUpsRef, {
      ...newFollowUp,
      status: "Scheduled",
      assignedToId: user?.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setNewFollowUp({
      subject: "",
      followUpType: "Call",
      scheduledDate: "",
      description: "",
      clientId: "",
      projectId: ""
    });

    toast({
      title: "Engagement Scheduled",
      description: `Follow-up for ${newFollowUp.subject} has been added to the pipeline.`
    });
  };

  const handleCompleteFollowUp = (id: string) => {
    const ref = doc(db, "followUps", id);
    updateDocumentNonBlocking(ref, {
      status: "Completed",
      completedDate: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
    toast({ title: "Engagement Finalized", description: "Follow-up activity marked as completed." });
  };

  const handleDeleteFollowUp = (id: string) => {
    const ref = doc(db, "followUps", id);
    deleteDocumentNonBlocking(ref);
    toast({ variant: "destructive", title: "Activity Purged", description: "Follow-up has been removed from the schedule." });
  };

  const isLoading = isUserLoading || isProjectsLoading || isFollowUpsLoading;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">
              Strategic Pipeline
            </h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
              <Sparkles className="h-3 w-3 mr-1" />
              Intelligence Core
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Managing early-stage opportunities and critical sales engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 border-slate-200 bg-white text-slate-600 font-bold rounded-xl gap-2 tracking-normal hover:bg-slate-50 transition-colors">
                <Calendar className="h-4 w-4" />
                Schedule Engagement
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-[550px] p-0 border-none shadow-2xl overflow-hidden">
              <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Schedule Sales Engagement</DialogTitle>
              </DialogHeader>
              <div className="p-8 pt-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Engagement Subject</label>
                  <Input 
                    value={newFollowUp.subject} 
                    onChange={(e) => setNewFollowUp({...newFollowUp, subject: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" 
                    placeholder="e.g. Q3 Proposal Discussion"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Engagement Type</label>
                    <Select value={newFollowUp.followUpType} onValueChange={(val) => setNewFollowUp({...newFollowUp, followUpType: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none tracking-normal">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="Call" className="tracking-normal">Voice Call</SelectItem>
                        <SelectItem value="Email" className="tracking-normal">Executive Email</SelectItem>
                        <SelectItem value="Meeting" className="tracking-normal">Strategic Meeting</SelectItem>
                        <SelectItem value="Proposal Submission" className="tracking-normal">Proposal Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Scheduled Date</label>
                    <Input 
                      type="datetime-local" 
                      value={newFollowUp.scheduledDate} 
                      onChange={(e) => setNewFollowUp({...newFollowUp, scheduledDate: e.target.value})} 
                      className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Related Entity (Optional)</label>
                  <Select value={newFollowUp.clientId} onValueChange={(val) => setNewFollowUp({...newFollowUp, clientId: val})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none tracking-normal">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {clients?.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="tracking-normal">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Context</label>
                  <Textarea 
                    value={newFollowUp.description} 
                    onChange={(e) => setNewFollowUp({...newFollowUp, description: e.target.value})} 
                    placeholder="Outline the objectives for this engagement..."
                    className="min-h-[100px] rounded-xl bg-slate-50 border-none resize-none p-4 tracking-normal"
                  />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6">
                <div className="flex gap-3 w-full">
                  <DialogClose asChild>
                    <Button variant="ghost" className="flex-1 font-bold text-xs uppercase tracking-normal">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleAddFollowUp} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-11 tracking-normal">
                      Sync Schedule
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2 tracking-normal">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              New Pitch
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1">
          <TabsTrigger value="pitches" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Sparkles className="h-4 w-4" />
            Project Pitches
          </TabsTrigger>
          <TabsTrigger value="followups" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Calendar className="h-4 w-4" />
            Strategic Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pitches" className="animate-in slide-in-from-left-2 duration-300">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400 tracking-normal" 
                placeholder="Search pending pitches..." 
              />
            </div>
            <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm tracking-normal">
              <Filter className="h-4 w-4" />
              Refine
            </Button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            <div className="grid grid-cols-12 px-10 py-6 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
              <div className="col-span-2">Client</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-3 text-center">Budget</div>
              <div className="col-span-2 text-right">Details</div>
            </div>
            
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : pitchProjects.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {pitchProjects.map((project) => (
                    <div key={project.id} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-slate-50/50 transition-colors group">
                      <div className="col-span-2">
                        <span className="text-sm font-bold text-primary tracking-normal">
                          {clientMap.get(project.clientId) || "Unknown Client"}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <h4 className="font-bold text-lg text-slate-900 tracking-normal">{project.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-2 tracking-normal">
                          <Briefcase className="h-3 w-3" />
                          ID: {project.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-100 text-slate-500 bg-slate-50/50 px-3 py-1 tracking-normal">
                          {project.status || "Pitch"}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-center flex items-center justify-center gap-1.5 text-slate-900 font-bold tracking-normal">
                        <IndianRupee className="h-4 w-4 text-slate-400" />
                        <span>{(project.budget || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all font-bold text-[10px] uppercase gap-2 tracking-normal">
                          <Link href={`/projects/${project.id}`}>
                            More
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-4">
                    <div className="bg-slate-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 p-5 shadow-inner">
                      <Search className="h-full w-full text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium italic text-sm tracking-normal">
                      No projects currently in the Pitch pipeline.
                    </p>
                    <Button asChild variant="link" className="text-primary font-bold text-xs tracking-normal">
                      <Link href="/projects/new">Initiate a new production pitch</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="followups" className="animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">Scheduled Engagement</h3>
                <Badge className="bg-accent/10 text-accent border-none text-[10px] font-bold px-3 tracking-normal">Active Pipeline</Badge>
              </div>

              {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
              ) : followUps && followUps.filter(f => f.status === 'Scheduled').length > 0 ? (
                <div className="space-y-4">
                  {followUps.filter(f => f.status === 'Scheduled').map((f) => (
                    <div key={f.id} className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          {f.followUpType === 'Call' && <Phone className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />}
                          {f.followUpType === 'Email' && <Mail className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />}
                          {f.followUpType === 'Meeting' && <Users className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />}
                          {f.followUpType === 'Proposal Submission' && <MessageSquare className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-slate-900 tracking-normal">{f.subject}</h4>
                            <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold uppercase px-2 py-0.5 tracking-normal">{f.followUpType}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                              <Clock className="h-3 w-3" /> {new Date(f.scheduledDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            {f.clientId && (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-normal">
                                <Briefcase className="h-3 w-3" /> {clientMap.get(f.clientId)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleCompleteFollowUp(f.id)}
                          className="h-11 w-11 rounded-xl bg-slate-50 hover:bg-accent hover:text-white transition-all"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteFollowUp(f.id)}
                          className="h-11 w-11 rounded-xl bg-slate-50 hover:bg-destructive hover:text-white transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center bg-white/50">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No scheduled engagements</p>
                  <p className="text-xs text-slate-300 mt-1 italic tracking-normal">Align with potential partners to maintain pipeline velocity.</p>
                </div>
              )}

              {followUps && followUps.filter(f => f.status === 'Completed').length > 0 && (
                <div className="pt-8 space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-normal">Engagement History</h3>
                  <div className="space-y-3 opacity-60">
                    {followUps.filter(f => f.status === 'Completed').map((f) => (
                      <div key={f.id} className="bg-white/50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 tracking-normal">{f.subject}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-normal">Completed on {new Date(f.completedDate || "").toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-normal">Archived</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Sales Intelligence</p>
                  <h4 className="text-xl font-bold font-headline tracking-normal">Pipeline Velocity</h4>
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400 tracking-normal">Active Engagement</span>
                    <span className="text-2xl font-bold font-headline tracking-normal">{followUps?.filter(f => f.status === 'Scheduled').length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400 tracking-normal">Conversion Rate</span>
                    <span className="text-2xl font-bold font-headline text-primary tracking-normal">18%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed tracking-normal border-t border-white/5 pt-6">
                  "Maintain a 48-hour follow-up window post-pitch to maximize conversion potential."
                </p>
              </Card>

              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-normal">Industry Vertical Map</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                    <span className="text-slate-400">Tech & SaaS</span>
                    <span className="text-slate-900">45%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '45%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                    <span className="text-slate-400">Lifestyle</span>
                    <span className="text-slate-900">30%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: '30%' }} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}