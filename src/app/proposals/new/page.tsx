
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  SendHorizontal, 
  Loader2, 
  Sparkles,
  Building2,
  Briefcase,
  Target,
  List,
  Layers,
  IndianRupee,
  Calendar,
  Zap,
  GitBranch,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const PROJECT_TYPES = ["Ad Film", "Social Media Campaign", "AI Content", "Corporate Video", "Product Shoot", "Influencer Campaign", "Other"];
const PLATFORMS = ["Instagram", "YouTube", "TV", "Meta Ads", "Website", "Other"];
const SCOPE_ITEMS = [
  "Pre Production", "Production", "Post Production", "AI Content Creation", 
  "Influencer Marketing", "Social Media Management", "Media Buying", 
  "CGI / VFX", "Photography", "Other"
];

export default function NewProposalPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceType, setSourceType] = useState<"manual" | "lead" | "project">("manual");

  // --- Data Streams for Selection ---
  const leadsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "leads"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: leads } = useCollection(leadsQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: projects } = useCollection(projectsQuery);

  const [formData, setFormData] = useState({
    clientName: "",
    brandName: "",
    projectTitle: "",
    projectType: "",
    objective: "",
    targetAudience: "",
    deliverables: "",
    platforms: [] as string[],
    budgetRange: "",
    timeline: "",
    scope: [] as string[],
  });

  const handleToggle = (listName: 'platforms' | 'scope', value: string) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].includes(value)
        ? prev[listName].filter(item => item !== value)
        : [...prev[listName], value]
    }));
  };

  const handleSourceSelect = (id: string) => {
    if (sourceType === 'lead') {
      const lead = leads?.find(l => l.id === id);
      if (lead) {
        setFormData(prev => ({
          ...prev,
          clientName: lead.name || "",
          brandName: lead.company || "",
          budgetRange: lead.estimatedBudget ? `₹${lead.estimatedBudget.toLocaleString('en-IN')}` : "",
          objective: `Strategic engagement for ${lead.industry || 'media production'}.`,
        }));
        toast({ title: "Lead Intel Synced", description: `Proposal populated with data from ${lead.name}.` });
      }
    } else if (sourceType === 'project') {
      const project = projects?.find(p => p.id === id);
      if (project) {
        setFormData(prev => ({
          ...prev,
          projectTitle: project.name || "",
          projectType: PROJECT_TYPES.includes(project.type) ? project.type : "Other",
          budgetRange: project.budget ? `₹${project.budget.toLocaleString('en-IN')}` : "",
          objective: project.description || "",
        }));
        toast({ title: "Project Assets Synced", description: `Proposal populated with production details for ${project.name}.` });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.projectTitle || !formData.projectType) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Identify client, project, and type to proceed." });
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "proposals"), {
        ...formData,
        status: "Draft",
        creatorId: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Proposal Initiated", description: "Draft saved. Proceeding to strategic synthesis." });
      router.push(`/proposals/${docRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-start gap-6">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">New Strategic Bid</h1>
          <p className="text-slate-500 mt-1 font-medium">Define production parameters or select from your pipeline for automated synthesis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/3 space-y-3">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategy Source</Label>
              <Select value={sourceType} onValueChange={(val: any) => setSourceType(val)}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm shadow-inner px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl">
                  <SelectItem value="manual" className="font-medium">Manual Entry</SelectItem>
                  <SelectItem value="lead" className="font-medium">From Pipeline Lead</SelectItem>
                  <SelectItem value="project" className="font-medium">From Active Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sourceType !== 'manual' && (
              <div className="flex-1 space-y-3 animate-in slide-in-from-left-2 duration-300 w-full">
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
                  {sourceType === 'lead' ? 'Identify Target Lead' : 'Select Production Asset'}
                </Label>
                <Select onValueChange={handleSourceSelect}>
                  <SelectTrigger className="h-14 rounded-2xl bg-primary/5 border-2 border-primary/10 font-bold text-sm shadow-inner px-6 text-primary">
                    <SelectValue placeholder={sourceType === 'lead' ? "Search pipeline..." : "Search projects..."} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-xl max-h-[300px]">
                    {sourceType === 'lead' ? (
                      leads?.map(l => (
                        <SelectItem key={l.id} value={l.id} className="font-medium">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-3.5 w-3.5" /> {l.name} {l.company ? `(${l.company})` : ''}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      projects?.map(p => (
                        <SelectItem key={p.id} value={p.id} className="font-medium">
                          <div className="flex items-center gap-2">
                            <Folder className="h-3.5 w-3.5" /> {p.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden relative border border-slate-50">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
        
        <div className="p-12 space-y-12">
          {/* Identity Section */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 className="h-3 w-3" /> Client Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Partnership Entity</Label>
                <Input value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="e.g. Nike Global" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" required />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Brand</Label>
                <Input value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} placeholder="e.g. Jordan Brand" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" />
              </div>
            </div>
          </div>

          {/* Project Parameters */}
          <div className="space-y-8 pt-8 border-t border-slate-50">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Briefcase className="h-3 w-3" /> Project Matrix
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Project Title</Label>
                  <Input value={formData.projectTitle} onChange={e => setFormData({...formData, projectTitle: e.target.value})} placeholder="e.g. Summer '24 Campaign" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" required />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Execution Vertical</Label>
                  <Select value={formData.projectType} onValueChange={val => setFormData({...formData, projectType: val})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner px-6"><SelectValue placeholder="Identify type..." /></SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl">
                      {PROJECT_TYPES.map(t => <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Target className="h-3 w-3" /> Strategic Objective
                </Label>
                <Textarea value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} placeholder="What is the core problem we are solving?" className="min-h-[120px] rounded-[2rem] bg-slate-50 border-none shadow-inner p-8 text-base font-medium resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Demographic</Label>
                  <Input value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} placeholder="e.g. Gen Z Athletes" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Deliverables</Label>
                  <Input value={formData.deliverables} onChange={e => setFormData({...formData, deliverables: e.target.value})} placeholder="e.g. 3x TVC, 10x Reels" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                </div>
              </div>
            </div>
          </div>

          {/* Scope & Logistics */}
          <div className="space-y-8 pt-8 border-t border-slate-50">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Layers className="h-3 w-3" /> Scope & Logistics
            </h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Operational Scope</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SCOPE_ITEMS.map(item => (
                    <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => handleToggle('scope', item)}>
                      <Checkbox checked={formData.scope.includes(item)} onCheckedChange={() => handleToggle('scope', item)} className="rounded-lg border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-normal">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <IndianRupee className="h-3 w-3" /> Investment Range
                  </Label>
                  <Input value={formData.budgetRange} onChange={e => setFormData({...formData, budgetRange: e.target.value})} placeholder="e.g. ₹5L - ₹8L" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Delivery Timeline
                  </Label>
                  <Input value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} placeholder="e.g. 4 Weeks" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-12 flex items-center justify-end gap-10">
          <Button type="button" variant="ghost" className="text-slate-500 font-bold text-sm uppercase tracking-widest hover:bg-transparent" onClick={() => router.back()}>Discard</Button>
          <Button type="submit" disabled={isSubmitting} className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-2xl shadow-primary/20 gap-3 group transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                Initiate Synthesis
                <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
