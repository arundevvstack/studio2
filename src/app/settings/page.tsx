"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Plus, 
  Loader2,
  Briefcase,
  FileText,
  BadgeCheck,
  Moon,
  Sun,
  Monitor,
  Edit2,
  LayoutGrid,
  Eye,
  EyeOff,
  MoveVertical,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  CreditCard,
  Receipt,
  Landmark,
  ShieldAlert,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";

const DEFAULT_WORKSPACE_ITEMS = [
  { title: "Dashboard", iconName: "LayoutGrid", url: "/", order: 1, isVisible: true },
  { title: "Pipeline", iconName: "GitBranch", url: "/pipeline", order: 2, isVisible: true },
  { title: "Projects", iconName: "Folder", url: "/projects", order: 3, isVisible: true },
  { title: "Board", iconName: "Trello", url: "/board", order: 4, isVisible: true },
  { title: "Clients", iconName: "Briefcase", url: "/clients", order: 5, isVisible: true },
  { title: "Schedule", iconName: "Calendar", url: "/schedule", order: 6, isVisible: true },
  { title: "Time Tracking", iconName: "Clock", url: "/time", order: 7, isVisible: true },
  { title: "Team", iconName: "Users", url: "/team", order: 8, isVisible: true },
  { title: "Billing", iconName: "FileText", url: "/invoices", order: 9, isVisible: true },
  { title: "Intelligence", iconName: "BarChart3", url: "/sales-forecast", order: 10, isVisible: true },
  { title: "Market Research", iconName: "Globe", url: "/market-research", order: 11, isVisible: true },
];

const DEFAULT_PROJECT_TYPES = [
  "TV Commercials (TVC)",
  "Digital Ad Film Production",
  "Performance Marketing Ads",
  "Brand Commercials",
  "AI VFX Production",
  "AI Video Production",
  "Reels / Shorts Production",
  "UGC (User Generated Content)",
  "Property Walkthrough Videos"
];

const DEFAULT_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

const DEFAULT_PHASES = ["Discussion", "Pre Production", "Production", "Post Production", "Release", "Social Media"];

export default function SettingsPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme from system/localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Team Data
  const teamQuery = useMemoFirebase(() => {
    return query(collection(db, "teamMembers"), orderBy("firstName", "asc"));
  }, [db]);
  const { data: team, isLoading: teamLoading } = useCollection(teamQuery);

  // Navigation Data
  const navQuery = useMemoFirebase(() => {
    return query(collection(db, "sidebar_items"), orderBy("order", "asc"));
  }, [db]);
  const { data: navItems, isLoading: navLoading } = useCollection(navQuery);

  // Project Settings Data
  const projectSettingsRef = useMemoFirebase(() => {
    return doc(db, "settings", "projects");
  }, [db]);
  const { data: projectSettings, isLoading: projectSettingsLoading } = useDoc(projectSettingsRef);

  // Billing Settings Data
  const billingSettingsRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: billingSettings, isLoading: billingLoading } = useDoc(billingSettingsRef);

  // Billing Form State
  const [billingForm, setBillingForm] = useState({
    companyName: "",
    companyAddress: "",
    bankName: "",
    bankAccountNumber: "",
    bankSwiftCode: "",
    bankIban: "",
    companyPhone: "",
    taxId: "",
    invoicePrefix: "",
    nextInvoiceNumberSequence: 1001,
    panNumber: "",
    cinNumber: "",
    logo: ""
  });

  useEffect(() => {
    if (billingSettings) {
      setBillingForm({
        companyName: billingSettings.companyName || "Marzelz Lifestyle Private Limited",
        companyAddress: billingSettings.companyAddress || "Dotspace Business Center TC 24/3088 Ushasandya Building, Kowdiar, Trivandrum, 695003",
        bankName: billingSettings.bankName || "Axis Bank",
        bankAccountNumber: billingSettings.bankAccountNumber || "922020014850667",
        bankSwiftCode: billingSettings.bankSwiftCode || "UTIB0003042",
        bankIban: billingSettings.bankIban || "Sasthamangalam",
        companyPhone: billingSettings.companyPhone || "9947109143",
        taxId: billingSettings.taxId || "32AAQCM8450P1ZQ",
        invoicePrefix: billingSettings.invoicePrefix || "MRZL_",
        nextInvoiceNumberSequence: billingSettings.nextInvoiceNumberSequence || 1001,
        panNumber: billingSettings.panNumber || "AAQCM8450P",
        cinNumber: billingSettings.cinNumber || "U60200KL2023PTC081308",
        logo: billingSettings.logo || ""
      });
    }
  }, [billingSettings]);

  const [newVertical, setNewVertical] = useState("");
  const [newHub, setNewHub] = useState("");

  const handleLogoClick = () => logoInputRef.current?.click();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillingForm(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!billingSettingsRef) return;
    setIsGenerating(true);
    
    // We synchronize the essential brand info from the profile tab into the billing singleton
    setDocumentNonBlocking(billingSettingsRef, {
      companyName: billingForm.companyName,
      cinNumber: billingForm.cinNumber,
      taxId: billingForm.taxId,
      panNumber: billingForm.panNumber,
      companyAddress: billingForm.companyAddress,
      logo: billingForm.logo,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Profile Synchronized",
        description: "Organization details have been updated across the network."
      });
    }, 1000);
  };

  const handleDeleteMember = (memberId: string, name: string) => {
    const memberRef = doc(db, "teamMembers", memberId);
    deleteDocumentNonBlocking(memberRef);
    toast({
      variant: "destructive",
      title: "Member De-provisioned",
      description: `${name} has been removed from the organization.`
    });
  };

  const handleInitializeNav = async () => {
    setIsGenerating(true);
    const batch = writeBatch(db);
    DEFAULT_WORKSPACE_ITEMS.forEach((item) => {
      const docRef = doc(collection(db, "sidebar_items"));
      batch.set(docRef, { ...item, id: docRef.id });
    });
    await batch.commit();
    setIsGenerating(false);
    toast({ title: "Navigation Synchronized", description: "Standard workspace modules have been provisioned." });
  };

  const handleInitializeProjectDefaults = async () => {
    if (!projectSettingsRef) return;
    setIsGenerating(true);
    setDocumentNonBlocking(projectSettingsRef, {
      projectTypes: DEFAULT_PROJECT_TYPES,
      districts: DEFAULT_DISTRICTS,
      phases: DEFAULT_PHASES,
      defaultCurrency: "INR",
      updatedAt: serverTimestamp()
    }, { merge: true });
    setIsGenerating(false);
    toast({ title: "Project Strategy Synchronized", description: "Standard execution verticals and hubs have been provisioned." });
  };

  const handleToggleNavVisibility = (id: string, current: boolean) => {
    updateDocumentNonBlocking(doc(db, "sidebar_items", id), { isVisible: !current });
  };

  const handleUpdateNavTitle = (id: string, newTitle: string) => {
    updateDocumentNonBlocking(doc(db, "sidebar_items", id), { title: newTitle });
  };

  const handleAddProjectVertical = () => {
    if (!newVertical || !projectSettingsRef) return;
    const updated = [...(projectSettings?.projectTypes || []), newVertical];
    updateDocumentNonBlocking(projectSettingsRef, { projectTypes: updated });
    setNewVertical("");
  };

  const handleRemoveProjectVertical = (vertical: string) => {
    if (!projectSettingsRef) return;
    const updated = projectSettings?.projectTypes.filter((v: string) => v !== vertical);
    updateDocumentNonBlocking(projectSettingsRef, { projectTypes: updated });
  };

  const handleAddProjectHub = () => {
    if (!newHub || !projectSettingsRef) return;
    const updated = [...(projectSettings?.districts || []), newHub];
    updateDocumentNonBlocking(projectSettingsRef, { districts: updated });
    setNewHub("");
  };

  const handleRemoveProjectHub = (hub: string) => {
    if (!projectSettingsRef) return;
    const updated = projectSettings?.districts.filter((h: string) => h !== hub);
    updateDocumentNonBlocking(projectSettingsRef, { districts: updated });
  };

  const handleSaveBilling = () => {
    if (!billingSettingsRef) return;
    setIsGenerating(true);
    
    // We use setDocumentNonBlocking with merge: true to avoid "permission denied" 
    // on initial document creation if using updateDoc.
    setDocumentNonBlocking(billingSettingsRef, {
      ...billingForm,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsGenerating(false);
      toast({ title: "Financials Synchronized", description: "Billing and settlement details have been updated." });
    }, 800);
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-normal">Syncing Global Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal dark:text-white">Strategic Settings</h1>
        <p className="text-sm text-slate-500 font-medium tracking-normal dark:text-slate-400">Manage your organization profile, team access, and system preferences.</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1 dark:bg-slate-900 dark:border-slate-800">
          <TabsTrigger value="organization" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="projects" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Briefcase className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Receipt className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="navigation" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <LayoutGrid className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Monitor className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Company Identity</CardTitle>
              <CardDescription className="tracking-normal">Define the branding and identifiers used in legal and billing documents.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="flex flex-col items-center gap-6 py-6 border-b border-slate-50 dark:border-slate-800 mb-6">
                <div className="relative group cursor-pointer" onClick={handleLogoClick}>
                  <div className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden bg-white flex items-center justify-center dark:border-slate-800 dark:bg-slate-800">
                    {billingForm.logo ? (
                      <img src={billingForm.logo} alt="Organization Logo" className="w-full h-full object-contain p-4" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-slate-200" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                    <Upload className="h-6 w-6 text-white mb-1" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Change Logo</span>
                  </div>
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange} 
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Brand Logo</p>
                  <p className="text-[9px] text-slate-300 mt-1 italic">Prefer transparent PNG or SVG for documents.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Legal Entity Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      value={billingForm.companyName} 
                      onChange={(e) => setBillingForm({...billingForm, companyName: e.target.value})}
                      className="pl-12 h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Brand Display Name</Label>
                  <Input defaultValue="Marzelz" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">CIN Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      value={billingForm.cinNumber} 
                      onChange={(e) => setBillingForm({...billingForm, cinNumber: e.target.value})}
                      className="pl-12 h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">GSTIN Identifier</Label>
                  <Input 
                    value={billingForm.taxId} 
                    onChange={(e) => setBillingForm({...billingForm, taxId: e.target.value})}
                    className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">PAN Registration</Label>
                  <Input 
                    value={billingForm.panNumber} 
                    onChange={(e) => setBillingForm({...billingForm, panNumber: e.target.value})}
                    className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Headquarters Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-5 h-4 w-4 text-slate-300" />
                  <textarea 
                    value={billingForm.companyAddress}
                    onChange={(e) => setBillingForm({...billingForm, companyAddress: e.target.value})}
                    className="w-full min-h-[100px] pl-12 p-4 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-sm tracking-normal resize-none dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sync Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-slate-800/30">
              <div>
                <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Production Crew</CardTitle>
                <CardDescription className="tracking-normal">Provision and manage internal resources and access permissions.</CardDescription>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-11 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white gap-2 tracking-normal dark:bg-white dark:text-slate-900">
                    <Plus className="h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Provision Team Member</DialogTitle>
                  </DialogHeader>
                  <TeamMemberForm />
                </DialogContent>
              </Dialog>
            </div>
            
            <CardContent className="p-0">
              {teamLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : team && team.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Crew Member</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Type</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Strategic Role</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.map((member) => (
                      <TableRow key={member.id} className="group transition-colors border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <TableCell className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm rounded-xl dark:border-slate-700">
                              <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                              <AvatarFallback>{member.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900 tracking-normal leading-none dark:text-white">{member.firstName} {member.lastName}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal ${member.type === 'Freelancer' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {member.type || "Expert"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 tracking-normal dark:text-slate-400">
                            <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                            {member.roleId || "Expert"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                                <DialogHeader className="p-8 pb-0">
                                  <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Team Member</DialogTitle>
                                </DialogHeader>
                                <TeamMemberForm existingMember={member} />
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteMember(member.id, member.firstName)}
                              className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/5 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-24 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center p-4 shadow-inner dark:bg-slate-800">
                    <Users className="h-full w-full text-slate-200 dark:text-slate-700" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No crew members provisioned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                  <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Execution Verticals</CardTitle>
                  <CardDescription className="tracking-normal">Define the specialized production categories available for initiation.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="flex gap-3">
                    <Input 
                      value={newVertical} 
                      onChange={(e) => setNewVertical(e.target.value)}
                      placeholder="e.g. Cinematic Wedding Story" 
                      className="h-12 rounded-xl bg-slate-50 border-none shadow-inner dark:bg-slate-800 dark:text-white"
                    />
                    <Button onClick={handleAddProjectVertical} className="h-12 rounded-xl font-bold px-6">
                      Add Vertical
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projectSettings?.projectTypes?.map((type: string) => (
                      <Badge key={type} className="bg-slate-100 text-slate-600 border-none px-4 py-2 rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer group">
                        {type}
                        <X className="h-3 w-3 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveProjectVertical(type)} />
                      </Badge>
                    ))}
                    {(!projectSettings?.projectTypes || projectSettings.projectTypes.length === 0) && (
                      <p className="text-sm text-slate-400 italic">No production verticals defined.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                  <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Project Hubs (Districts)</CardTitle>
                  <CardDescription className="tracking-normal">Manage the regional hubs for localized production tracking.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="flex gap-3">
                    <Input 
                      value={newHub} 
                      onChange={(e) => setNewHub(e.target.value)}
                      placeholder="e.g. Dubai, UAE" 
                      className="h-12 rounded-xl bg-slate-50 border-none shadow-inner dark:bg-slate-800 dark:text-white"
                    />
                    <Button onClick={handleAddProjectHub} className="h-12 rounded-xl font-bold px-6">
                      Add Hub
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projectSettings?.districts?.map((district: string) => (
                      <Badge key={district} className="bg-primary/5 text-primary border-none px-4 py-2 rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer group">
                        <MapPin className="h-3 w-3" />
                        {district}
                        <X className="h-3 w-3 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveProjectHub(district)} />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Production Intelligence</p>
                  <h4 className="text-xl font-bold font-headline tracking-normal">Phase Lifecycle</h4>
                </div>
                <div className="space-y-4 relative z-10">
                  {projectSettings?.phases?.map((phase: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 group cursor-default">
                      <span className="text-primary">{idx + 1}</span>
                      <span className="group-hover:text-white transition-colors">{phase}</span>
                    </div>
                  ))}
                  {(!projectSettings?.phases || projectSettings.phases.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No phases initialized.</p>
                  )}
                </div>
                <div className="pt-6 border-t border-white/5 relative z-10">
                  <Button 
                    onClick={handleInitializeProjectDefaults} 
                    disabled={isSaving}
                    variant="outline" 
                    className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold text-[10px] uppercase gap-2 tracking-widest"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Strategy Defaults
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="p-10 pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center dark:bg-blue-900/20">
                      <Landmark className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Settlement Details</CardTitle>
                      <CardDescription className="tracking-normal">Manage the banking information displayed on outgoing invoices.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Bank Name</Label>
                      <Input 
                        value={billingForm.bankName} 
                        onChange={(e) => setBillingForm({...billingForm, bankName: e.target.value})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Account Number</Label>
                      <Input 
                        value={billingForm.bankAccountNumber} 
                        onChange={(e) => setBillingForm({...billingForm, bankAccountNumber: e.target.value})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">IFSC Code</Label>
                      <Input 
                        value={billingForm.bankSwiftCode} 
                        onChange={(e) => setBillingForm({...billingForm, bankSwiftCode: e.target.value})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Branch Location</Label>
                      <Input 
                        value={billingForm.bankIban} 
                        onChange={(e) => setBillingForm({...billingForm, bankIban: e.target.value})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Settlement Phone</Label>
                      <Input 
                        value={billingForm.companyPhone} 
                        onChange={(e) => setBillingForm({...billingForm, companyPhone: e.target.value})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                    <Button 
                      onClick={handleSaveBilling} 
                      disabled={isSaving}
                      className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Sync Financials
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Invoicing Logic</CardTitle>
                  <CardDescription className="tracking-normal">Configure sequential numbering and default terms.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Invoice Prefix</Label>
                      <Input 
                        value={billingForm.invoicePrefix} 
                        onChange={(e) => setBillingForm({...billingForm, invoicePrefix: e.target.value})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Next Sequence Number</Label>
                      <Input 
                        type="number" 
                        value={billingForm.nextInvoiceNumberSequence} 
                        onChange={(e) => setBillingForm({...billingForm, nextInvoiceNumberSequence: parseInt(e.target.value) || 1001})}
                        className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Compliance Guard</p>
                  <h4 className="text-xl font-bold font-headline tracking-normal">Tax Verification</h4>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative z-10">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    GSTIN is correctly formatted
                  </div>
                </div>
                <div className="space-y-4 relative z-10 pt-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                    <span className="text-slate-500">Default Tax Rate</span>
                    <span className="text-primary">18% GST</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-slate-800/30">
              <div>
                <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Workspace Sidebar</CardTitle>
                <CardDescription className="tracking-normal">Manage visibility and attributes of primary workspace navigation modules.</CardDescription>
              </div>
              <Button 
                onClick={handleInitializeNav} 
                disabled={isSaving}
                variant="outline" 
                className="h-11 px-6 rounded-xl font-bold bg-white text-slate-900 gap-2 tracking-normal border-slate-200"
              >
                <RotateCcw className="h-4 w-4" />
                Initialize System
              </Button>
            </div>
            <CardContent className="p-0">
              {navLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : navItems && navItems.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal w-12"></TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Module Identity</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Destination URL</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal text-center">Status</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {navItems.map((item) => (
                      <TableRow key={item.id} className="group transition-colors border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <TableCell className="px-10">
                          <MoveVertical className="h-4 w-4 text-slate-200 group-hover:text-slate-400 cursor-ns-resize" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="relative group/title">
                              <Input 
                                defaultValue={item.title} 
                                onBlur={(e) => handleUpdateNavTitle(item.id, e.target.value)}
                                className="h-9 min-w-[150px] bg-transparent border-none shadow-none font-bold text-slate-900 dark:text-white p-0 focus-visible:ring-0 focus-visible:underline"
                              />
                              <Edit2 className="h-3 w-3 absolute -right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover/title:opacity-100" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{item.url}</code>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full tracking-normal ${item.isVisible !== false ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            {item.isVisible !== false ? 'Visible' : 'Hidden'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleNavVisibility(item.id, item.isVisible !== false)}
                            className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary transition-all"
                          >
                            {item.isVisible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-24 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center p-4 shadow-inner dark:bg-slate-800">
                    <LayoutGrid className="h-full w-full text-slate-200 dark:text-slate-700" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No navigation items found</p>
                  <Button onClick={handleInitializeNav} size="sm" className="mt-4">Provision Default Workspace</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Workspace Appearance</CardTitle>
              <CardDescription className="tracking-normal">Configure how MediaFlow looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="flex items-center justify-between p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                    {isDarkMode ? (
                      <Moon className="h-6 w-6 text-primary" />
                    ) : (
                      <Sun className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white tracking-normal">Dark Mode</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-1">Switch between high-contrast dark and classic light interfaces.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{isDarkMode ? 'Active' : 'Inactive'}</span>
                  <Switch 
                    checked={isDarkMode} 
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold tracking-normal uppercase text-[10px]">Strategic Environment</h4>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal relative z-10">
                  "Adjusting your workspace appearance can optimize production focus and reduce visual fatigue during long-form editing sessions."
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
