
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ImageIcon,
  Key,
  CheckCircle2,
  Lock,
  Unlock,
  Shield,
  User,
  GitBranch
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
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import WorkflowManager from "@/components/settings/WorkflowManager";

const DEFAULT_WORKSPACE_ITEMS = [
  { id: "dashboard", title: "Dashboard", iconName: "LayoutGrid", url: "/", order: 1, isVisible: true },
  { id: "pipeline", title: "Pipeline", iconName: "GitBranch", url: "/pipeline", order: 2, isVisible: true },
  { id: "projects", title: "Projects", iconName: "Folder", url: "/projects", order: 3, isVisible: true },
  { id: "board", title: "Board", iconName: "Trello", url: "/board", order: 4, isVisible: true },
  { id: "clients", title: "Clients", iconName: "Briefcase", url: "/clients", order: 5, isVisible: true },
  { id: "schedule", title: "Schedule", iconName: "Calendar", url: "/schedule", order: 6, isVisible: true },
  { id: "time", title: "Time Tracking", iconName: "Clock", url: "/time", order: 7, isVisible: true },
  { id: "team", title: "Team", iconName: "Users", url: "/team", order: 8, isVisible: true },
  { id: "billing", title: "Billing", iconName: "FileText", url: "/invoices", order: 9, isVisible: true },
  { id: "intelligence", title: "Intelligence", iconName: "BarChart3", url: "/sales-forecast", order: 10, isVisible: true },
  { id: "market", title: "Market Research", iconName: "Globe", url: "/market-research", order: 11, isVisible: true },
];

const MANAGEMENT_MODULES = [
  { id: "admin", title: "Admin Console", iconName: "ShieldCheck", url: "/admin", order: 100, isVisible: true },
  { id: "user-management", title: "User Management", iconName: "Shield", url: "/admin/users", order: 101, isVisible: true },
];

const SETTINGS_TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "workflow", label: "Workflow Manager", icon: GitBranch },
  { id: "team", label: "Team Members", icon: Users },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "navigation", label: "Navigation", icon: LayoutGrid },
  { id: "roles", label: "Roles", icon: Key },
  { id: "preferences", label: "Preferences", icon: Monitor },
];

export default function SettingsPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [newVertical, setNewVertical] = useState("");

  // Auth & Permissions Logic
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: currentUserMember } = useDoc(memberRef);

  const userRoleRef = useMemoFirebase(() => {
    if (!currentUserMember?.roleId) return null;
    return doc(db, "roles", currentUserMember.roleId);
  }, [db, currentUserMember?.roleId]);
  const { data: userRole } = useDoc(userRoleRef);

  const hasPermission = (perm: string) => {
    if (!userRole) return true; // Default to all access for prototype phase
    return userRole.permissions?.includes(perm);
  };

  const visibleTabs = useMemo(() => {
    return SETTINGS_TABS.filter(tab => {
      if (tab.id === 'profile') return true; // Personal profile always visible
      if (tab.id === 'preferences') return true; // Appearance preferences always visible
      return hasPermission(`settings:${tab.id}`);
    });
  }, [userRole]);

  const [activeTab, setActiveTab] = useState("profile");

  // Initialize theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && systemDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
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

  // Data Collections
  const teamQuery = useMemoFirebase(() => query(collection(db, "teamMembers"), orderBy("firstName", "asc")), [db]);
  const { data: team, isLoading: teamLoading } = useCollection(teamQuery);

  const navQuery = useMemoFirebase(() => query(collection(db, "sidebar_items"), orderBy("order", "asc")), [db]);
  const { data: navItems, isLoading: navLoading } = useCollection(navQuery);

  const rolesQuery = useMemoFirebase(() => query(collection(db, "roles"), orderBy("name", "asc")), [db]);
  const { data: roles, isLoading: rolesLoading } = useCollection(rolesQuery);

  const projectSettingsRef = useMemoFirebase(() => doc(db, "settings", "projects"), [db]);
  const { data: projectSettings } = useDoc(projectSettingsRef);

  const billingSettingsRef = useMemoFirebase(() => doc(db, "companyBillingSettings", "global"), [db]);
  const { data: billingSettings } = useDoc(billingSettingsRef);

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

  // Personal Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    thumbnail: ""
  });

  useEffect(() => {
    if (billingSettings) {
      setBillingForm({
        companyName: billingSettings.companyName || "Organization Name",
        companyAddress: billingSettings.companyAddress || "",
        bankName: billingSettings.bankName || "",
        bankAccountNumber: billingSettings.bankAccountNumber || "",
        bankSwiftCode: billingSettings.bankSwiftCode || "",
        bankIban: billingSettings.bankIban || "",
        companyPhone: billingSettings.companyPhone || "",
        taxId: billingSettings.taxId || "",
        invoicePrefix: billingSettings.invoicePrefix || "INV-",
        nextInvoiceNumberSequence: billingSettings.nextInvoiceNumberSequence || 1001,
        panNumber: billingSettings.panNumber || "",
        cinNumber: billingSettings.cinNumber || "",
        logo: billingSettings.logo || ""
      });
    }
  }, [billingSettings]);

  useEffect(() => {
    if (currentUserMember) {
      setProfileForm({
        firstName: currentUserMember.firstName || "",
        lastName: currentUserMember.lastName || "",
        phone: currentUserMember.phone || "",
        thumbnail: currentUserMember.thumbnail || ""
      });
    }
  }, [currentUserMember]);

  // Role Form State
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const handleOpenRoleDialog = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions || []
      });
    } else {
      setEditingRole(null);
      setRoleForm({ name: "", description: "", permissions: [] });
    }
    setIsRoleDialogOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSaveRole = async () => {
    if (!roleForm.name) return;
    setIsGenerating(true);
    const data = { ...roleForm, updatedAt: serverTimestamp() };
    if (editingRole) {
      updateDocumentNonBlocking(doc(db, "roles", editingRole.id), data);
    } else {
      addDocumentNonBlocking(collection(db, "roles"), { ...data, createdAt: serverTimestamp() });
    }
    setIsRoleDialogOpen(false);
    setIsGenerating(false);
    toast({ title: "Role Synchronized", description: `${roleForm.name} has been updated in the registry.` });
  };

  const handleLogoClick = () => logoInputRef.current?.click();
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBillingForm(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicClick = () => profilePicInputRef.current?.click();
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileForm(prev => ({ ...prev, thumbnail: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveOrgProfile = () => {
    if (!billingSettingsRef) return;
    setIsGenerating(true);
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
      toast({ title: "Profile Synchronized", description: "Organization details updated." });
    }, 800);
  };

  const handleSavePersonalProfile = () => {
    if (!memberRef || !user) return;
    setIsGenerating(true);
    
    // Use setDocumentNonBlocking with merge to ensure it works even if the teamMember doc doesn't exist yet
    setDocumentNonBlocking(memberRef, {
      ...profileForm,
      email: user.email,
      id: user.uid,
      status: "Active",
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsGenerating(false);
      toast({ title: "Identity Synchronized", description: "Your personal profile has been updated." });
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
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal dark:text-white">Strategic Settings</h1>
        <p className="text-sm text-slate-500 font-medium tracking-normal dark:text-slate-400">Manage your organization profile, team access, and system permissions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1 dark:bg-slate-900 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal whitespace-nowrap">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Personal Identity</CardTitle>
              <CardDescription className="tracking-normal">Manage your executive profile, contact details, and system portrait.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="flex flex-col items-center gap-6 py-6 border-b border-slate-50 dark:border-slate-800 mb-6">
                <div className="relative group cursor-pointer" onClick={handleProfilePicClick}>
                  <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden bg-white dark:border-slate-800 dark:bg-slate-800">
                    {profileForm.thumbnail ? (
                      <AvatarImage src={profileForm.thumbnail} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">{profileForm.firstName?.[0] || 'E'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                    <Upload className="h-6 w-6 text-white mb-1" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Update Portrait</span>
                  </div>
                  <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Identifier Photo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">First Name</Label>
                  <Input value={profileForm.firstName} onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Last Name</Label>
                  <Input value={profileForm.lastName} onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">System Email</Label>
                  <Input value={user?.email || "No Email Provided"} disabled className="h-14 rounded-xl bg-slate-100 border-none font-bold tracking-normal text-slate-400" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Direct Hotline (Phone)</Label>
                  <Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-normal">Strategic Role</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assigned Entitlement</p>
                  </div>
                </div>
                <Badge className="bg-primary text-white border-none rounded-xl px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">
                  {roles?.find(r => r.id === currentUserMember?.roleId)?.name || "General Executive"}
                </Badge>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                <Button onClick={handleSavePersonalProfile} disabled={isSaving} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sync Identity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
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
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Brand Logo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Legal Entity Name</Label>
                  <Input value={billingForm.companyName} onChange={(e) => setBillingForm({...billingForm, companyName: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">CIN Number</Label>
                  <Input value={billingForm.cinNumber} onChange={(e) => setBillingForm({...billingForm, cinNumber: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Headquarters Address</Label>
                <textarea value={billingForm.companyAddress} onChange={(e) => setBillingForm({...billingForm, companyAddress: e.target.value})} className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-sm tracking-normal resize-none dark:bg-slate-800 dark:text-white" />
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                <Button onClick={handleSaveOrgProfile} disabled={isSaving} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sync Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="animate-in slide-in-from-left-2 duration-300">
          <WorkflowManager />
        </TabsContent>

        <TabsContent value="roles" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-slate-800/30">
              <div>
                <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Access Hierarchies</CardTitle>
                <CardDescription className="tracking-normal">Define user types and assign granular permissions for modules and settings.</CardDescription>
              </div>
              <Button onClick={() => handleOpenRoleDialog()} className="h-11 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white gap-2 tracking-normal dark:bg-white dark:text-slate-900">
                <Plus className="h-4 w-4" />
                Define Role
              </Button>
            </div>
            
            <CardContent className="p-0">
              {rolesLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Role Identity</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Capabilities</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles?.map((role) => (
                      <TableRow key={role.id} className="group transition-colors border-slate-50 dark:border-slate-800">
                        <TableCell className="px-10 py-6">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{role.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{role.description || "No description provided."}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-bold uppercase px-2">{role.permissions?.length || 0} Permissions</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenRoleDialog(role)} className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary transition-all"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "roles", role.id))} className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive transition-all"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent className="sm:max-w-[800px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-10 pb-0">
                <DialogTitle className="text-3xl font-bold font-headline tracking-tight">{editingRole ? "Re-configure Access" : "Provision New Role"}</DialogTitle>
              </DialogHeader>
              <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Role Identifier</Label>
                    <Input value={roleForm.name} onChange={(e) => setRoleForm({...roleForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" placeholder="e.g. Senior Producer" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Executive Brief</Label>
                    <Input value={roleForm.description} onChange={(e) => setRoleForm({...roleForm, description: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" placeholder="Brief role summary..." />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3"><Layers className="h-4 w-4 text-primary" /> Module Entitlements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...DEFAULT_WORKSPACE_ITEMS, ...MANAGEMENT_MODULES].map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleTogglePermission(`module:${item.id}`)}>
                          <Checkbox checked={roleForm.permissions.includes(`module:${item.id}`)} onCheckedChange={() => handleTogglePermission(`module:${item.id}`)} className="rounded-lg border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-normal">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3"><Settings className="h-4 w-4 text-accent" /> Control Panel Access</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {SETTINGS_TABS.map((tab) => (
                        <div key={tab.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleTogglePermission(`settings:${tab.id}`)}>
                          <Checkbox checked={roleForm.permissions.includes(`settings:${tab.id}`)} onCheckedChange={() => handleTogglePermission(`settings:${tab.id}`)} className="rounded-lg border-slate-200 data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-normal">{tab.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-8 flex justify-between items-center -mx-0">
                <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-widest">Discard</Button></DialogClose>
                <Button onClick={handleSaveRole} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-10 h-12 gap-3 tracking-widest shadow-2xl transition-all">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Deploy Policy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="team" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
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
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Crew Member</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Strategic Role</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal text-center">Status</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team?.map((member) => (
                      <TableRow key={member.id} className="group transition-colors border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                        <TableCell className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 rounded-xl"><AvatarImage src={member.thumbnail} /><AvatarFallback>{member.firstName[0]}</AvatarFallback></Avatar>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{member.firstName} {member.lastName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-100 text-slate-600 font-bold text-[9px] uppercase tracking-normal">
                            {roles?.find(r => r.id === member.roleId)?.name || member.roleId || "General Access"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full ${member.status === 'Suspended' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {member.status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary transition-all"><Edit2 className="h-4 w-4" /></Button></DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                                <DialogHeader className="p-8 pb-0">
                                  <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Team Member</DialogTitle>
                                </DialogHeader>
                                <TeamMemberForm existingMember={member} />
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "teamMembers", member.id))} className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive transition-all"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Execution Verticals</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="flex gap-3">
                <Input value={newVertical} onChange={(e) => setNewVertical(e.target.value)} placeholder="e.g. Cinematic Wedding Story" className="h-12 rounded-xl bg-slate-50 border-none shadow-inner dark:bg-slate-800 dark:text-white" />
                <Button onClick={() => { if (!newVertical || !projectSettingsRef) return; const updated = [...(projectSettings?.projectTypes || []), newVertical]; updateDocumentNonBlocking(projectSettingsRef, { projectTypes: updated }); setNewVertical(""); }} className="h-12 rounded-xl font-bold px-6">Add Vertical</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectSettings?.projectTypes?.map((type: string) => (
                  <Badge key={type} className="bg-slate-100 text-slate-600 border-none px-4 py-2 rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer group">
                    {type}
                    <X className="h-3 w-3 opacity-0 group-hover:opacity-100" onClick={() => { if (!projectSettingsRef) return; const updated = projectSettings?.projectTypes.filter((v: string) => v !== type); updateDocumentNonBlocking(projectSettingsRef, { projectTypes: updated }); }} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Settlement Details</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Bank Name</Label>
                  <Input value={billingForm.bankName} onChange={(e) => setBillingForm({...billingForm, bankName: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Account Number</Label>
                  <Input value={billingForm.bankAccountNumber} onChange={(e) => setBillingForm({...billingForm, bankAccountNumber: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal dark:bg-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button onClick={() => { if (!billingSettingsRef) return; setIsGenerating(true); setDocumentNonBlocking(billingSettingsRef, { ...billingForm, updatedAt: serverTimestamp() }, { merge: true }); setTimeout(() => { setIsGenerating(false); toast({ title: "Financials Synchronized", description: "Settlement details updated." }); }, 800); }} disabled={isSaving} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sync Financials
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-10 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Workspace Sidebar</CardTitle>
              <Button onClick={async () => { setIsGenerating(true); const batch = writeBatch(db); [...DEFAULT_WORKSPACE_ITEMS, ...MANAGEMENT_MODULES].forEach((item) => { const docRef = doc(collection(db, "sidebar_items"), item.id); batch.set(docRef, { ...item }); }); await batch.commit(); setIsGenerating(false); toast({ title: "Navigation Synchronized", description: "Standard modules provisioned." }); }} disabled={isSaving} variant="outline" className="h-11 px-6 rounded-xl font-bold bg-white text-slate-900 gap-2 border-slate-200">
                <RotateCcw className="h-4 w-4" />
                Initialize System
              </Button>
            </div>
            <CardContent className="p-0">
              {navLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Module Identity</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal text-center">Status</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {navItems?.map((item) => (
                      <TableRow key={item.id} className="group transition-colors border-slate-100 dark:border-slate-800">
                        <TableCell className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Sparkles className="h-4 w-4" /></div>
                            <Input defaultValue={item.title} onBlur={(e) => updateDocumentNonBlocking(doc(db, "sidebar_items", item.id), { title: e.target.value })} className="h-9 min-w-[150px] bg-transparent border-none shadow-none font-bold text-slate-900 dark:text-white p-0 focus-visible:ring-0" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full tracking-normal ${item.isVisible !== false ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{item.isVisible !== false ? 'Visible' : 'Hidden'}</Badge>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <Button variant="ghost" size="icon" onClick={() => updateDocumentNonBlocking(doc(db, "sidebar_items", item.id), { isVisible: !(item.isVisible !== false) })} className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary transition-all">{item.isVisible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Workspace Appearance</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="flex items-center justify-between p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">{isDarkMode ? <Moon className="h-6 w-6 text-primary" /> : <Sun className="h-6 w-6 text-primary" />}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white tracking-normal">Dark Mode</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-1">Switch between high-contrast dark and classic light interfaces.</p>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
