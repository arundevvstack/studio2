
"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  IndianRupee, 
  Loader2, 
  Phone, 
  MessageSquare, 
  Mail, 
  Users, 
  CheckCircle2, 
  Zap,
  BarChart3,
  Globe,
  Star,
  ArrowRight,
  Filter,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import Link from "next/link";

import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  { id: "Lead", title: "Lead" },
  { id: "Contacted", title: "Contacted" },
  { id: "Proposal Sent", title: "Proposal Sent" },
  { id: "Negotiation", title: "Negotiation" },
  { id: "Won", title: "Won" },
  { id: "Lost", title: "Lost" }
];

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-500",
  Medium: "bg-blue-50 text-blue-500",
  High: "bg-orange-50 text-orange-500",
  Hot: "bg-primary/10 text-primary"
};

export default function PipelineEnginePage() {
  const db = useFirestore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStageTab, setActiveStageTab] = useState("Lead");

  // --- Data Streams ---
  const leadsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "leads"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: leads, isLoading: leadsLoading } = useCollection(leadsQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"));
  }, [db, user]);
  const { data: projects } = useCollection(projectsQuery);

  const followUpsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "followUps"), orderBy("scheduledAt", "asc"));
  }, [db, user]);
  const { data: followUps } = useCollection(followUpsQuery);

  const campaignsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
  }, [db, user]);
  const { data: campaigns } = useCollection(campaignsQuery);

  // --- Analytics Logic ---
  const stats = useMemo(() => {
    if (!leads) return { totalLeads: 0, conversionRate: 0, activeValue: 0, forecast: 0, leadCount: 0 };
    const won = leads.filter(l => l.status === 'Won').length;
    const total = leads.length;
    const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const activeValue = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').reduce((acc, curr) => acc + (curr.estimatedBudget || 0), 0);
    const leadCountInStage = leads.filter(l => l.status === 'Lead').length;
    return { totalLeads: total, conversionRate, activeValue, forecast: activeValue * 0.3, leadCount: leadCountInStage };
  }, [leads]);

  // --- Form Logic ---
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    estimatedBudget: "",
    source: "Instagram",
    priority: "Medium",
    industry: ""
  });

  const handleCreateLead = () => {
    if (!newLead.name || !newLead.email) return;
    const leadsRef = collection(db, "leads");
    addDocumentNonBlocking(leadsRef, {
      ...newLead,
      estimatedBudget: parseFloat(newLead.estimatedBudget) || 0,
      status: "Lead",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setNewLead({ name: "", company: "", email: "", phone: "", estimatedBudget: "", source: "Instagram", priority: "Medium", industry: "" });
    setIsAddingLead(false);
    toast({ title: "Lead Created", description: `${newLead.name} added to the engine.` });
  };

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(l => 
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">
              Strategic Pipeline Engine
            </h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
              <Zap className="h-3 w-3 mr-1" />
              Live Feed
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Marketing, sales, and follow-up operating system.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
            <DialogTrigger asChild>
              <Button className="h-12 flex-1 md:flex-none px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
                <Plus className="h-4 w-4" />
                New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
              <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">New Lead Portal</DialogTitle>
              </DialogHeader>
              <div className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead Name</label>
                    <Input value={newLead.name} onChange={(e) => setNewLead({...newLead, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Company Entity</label>
                    <Input value={newLead.company} onChange={(e) => setNewLead({...newLead, company: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="Nike Global" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Email Address</label>
                    <Input type="email" value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="j.doe@nike.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Phone Hotline</label>
                    <Input value={newLead.phone} onChange={(e) => setNewLead({...newLead, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="+1 555 0000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Source</label>
                    <Select value={newLead.source} onValueChange={(val) => setNewLead({...newLead, source: val})}>
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Priority Level</label>
                    <Select value={newLead.priority} onValueChange={(val) => setNewLead({...newLead, priority: val})}>
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
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Estimated Budget (INR)</label>
                  <Input type="number" value={newLead.estimatedBudget} onChange={(e) => setNewLead({...newLead, estimatedBudget: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="50000" />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6">
                <div className="flex gap-3 w-full">
                  <DialogClose asChild><Button variant="ghost" className="flex-1 font-bold text-xs uppercase tracking-normal">Cancel</Button></DialogClose>
                  <Button onClick={handleCreateLead} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-11 tracking-normal">Create Lead</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Leads</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{stats.totalLeads}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{stats.leadCount}</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Conversion Rate</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{stats.conversionRate}%</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Pipeline Value</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">₹{(stats.activeValue / 1000).toFixed(0)}k</h3>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Revenue Forecast</p>
            <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal text-white">₹{(stats.forecast / 1000).toFixed(0)}k</h3>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400 tracking-normal" 
            placeholder="Search leads by name or company..." 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm tracking-normal">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1">
          <TabsTrigger value="list" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Briefcase className="h-4 w-4" />
            Pipeline Ledger
          </TabsTrigger>
          <TabsTrigger value="followups" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Calendar className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="marketing" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Globe className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-8 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <BarChart3 className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="space-y-8">
            <Tabs value={activeStageTab} onValueChange={setActiveStageTab} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-slate-100/50 p-1 h-auto rounded-xl gap-1">
                  {STAGES.map((stage) => (
                    <TabsTrigger 
                      key={stage.id} 
                      value={stage.id} 
                      className="rounded-lg px-6 py-2 text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all tracking-normal"
                    >
                      {stage.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                    {filteredLeads.filter(l => l.status === activeStageTab).length} Entities
                  </span>
                </div>
              </div>

              {STAGES.map((stage) => (
                <TabsContent key={stage.id} value={stage.id} className="m-0 animate-in fade-in duration-300">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Lead Name</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-normal">Company Entity</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-normal">Source</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-normal">Priority</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-normal">Budget (INR)</TableHead>
                          <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadsLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-20">
                              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : filteredLeads.filter(l => l.status === stage.id).length > 0 ? (
                          filteredLeads.filter(l => l.status === stage.id).map((lead) => (
                            <TableRow key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                              <TableCell className="px-10 font-bold text-slate-900 tracking-normal">{lead.name}</TableCell>
                              <TableCell className="text-sm font-medium text-slate-600 tracking-normal">{lead.company || "—"}</TableCell>
                              <TableCell className="text-sm font-medium text-slate-600 tracking-normal">{lead.source || "—"}</TableCell>
                              <TableCell>
                                <Badge className={`text-[8px] font-bold uppercase rounded-md tracking-normal border-none ${PRIORITY_COLORS[lead.priority || "Medium"]}`}>
                                  {lead.priority || "Medium"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-slate-900 tracking-normal">₹{(lead.estimatedBudget || 0).toLocaleString('en-IN')}</TableCell>
                              <TableCell className="text-right px-10">
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-primary hover:text-white transition-all">
                                  <Link href={`/pipeline/leads/${lead.id}`}>
                                    <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-24">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
                                  <Search className="h-6 w-6 text-slate-200" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">No leads in this stage</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="followups" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <h3 className="text-xl font-bold font-headline tracking-normal">Active Engagement Schedule</h3>
              {followUps && followUps.filter(f => !f.completed).length > 0 ? (
                <div className="space-y-4">
                  {followUps.filter(f => !f.completed).map((f) => (
                    <Card key={f.id} className="border-none shadow-sm rounded-[2rem] p-8 flex items-center justify-between group hover:shadow-md transition-all bg-white">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          {f.type === 'WhatsApp' && <MessageSquare className="h-6 w-6 text-green-500" />}
                          {f.type === 'Call' && <Phone className="h-6 w-6 text-blue-500" />}
                          {f.type === 'Email' && <Mail className="h-6 w-6 text-primary" />}
                          {f.type === 'Meeting' && <Users className="h-6 w-6 text-orange-500" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 tracking-normal">
                            {leads?.find(l => l.id === f.leadId)?.name || "Unknown Lead"}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-normal">{f.type}</Badge>
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 tracking-normal">
                              <Calendar className="h-3 w-3" />
                              {new Date(f.scheduledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 bg-slate-50 hover:bg-accent hover:text-white transition-all">
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center bg-white/50">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No scheduled activities</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-4">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-bold text-slate-50 uppercase tracking-normal">Follow-up Velocity</p>
                  <h4 className="text-xl font-bold font-headline tracking-normal">Response Efficiency</h4>
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400 font-medium">Avg Response Time</span>
                    <span className="text-2xl font-bold font-headline tracking-normal">2.4h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400 font-medium">Weekly Activities</span>
                    <span className="text-2xl font-bold font-headline text-primary tracking-normal">{followUps?.length || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((c) => (
                <Card key={c.id} className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl transition-all">
                  <CardHeader className="p-10 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-bold uppercase tracking-normal">{c.channel}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold font-headline tracking-normal">{c.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Budget</p>
                        <p className="text-lg font-bold text-slate-900 tracking-normal">₹{c.budget.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Leads</p>
                        <p className="text-lg font-bold text-slate-900 tracking-normal">{c.leadsGenerated}</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-normal mb-2">
                        <span className="text-slate-400">ROI Performance</span>
                        <span className="text-accent">+{c.ROI}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.min(c.ROI / 2, 100)}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-24 border-2 border-dashed border-slate-100 rounded-[3rem] text-center bg-white/50">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No active marketing campaigns</p>
                <Button className="mt-4 rounded-xl font-bold text-xs uppercase tracking-normal h-10 px-6">Launch Campaign</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[3rem] bg-white p-12">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-bold font-headline tracking-normal">Sales Intelligence Core</h3>
                <p className="text-sm text-slate-500 font-medium tracking-normal">Visualizing pipeline performance and growth vectors.</p>
              </div>
              <Button variant="outline" className="rounded-xl h-11 px-6 font-bold text-xs uppercase gap-2 border-slate-100 tracking-normal">
                <BarChart3 className="h-4 w-4" />
                Export Brief
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Conversion Efficiency</p>
                  <h4 className="text-5xl font-bold font-headline tracking-normal text-primary">{stats.conversionRate}%</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                    <span className="text-slate-400">Benchmark Goal</span>
                    <span className="text-slate-900">25%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stats.conversionRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Opportunity Value</p>
                  <h4 className="text-5xl font-bold font-headline tracking-normal text-slate-900">₹{(stats.activeValue / 1000).toFixed(0)}k</h4>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-normal italic">
                  "Aggregate capital potential currently moving through strategic stages."
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Monthly Inflow Forecast</p>
                  <h4 className="text-5xl font-bold font-headline tracking-normal text-accent">₹{(stats.forecast / 1000).toFixed(0)}k</h4>
                </div>
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                  <p className="text-xs text-accent font-bold uppercase tracking-normal mb-1 flex items-center gap-2">
                    <Star className="h-3 w-3" />
                    Growth Vector
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium tracking-normal">Predicted revenue based on 30% pipeline conversion probability.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
