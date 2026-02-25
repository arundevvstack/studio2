
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  SendHorizontal, 
  Loader2, 
  Sparkles,
  Building2,
  Briefcase,
  Target,
  Layers,
  IndianRupee,
  Zap,
  GitBranch,
  Folder,
  Plus,
  Trash2,
  RotateCcw,
  Users,
  Target as TargetIcon,
  Tag,
  Save,
  CheckCircle2
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
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, doc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const DEFAULT_PROJECT_TYPES = [
  "Ad Film", 
  "Social Media Campaign", 
  "AI Content", 
  "Corporate Video", 
  "Product Shoot", 
  "Influencer Campaign", 
  "Synthetic Media", 
  "UGC Content", 
  "Other"
];

const PLATFORMS = ["Instagram", "YouTube", "TV", "Meta Ads", "TikTok", "LinkedIn", "Website", "Other"];

const SCOPE_ITEMS = [
  "Pre Production", "Production", "Post Production", "AI Content Creation", 
  "Influencer Marketing", "Social Media Management", "Media Buying", 
  "CGI / VFX", "Photography", "Sound Design", "Other"
];

const VERTICAL_MAPPING: Record<string, { scope: string[], deliverables: string }> = {
  "Ad Film": {
    scope: ["Pre Production", "Production", "Post Production", "CGI / VFX"],
    deliverables: "1x 30s Master TVC, 2x 15s Social Cut-downs"
  },
  "Social Media Campaign": {
    scope: ["Production", "Post Production", "Social Media Management", "Influencer Marketing"],
    deliverables: "12x Reels, 20x Stories, 1x Campaign Wrap Video"
  },
  "AI Content": {
    scope: ["AI Content Creation", "Post Production", "CGI / VFX"],
    deliverables: "5x AI Synthesized Ad Creatives, 1x Brand Avatar Message"
  },
  "Corporate Video": {
    scope: ["Pre Production", "Production", "Post Production"],
    deliverables: "1x 3min Brand Story, 1x 60s Executive Summary"
  },
  "Product Shoot": {
    scope: ["Production", "Photography", "Post Production"],
    deliverables: "25x Professional Stills, 1x 15s Product Spotlight"
  },
  "Influencer Campaign": {
    scope: ["Influencer Marketing", "Social Media Management", "Media Buying"],
    deliverables: "Campaign Management with 5x Influencers"
  },
  "Synthetic Media": {
    scope: ["AI Content Creation", "CGI / VFX", "Post Production"],
    deliverables: "AI Voice Cloning + 3x Virtual Character Videos"
  },
  "UGC Content": {
    scope: ["Production", "Post Production", "Influencer Marketing"],
    deliverables: "10x Authentic UGC Creator Videos"
  }
};

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function NewProposalPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceType, setSourceType] = useState<"manual" | "lead" | "project">("manual");

  const [formData, setFormData] = useState({
    clientName: "",
    brandName: "",
    projectTitle: "",
    projectType: "",
    objective: "",
    targetAudience: "",
    deliverables: "",
    platforms: [] as string[],
    timeline: "",
    scope: [] as string[],
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Strategic Production Services", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // --- Data Streams ---
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

  const projectSettingsRef = useMemoFirebase(() => doc(db, "settings", "projects"), [db]);
  const { data: projectSettings, isLoading: isLoadingSettings } = useDoc(projectSettingsRef);

  const serviceTypes = useMemo(() => {
    return projectSettings?.serviceTypes || DEFAULT_PROJECT_TYPES;
  }, [projectSettings]);

  const handleToggle = useCallback((listName: 'platforms' | 'scope', value: string) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].includes(value)
        ? prev[listName].filter(item => item !== value)
        : [...prev[listName], value]
    }));
  }, []);

  const handleProjectTypeChange = useCallback((val: string) => {
    const mapping = VERTICAL_MAPPING[val];
    setFormData(prev => ({
      ...prev,
      projectType: val,
      scope: mapping ? [...mapping.scope] : prev.scope,
      deliverables: (mapping && !prev.deliverables) ? mapping.deliverables : prev.deliverables
    }));
    
    if (mapping) {
      toast({ 
        title: "Vertical Sync", 
        description: `Applied standard parameters for ${val}.` 
      });
    }
  }, []);

  const handleSourceSelect = useCallback((id: string) => {
    if (sourceType === 'lead') {
      const lead = leads?.find(l => l.id === id);
      if (lead) {
        const matchedType = serviceTypes.find((t: string) => 
          lead.industry?.toLowerCase().includes(t.toLowerCase()) || 
          lead.deliverables?.toLowerCase().includes(t.toLowerCase())
        ) || "Other";
        
        const defaults = VERTICAL_MAPPING[matchedType];

        setFormData(prev => ({
          ...prev,
          clientName: lead.name || "",
          brandName: lead.company || "",
          projectTitle: `${lead.company || lead.name} - Strategic Bid`,
          objective: `Strategic engagement for ${lead.industry || 'targeted industry'}. Source: ${lead.source}.`,
          deliverables: lead.deliverables || defaults?.deliverables || "",
          projectType: matchedType,
          scope: defaults ? [...defaults.scope] : prev.scope
        }));

        setLineItems([{ 
          description: "Project Mobilization & Execution Services", 
          quantity: 1, 
          unitPrice: lead.estimatedBudget || 0, 
          total: lead.estimatedBudget || 0 
        }]);

        toast({ title: "Lead Ingested", description: `Synchronized with ${lead.name}'s pipeline data.` });
      }
    } else if (sourceType === 'project') {
      const project = projects?.find(p => p.id === id);
      if (project) {
        const matchedType = serviceTypes.includes(project.type) ? project.type : "Other";
        const defaults = VERTICAL_MAPPING[matchedType];
        
        setFormData(prev => ({
          ...prev,
          clientName: project.clientName || "",
          brandName: project.clientName || "",
          projectTitle: project.name || "",
          projectType: matchedType,
          objective: project.description || "",
          deliverables: defaults?.deliverables || prev.deliverables,
          scope: defaults ? [...defaults.scope] : prev.scope
        }));

        setLineItems([{ 
          description: "Production Renewal / Extension", 
          quantity: 1, 
          unitPrice: project.budget || 0, 
          total: project.budget || 0 
        }]);

        toast({ title: "Project Ingested", description: `Cloned parameters from ${project.name}.` });
      }
    }
  }, [sourceType, leads, projects, serviceTypes]);

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    setLineItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        item.total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      }
      updated[index] = item;
      return updated;
    });
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };

  const totalInvestment = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [lineItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.projectTitle || !formData.projectType) {
      toast({ variant: "destructive", title: "Incomplete Parameters", description: "Identify client, title, and type." });
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "proposals"), {
        ...formData,
        lineItems,
        totalBudget: totalInvestment,
        budgetRange: `₹${totalInvestment.toLocaleString('en-IN')}`, 
        status: "Draft",
        creatorId: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Bid Deployed", description: "Draft saved. Proceeding to strategy synthesis." });
      router.push(`/proposals/${docRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Persistence Error", description: error.message });
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
          <p className="text-sm text-slate-500 mt-1 font-medium">Provision production parameters for automated AI synthesis.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/3 space-y-3">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Source Logic</Label>
            <Select value={sourceType} onValueChange={(val: any) => setSourceType(val)}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm shadow-inner px-6 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="lead">Pipeline Lead</SelectItem>
                <SelectItem value="project">Active Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sourceType !== 'manual' && (
            <div className="flex-1 space-y-3 animate-in slide-in-from-left-2 duration-300 w-full">
              <Label className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
                {sourceType === 'lead' ? 'Identify Target Lead' : 'Synchronize Project'}
              </Label>
              <Select key={sourceType} onValueChange={handleSourceSelect}>
                <SelectTrigger className="h-14 rounded-2xl bg-primary/5 border-2 border-primary/10 font-bold text-sm shadow-inner px-6 text-primary focus:ring-primary/20">
                  <SelectValue placeholder={sourceType === 'lead' ? "Identify lead..." : "Select project..."} />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl max-h-[300px]">
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

      <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden relative border border-slate-50">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
        
        <div className="p-12 space-y-12">
          {/* Identity */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 className="h-3 w-3" /> Partner Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Organization Name</Label>
                <Input value={formData.clientName} onChange={e => setFormData(prev => ({...prev, clientName: e.target.value}))} placeholder="e.g. Nike Global" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" required />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Brand Vertical</Label>
                <Input value={formData.brandName} onChange={e => setFormData(prev => ({...prev, brandName: e.target.value}))} placeholder="e.g. Jordan Brand" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" />
              </div>
            </div>
          </div>

          {/* Matrix */}
          <div className="space-y-8 pt-8 border-t border-slate-50">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Briefcase className="h-3 w-3" /> Project Matrix
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Project Title</Label>
                  <Input value={formData.projectTitle} onChange={e => setFormData(prev => ({...prev, projectTitle: e.target.value}))} placeholder="e.g. Summer '24 Ad Film" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" required />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Execution Vertical</Label>
                    {formData.projectType && (
                      <Button type="button" variant="ghost" onClick={() => handleProjectTypeChange(formData.projectType)} className="h-6 text-[9px] font-bold text-primary gap-1 uppercase hover:bg-primary/5">
                        <RotateCcw className="h-3 w-3" /> Refresh Defaults
                      </Button>
                    )}
                  </div>
                  <Select value={formData.projectType} onValueChange={handleProjectTypeChange}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner px-6">
                      <SelectValue placeholder={isLoadingSettings ? "Syncing verticals..." : "Identify vertical..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl">
                      {serviceTypes.map((t: string) => <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Demographic</Label>
                  <Input value={formData.targetAudience} onChange={e => setFormData(prev => ({...prev, targetAudience: e.target.value}))} placeholder="e.g. Gen Z Athletes in KL" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Deliverables Benchmark</Label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input value={formData.deliverables} onChange={e => setFormData(prev => ({...prev, deliverables: e.target.value}))} placeholder="e.g. 3x TVC, 10x Reels" className="h-14 rounded-2xl bg-slate-50 border-none pl-14 shadow-inner font-bold" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategic Objective</Label>
                <Textarea value={formData.objective} onChange={e => setFormData(prev => ({...prev, objective: e.target.value}))} placeholder="Outline the core problem we are solving..." className="min-h-[120px] rounded-[2rem] bg-slate-50 border-none shadow-inner p-8 text-base font-medium resize-none" />
              </div>
            </div>
          </div>

          {/* Ledger */}
          <div className="space-y-8 pt-8 border-t border-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <IndianRupee className="h-3 w-3" /> Financial Ledger
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-8 rounded-xl font-bold text-[9px] uppercase gap-2 border-slate-100">
                <Plus className="h-3 w-3" /> Add Service
              </Button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="col-span-6 space-y-2">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Service Description</Label>
                    <Input value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} placeholder="Service description..." className="h-10 rounded-xl bg-white border-none shadow-sm font-medium" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Qty</Label>
                    <Input type="number" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', e.target.value)} className="h-10 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Rate</Label>
                    <Input type="number" value={item.unitPrice} onChange={e => updateLineItem(idx, 'unitPrice', e.target.value)} className="h-10 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="col-span-1 pb-1 flex justify-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(idx)} className="h-8 w-8 rounded-full text-slate-300 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-6">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregate Investment</p>
                <h4 className="text-4xl font-bold text-white tracking-tight leading-none">₹{totalInvestment.toLocaleString('en-IN')}</h4>
              </div>
              <div className="space-y-3 w-full md:w-48">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Timeline</Label>
                <Input value={formData.timeline} onChange={e => setFormData(prev => ({...prev, timeline: e.target.value}))} placeholder="e.g. 4-6 Weeks" className="h-12 bg-white/5 border-none text-white font-bold shadow-inner px-6 placeholder:text-slate-700" />
              </div>
            </div>
          </div>

          {/* Scope & Platforms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers className="h-3 w-3" /> Operational Scope
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {SCOPE_ITEMS.map(item => (
                  <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => handleToggle('scope', item)}>
                    <Checkbox checked={formData.scope.includes(item)} onCheckedChange={() => {}} className="rounded-lg border-slate-200 pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-normal">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="h-3 w-3" /> Target Platforms
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(item => (
                  <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => handleToggle('platforms', item)}>
                    <Checkbox checked={formData.platforms.includes(item)} onCheckedChange={() => {}} className="rounded-lg border-slate-200 pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-normal">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-12 flex items-center justify-end gap-10">
          <Button type="button" variant="ghost" className="text-slate-500 font-bold text-sm uppercase tracking-widest hover:bg-transparent" onClick={() => router.back()}>Discard</Button>
          <Button type="submit" disabled={isSubmitting} className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-2xl shadow-primary/20 gap-3 group transition-all active:scale-[0.98]">
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                Save & Initiate Synthesis
                <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
