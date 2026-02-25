
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
  Clock,
  Package,
  PieChart as PieChartIcon,
  Layers,
  Rocket
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import Link from "next/link";

import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  { id: "Lead", title: "Lead" },
  { id: "Contacted", title: "Contacted" },
  { id: "Discussion", title: "Discussion" },
  { id: "Proposal Sent", title: "Proposal" },
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

const CHART_COLORS = ['#2E86C1', '#4CAF50', '#F39C12', '#9B59B6', '#E74C3C', '#1ABC9C'];

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
    if (!leads) return { 
      totalLeads: 0, 
      conversionRate: 0, 
      activeValue: 0, 
      forecast: 0, 
      leadCount: 0,
      sourceData: [],
      industryData: []
    };

    const won = leads.filter(l => l.status === 'Won').length;
    const total = leads.length;
    const activeLeads = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
    
    const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const activeValue = activeLeads.reduce((acc, curr) => acc + (curr.estimatedBudget || 0), 0);
    const leadCountInStage = leads.filter(l => l.status === 'Lead').length;

    // Source Distribution
    const sources = activeLeads.reduce((acc: any, lead) => {
      const src = lead.source || 'Other';
      acc[src] = (acc[src] || 0) + (lead.estimatedBudget || 0);
      return acc;
    }, {});
    const sourceData = Object.entries(sources).map(([name, value]) => ({ name, value }));

    // Industry Distribution
    const industries = activeLeads.reduce((acc: any, lead) => {
      const ind = lead.industry || 'General';
      acc[ind] = (acc[ind] || 0) + 1;
      return acc;
    }, {});
    const industryData = Object.entries(industries).map(([name, value]) => ({ name, value }));

    return { 
      totalLeads: total, 
      conversionRate, 
      activeValue, 
      forecast: activeValue * 0.3, 
      leadCount: leadCountInStage,
      sourceData,
      industryData
    };
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
    industry: "",
    deliverables: ""
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
    setNewLead({ name: "", company: "", email: "", phone: "", estimatedBudget: "", source: "Instagram", priority: "Medium", industry: "", deliverables: "" });
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-bold font-headline text-slate-900 tracking-normal leading-tight">
              Strategic Pipeline
            </h1>
            <Badge className="bg-primary/10 text-primary border-none text-[8px] sm:text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
              <Zap className="h-3 w-3 mr-1" />
              Live Feed
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal">
            Marketing, sales, and follow-up operating system.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
            <DialogTrigger asChild>
              <Button className="h-12 flex-1 md:flex-none px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal transition-all active:scale-95 text-xs uppercase">
                <Plus className="h-4 w-4" />
                New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
              <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-xl sm:text-2xl font-bold font-headline tracking-normal">New Lead Portal</DialogTitle>
              </DialogHeader>
              <div className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead Name</label>
                    <Input value={newLead.name} onChange={(e) => setNewLead({...newLead, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Company Entity</label>
                    <Input value={newLead.company} onChange={(e) => setNewLead({...newLead, company: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="Nike Global" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Email Address</label>
                    <Input type="email" value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="j.doe@nike.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Phone Hotline</label>
                    <Input value={newLead.phone} onChange={(e) => setNewLead({...newLead, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="+1 555 0000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Estimated Budget (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      <Input type="number" value={newLead.estimatedBudget} onChange={(e) => setNewLead({...newLead, estimatedBudget: e.target.value})} className="h-12 pl-10 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="50000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Deliverables Summary</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      <Input value={newLead.deliverables} onChange={(e) => setNewLead({...newLead, deliverables: e.target.value})} className="h-12 pl-10 rounded-xl bg-slate-50 border-none tracking-normal" placeholder="e.g. 5x Reels, 1x TVC" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <DialogClose asChild><Button variant="ghost" className="flex-1 font-bold text-xs uppercase tracking-normal order-2 sm:order-1">Cancel</Button></DialogClose>
                  <Button onClick={handleCreateLead} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-11 tracking-normal order-1 sm:order-2">Create Lead</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: "Leads", val: stats.totalLeads, icon: Users, color: "bg-primary/5 text-primary" },
          { label: "Inbox", val: stats.leadCount, icon: Sparkles, color: "bg-blue-50 text-blue-500" },
          { label: "CR", val: `${stats.conversionRate}%`, icon: Target, color: "bg-accent/10 text-accent" },
          { label: "Value", val: `₹${(stats.activeValue / 1000).toFixed(0)}k`, icon: IndianRupee, color: "bg-slate-50 text-slate-600" },
          { label: "Forecast", val: `₹${(stats.forecast / 1000).toFixed(0)}k`, icon: TrendingUp, color: "bg-slate-900 text-white", dark: true }
        ].map((s, i) => (
          <Card key={i} className={`border-none shadow-sm rounded-[2rem] p-5 sm:p-8 space-y-3 sm:space-y-4 relative overflow-hidden ${s.dark ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            {s.dark && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full -mr-12 -mt-12" />}
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center relative z-10 ${s.dark ? 'bg-white/10' : s.color}`}>
              <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.dark ? 'text-primary' : ''}`} />
            </div>
            <div className="relative z-10">
              <p className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${s.dark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
              <h3 className="text-xl sm:text-3xl font-bold font-headline mt-1 tracking-tight">{s.val}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 sm:h-14 bg-white border-none shadow-sm rounded-xl text-sm sm:text-base placeholder:text-slate-400 tracking-normal" 
            placeholder="Search leads..." 
          />
        </div>
        <Button variant="outline" className="h-12 sm:h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm text-xs uppercase tracking-widest">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1 flex w-full overflow-x-auto no-scrollbar">
          {[
            { id: "list", icon: Briefcase, label: "Ledger" },
            { id: "followups", icon: Calendar, label: "Schedule" },
            { id: "marketing", icon: Globe, label: "Campaigns" },
            { id: "analytics", icon: BarChart3, label: "Intel" }
          ].map(t => (
            <TabsTrigger key={t.id} value={t.id} className="flex-1 rounded-xl px-4 sm:px-8 py-3 text-[10px] font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest whitespace-nowrap">
              <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="list" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="space-y-6">
            <div className="w-full overflow-x-auto no-scrollbar pb-2">
              <Tabs value={activeStageTab} onValueChange={setActiveStageTab} className="w-full">
                <TabsList className="bg-slate-100/50 p-1 h-auto rounded-xl gap-1 inline-flex">
                  {STAGES.map((stage) => (
                    <TabsTrigger 
                      key={stage.id} 
                      value={stage.id} 
                      className="rounded-lg px-4 sm:px-6 py-2 text-[9px] sm:text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all tracking-widest whitespace-nowrap"
                    >
                      {stage.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-6 sm:px-10 text-[10px] font-bold uppercase tracking-widest">Lead Identity</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest hidden sm:table-cell">Deliverables</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Priority</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Budget (INR)</TableHead>
                      <TableHead className="text-right px-6 sm:px-10 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20">
                          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredLeads.filter(l => l.status === activeStageTab).length > 0 ? (
                      filteredLeads.filter(l => l.status === activeStageTab).map((lead) => (
                        <TableRow key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                          <TableCell className="px-6 sm:px-10 py-5 sm:py-6">
                            <div>
                              <p className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">{lead.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{lead.company || "Individual Entity"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-500 tracking-widest hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <Package className="h-3 w-3 text-slate-300" />
                              <span className="truncate max-w-[150px]">{lead.deliverables || "No deliverables defined"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`text-[8px] font-bold uppercase rounded-md tracking-widest border-none px-3 py-1 ${PRIORITY_COLORS[lead.priority || "Medium"]}`}>
                              {lead.priority || "Medium"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 tracking-tight text-xs sm:text-sm">₹{(lead.estimatedBudget || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right px-6 sm:px-10">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                              <Link href={`/pipeline/leads/${lead.id}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-24 px-6">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                              <Search className="h-6 w-6 text-slate-200" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No leads in this stage</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="followups" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-8 space-y-6">
              <h3 className="text-lg sm:text-xl font-bold font-headline tracking-tight px-2">Engagement Schedule</h3>
              {followUps && followUps.filter(f => !f.completed).length > 0 ? (
                <div className="space-y-4">
                  {followUps.filter(f => !f.completed).map((f) => (
                    <Card key={f.id} className="border-none shadow-sm rounded-[2rem] p-6 sm:p-8 flex items-center justify-between group hover:shadow-md transition-all bg-white">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors shrink-0">
                          {f.type === 'WhatsApp' && <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />}
                          {f.type === 'Call' && <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
                          {f.type === 'Email' && <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                          {f.type === 'Meeting' && <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />}
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight line-clamp-1">
                            {leads?.find(l => l.id === f.leadId)?.name || "Unknown Lead"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                            <Badge variant="outline" className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border-slate-100">{f.type}</Badge>
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 tracking-widest">
                              <Calendar className="h-3 w-3" />
                              {new Date(f.scheduledAt).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 sm:h-11 sm:w-11 bg-slate-50 hover:bg-accent hover:text-white transition-all shrink-0 ml-2">
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] sm:rounded-[3rem] text-center bg-white/50 px-6">
                  <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">No scheduled activities</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-4">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency Metrics</p>
                  <h4 className="text-xl font-bold font-headline tracking-tight">Response Velocity</h4>
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-slate-400 font-medium">Avg Response Time</span>
                    <span className="text-xl sm:text-2xl font-bold font-headline tracking-tight">2.4h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-slate-400 font-medium">Weekly Flow</span>
                    <span className="text-xl sm:text-2xl font-bold font-headline text-primary tracking-tight">{followUps?.length || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((c) => (
                <Card key={c.id} className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl transition-all border border-slate-50">
                  <CardHeader className="p-8 sm:p-10 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{c.channel}</Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-headline tracking-tight line-clamp-1">{c.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-10 pt-0 space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">₹{c.budget.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leads</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{c.leadsGenerated}</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2">
                        <span className="text-slate-400">ROI index</span>
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
              <div className="col-span-full p-20 sm:p-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] sm:rounded-[3rem] text-center bg-white/50 px-6">
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">No active marketing campaigns</p>
                <Button className="mt-6 rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 px-8">Launch Strategy</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="m-0 animate-in slide-in-from-left-2 duration-300">
          <div className="space-y-10">
            <Card className="border-none shadow-sm rounded-[2.5rem] sm:rounded-[3rem] bg-white p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-12 mb-10 sm:mb-12">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Sales Intelligence Core</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal mt-1">Visualizing pipeline performance and growth vectors.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl h-11 px-8 font-bold text-[10px] uppercase gap-2 border-slate-100 tracking-widest">
                    <BarChart3 className="h-4 w-4" />
                    Export Brief
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion Efficiency</p>
                    <h4 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight text-primary">{stats.conversionRate}%</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Benchmark Goal</span>
                      <span className="text-slate-900">25%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${stats.conversionRate}%` }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Opportunity Value</p>
                    <h4 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight text-slate-900">₹{(stats.activeValue / 1000).toFixed(0)}k</h4>
                  </div>
                  <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-relaxed tracking-normal italic">
                    "Aggregate capital potential currently moving through strategic stages."
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Forecast</p>
                    <h4 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight text-accent">₹{(stats.forecast / 1000).toFixed(0)}k</h4>
                  </div>
                  <div className="p-5 sm:p-6 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Rocket className="h-3 w-3" />
                      Growth Vector
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium tracking-normal leading-relaxed">Predicted revenue based on 30% pipeline conversion probability.</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source ROI Analysis</CardTitle>
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mt-1 tracking-tight">Channel Revenue Potential</h3>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.sourceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Potential']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                        {stats.sourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Segmenting</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mt-1 tracking-tight">Niche Market Distribution</h3>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.industryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {stats.industryData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
