"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  SendHorizontal,
  Loader2,
  IndianRupee,
  MapPin,
  Tag,
  Sparkles,
  Layers
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

const PROJECT_TYPES = [
  "TV Commercials (TVC)", "Digital Ad Film Production", "Performance Marketing Ads", 
  "Brand Commercials", "Product Launch Videos", "Campaign Ads", "AI VFX Production", 
  "Explainer Videos", "Motion Graphics", "AI 3D Animation", "AI 2D Animation", 
  "AI Video Production", "AI Avatar Videos", "AI Image Generation", 
  "AI Ad Creative Production", "AI Content Repurposing", "AI Voice Cloning", 
  "Synthetic Media Production", "Reels / Shorts Production", "Influencer Content Production", 
  "UGC (User Generated Content)", "YouTube Content Production", "Trend Content Production", 
  "Product Photography", "Product Demo Videos", "Amazon / Flipkart Listing Media", 
  "360° Product Spin Videos", "Lifestyle Product Shoots", "Corporate Profile Films", 
  "Company Overview Videos", "Internal Training Videos", "CSR Films", 
  "Property Walkthrough Videos", "Virtual Tours", "Architectural Visualization", 
  "Builder Branding Films", "Podcast Production"
];

const PHASE_ROADMAP = {
  "Discussion": [
    { name: "Initial Alignment Meeting", priority: "High", assignedRole: "Producer", subActivities: ["Internal discussion", "Client review call", "Feedback documentation", "Change confirmation", "Next step approval"] }
  ],
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
    { name: "Preview & Final Audit", priority: "High", assignedRole: "Creative Director", subActivities: ["Internal preview", "Ready to release check", "Format validation", "Asset verification"] }
  ],
  "Social Media": [
    { name: "Engagement Strategy Review", priority: "Medium", assignedRole: "Social Media Lead", subActivities: ["Internal discussion", "Client review call", "Feedback documentation", "Change confirmation", "Next step approval"] }
  ]
};

export default function AddProjectPage() {
  const router = useRouter();
  const db = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db]);

  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    clientId: "",
    description: "",
    budget: "",
    location: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId || !formData.type) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please provide a project name, select a vertical, and identify a client."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const batch = writeBatch(db);
      const projectRef = doc(collection(db, "projects"));
      const projectId = projectRef.id;

      const projectData = {
        id: projectId,
        name: formData.name,
        type: formData.type,
        clientId: formData.clientId,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
        location: formData.location,
        status: "Discussion",
        progress: 10,
        crew: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(projectRef, projectData);

      // Provision Roadmap Objectives
      Object.entries(PHASE_ROADMAP).forEach(([phase, objectives]) => {
        objectives.forEach(obj => {
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
      });

      await batch.commit();
      
      toast({ title: "Success", description: `${formData.name} has been initiated with a strategic roadmap.` });
      router.push("/projects");
    } catch (error) {
      console.error("Error initiating project:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-6">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white border-slate-200 shadow-sm shrink-0" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-tight">Initiate Project</h1>
          <p className="text-slate-500 mt-1 font-medium tracking-normal">Deploy a new high-growth media production entity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
        
        <div className="p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">Project Title</label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Nike Summer '24" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 font-bold tracking-normal focus-visible:ring-primary/20" required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">Project Vertical</label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 font-bold tracking-normal focus:ring-primary/20">
                  <SelectValue placeholder="Identify production type..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[400px]">
                  {PROJECT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="font-medium tracking-normal">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Client</label>
              <Select onValueChange={(val) => setFormData({...formData, clientId: val})} value={formData.clientId}>
                <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 font-bold tracking-normal focus:ring-primary/20">
                  <SelectValue placeholder={isLoadingClients ? "Syncing partners..." : "Identify client..."} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="font-medium tracking-normal">{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">Quote Price (INR)</label>
              <div className="relative">
                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input name="budget" type="number" value={formData.budget} onChange={handleInputChange} placeholder="e.g. 50,000" className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 font-bold tracking-normal focus-visible:ring-primary/20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">Project Hub (Location)</label>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Select value={formData.location} onValueChange={(val) => setFormData({...formData, location: val})}>
                  <SelectTrigger className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 font-bold tracking-normal focus-visible:ring-primary/20">
                    <SelectValue placeholder="Select hub location..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
                    {KERALA_DISTRICTS.map(district => (
                      <SelectItem key={district} value={district} className="tracking-normal">{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">Roadmap Status</label>
              <div className="h-14 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 flex items-center px-6 gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auto-Provisioning Enabled</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">Executive Brief</label>
            <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Outline the core creative direction, target demographics, and key deliverables..." className="min-h-[180px] rounded-[2rem] bg-slate-50 border-none shadow-inner text-base p-8 focus-visible:ring-primary/20 resize-none placeholder:text-slate-400 tracking-normal font-medium" />
          </div>
        </div>

        <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-end gap-10">
          <Button type="button" variant="ghost" className="text-slate-900 font-bold text-sm hover:bg-transparent tracking-normal" onClick={() => router.back()}>Discard</Button>
          <Button type="submit" disabled={isSubmitting || !formData.clientId || !formData.type} className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 gap-3 group tracking-normal transition-all active:scale-[0.98]">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Initiate Roadmap <SendHorizontal className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>}
          </Button>
        </div>
      </form>
    </div>
  );
}
