
"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  IndianRupee, 
  Calendar, 
  Loader2, 
  Settings, 
  Trash2, 
  Save, 
  Plus, 
  CheckCircle2, 
  MessageSquare,
  Zap,
  ArrowRight,
  TrendingUp,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, serverTimestamp, collection } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export default function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const leadRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "leads", leadId);
  }, [db, leadId, user]);
  const { data: lead, isLoading: isLeadLoading } = useDoc(leadRef);

  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    if (lead) {
      setEditData({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phone: lead.phone || "",
        industry: lead.industry || "",
        source: lead.source || "Instagram",
        priority: lead.priority || "Medium",
        status: lead.status || "Lead",
        estimatedBudget: lead.estimatedBudget || 0,
        notes: lead.notes || []
      });
    }
  }, [lead]);

  const handleUpdateLead = () => {
    if (!editData?.name || !leadRef) return;
    updateDocumentNonBlocking(leadRef, {
      ...editData,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Intelligence Synchronized", description: `${editData.name} profile has been updated.` });
  };

  const handleStatusChange = (newStatus: string) => {
    if (!leadRef) return;
    updateDocumentNonBlocking(leadRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    toast({ 
      title: "Phase Advanced", 
      description: `Lead has been moved to ${newStatus}.` 
    });
  };

  const handleDeleteLead = () => {
    if (!leadRef) return;
    deleteDocumentNonBlocking(leadRef);
    toast({ variant: "destructive", title: "Lead Purged", description: "Entity removed from the engine." });
    router.push("/pipeline");
  };

  const convertToProject = () => {
    if (!lead) return;
    const projectRef = doc(collection(db, "projects"));
    const clientRef = doc(collection(db, "clients"));
    
    setDocumentNonBlocking(clientRef, {
      id: clientRef.id,
      name: lead.company || lead.name,
      email: lead.email,
      phone: lead.phone,
      industry: lead.industry,
      status: "Active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    setDocumentNonBlocking(projectRef, {
      id: projectRef.id,
      name: `${lead.company || lead.name} - Initial Production`,
      clientId: clientRef.id,
      budget: lead.estimatedBudget,
      status: "Lead",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    updateDocumentNonBlocking(doc(db, "leads", lead.id), {
      status: "Won",
      updatedAt: serverTimestamp()
    });

    toast({ title: "Conversion Successful", description: "Lead converted to Client and Project." });
    router.push(`/projects/${projectRef.id}`);
  };

  if (isUserLoading || isLeadLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center tracking-normal">Syncing Lead Intelligence...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline tracking-normal">Lead Not Found</h2>
        <Button onClick={() => router.push("/pipeline")} className="font-bold tracking-normal">Return to Pipeline</Button>
      </div>
    );
  }

  const PRIORITY_COLORS: Record<string, string> = {
    Low: "bg-slate-100 text-slate-500",
    Medium: "bg-blue-50 text-blue-500",
    High: "bg-orange-50 text-orange-500",
    Hot: "bg-primary/10 text-primary"
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0"
            onClick={() => router.push("/pipeline")}
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">
                {lead.name}
              </h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                {lead.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 tracking-normal">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {lead.company || "Individual Lead"}
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {lead.industry || "General Industry"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors tracking-normal">
                <Settings className="h-4 w-4" />
                Configure Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Lead Profile</DialogTitle>
              </DialogHeader>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead Name</label>
                    <Input 
                      value={editData?.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Company Entity</label>
                    <Input 
                      value={editData?.company} 
                      onChange={(e) => setEditData({...editData, company: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Communication</label>
                    <Input 
                      value={editData?.email} 
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Contact Hotline</label>
                    <Input 
                      value={editData?.phone} 
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Priority Level</label>
                    <Select value={editData?.priority} onValueChange={(val) => setEditData({...editData, priority: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none tracking-normal">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Hot">Hot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Source</label>
                    <Select value={editData?.source} onValueChange={(val) => setEditData({...editData, source: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none tracking-normal">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Ads">Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Status phase</label>
                  <Select value={editData?.status} onValueChange={(val) => setEditData({...editData, status: val})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none tracking-normal">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Discussion">Discussion</SelectItem>
                      <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Estimated Budget (INR)</label>
                  <Input 
                    type="number"
                    value={editData?.estimatedBudget} 
                    onChange={(e) => setEditData({...editData, estimatedBudget: parseFloat(e.target.value) || 0})}
                    className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                  />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between">
                <DialogClose asChild>
                  <Button variant="ghost" onClick={handleDeleteLead} className="text-destructive font-bold text-xs uppercase tracking-normal hover:bg-destructive/5 hover:text-destructive gap-2">
                    <Trash2 className="h-4 w-4" />
                    Purge Lead
                  </Button>
                </DialogClose>
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleUpdateLead} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6 h-11 gap-2 tracking-normal">
                      <Save className="h-4 w-4" />
                      Sync Changes
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {lead.status !== 'Won' && (
            <Button onClick={convertToProject} className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
              <Zap className="h-4 w-4" />
              Won: Convert to Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Estimated Budget</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">₹{(lead.estimatedBudget || 0).toLocaleString('en-IN')}</h3>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Pipeline Phase</p>
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-10 w-full rounded-xl bg-slate-50 border-none font-bold text-xs tracking-normal shadow-none hover:bg-slate-100 transition-colors">
                <SelectValue placeholder="Select Phase" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="Lead" className="text-xs font-bold uppercase">Lead</SelectItem>
                <SelectItem value="Contacted" className="text-xs font-bold uppercase">Contacted</SelectItem>
                <SelectItem value="Discussion" className="text-xs font-bold uppercase">Discussion</SelectItem>
                <SelectItem value="Proposal Sent" className="text-xs font-bold uppercase">Proposal Sent</SelectItem>
                <SelectItem value="Negotiation" className="text-xs font-bold uppercase">Negotiation</SelectItem>
                <SelectItem value="Won" className="text-xs font-bold uppercase">Won</SelectItem>
                <SelectItem value="Lost" className="text-xs font-bold uppercase">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Source</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{lead.source || "Organic"}</h3>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${PRIORITY_COLORS[lead.priority || "Medium"]}`}>
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead Priority</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{lead.priority || "Medium"}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline tracking-normal">Lead Intelligence Summary</h3>
                <Badge variant="outline" className="rounded-lg px-4 py-1.5 text-[10px] font-bold tracking-normal uppercase border-slate-100">
                  Lead ID: #{lead.id.substring(0, 8).toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Communication</p>
                    <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold truncate tracking-normal">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Phone className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold tracking-normal">{lead.phone || "No Hotline"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Mapping</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">Industry</p>
                        <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">{lead.industry || "Unspecified"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">Lifecycle</p>
                        <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">{lead.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Sales Intelligence Brief</h4>
                <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                  <p className="text-sm font-medium leading-relaxed text-slate-600 italic tracking-normal">
                    "This lead shows high interest in {lead.industry || 'media production'} with an estimated budget of ₹{(lead.estimatedBudget || 0).toLocaleString('en-IN')}. Focus on {lead.status === 'Negotiation' ? 'closing arguments' : 'initial value proposition'} to drive conversion."
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline tracking-normal">Engagement Log</h3>
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2 tracking-normal">
                  <Plus className="h-4 w-4" /> Log Interaction
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-slate-50 rounded-[2rem]">
                <MessageSquare className="h-12 w-12 text-slate-200" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No recorded interactions</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold text-slate-50 uppercase tracking-normal">Conversion Path</p>
              <h4 className="text-xl font-bold font-headline tracking-normal">Next Strategic Step</h4>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative z-10">
              <p className="text-sm font-medium leading-relaxed text-slate-300 tracking-normal mb-6">
                {lead.status === 'Lead' ? "Initiate contact through WhatsApp or Email to gauge immediate requirements." : 
                 lead.status === 'Contacted' ? "Schedule a detailed discussion to explore creative requirements." :
                 lead.status === 'Discussion' ? "Prepare and transmit a strategic proposal based on the brief." :
                 lead.status === 'Proposal Sent' ? "Initiate negotiation on budget and deliverables." :
                 lead.status === 'Negotiation' ? "Finalize proposal details and secure budget approval." :
                 "Review engagement outcomes."}
              </p>
              <Button onClick={() => router.push('/pipeline')} className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-white/90 font-bold text-[10px] uppercase gap-2 tracking-normal">
                Go to Workspace <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-white p-10 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead Vitality</h4>
              <Badge className="bg-accent/10 text-accent border-none text-[8px] font-bold uppercase tracking-normal">OPTIMIZED</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                <span className="text-slate-400">Conversion Probability</span>
                <span className="text-slate-900">{lead.priority === 'Hot' ? '85%' : lead.priority === 'High' ? '65%' : '40%'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: lead.priority === 'Hot' ? '85%' : lead.priority === 'High' ? '65%' : '40%' }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
