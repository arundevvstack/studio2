
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
  GitBranch,
  Trello,
  Calendar,
  Clock,
  BarChart3,
  Globe,
  GripVertical,
  Palette
} from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

const SIDEBAR_MODULES = [
  { id: "dashboard", title: "Dashboard", icon: LayoutGrid },
  { id: "proposals", title: "Proposals", icon: FileText },
  { id: "talent-library", title: "Talent Library", icon: Users },
  { id: "pipeline", title: "Pipeline", icon: GitBranch },
  { id: "projects", title: "Projects", icon: Briefcase },
  { id: "board", title: "Board", icon: Trello },
  { id: "clients", title: "Clients", icon: Briefcase },
  { id: "schedule", title: "Schedule", icon: Calendar },
  { id: "time", title: "Time Tracking", icon: Clock },
  { id: "team", title: "Team", icon: Users },
  { id: "billing", title: "Billing", icon: FileText },
  { id: "intelligence", title: "Intelligence", icon: BarChart3 },
  { id: "market", title: "Market Research", icon: Globe },
  { id: "admin", title: "Admin Console", icon: ShieldCheck },
  { id: "settings", title: "Settings", icon: Settings },
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

const THEME_COLORS = [
  { name: "Strategic Blue", hsl: "204 61% 47%", color: "#2E86C1" },
  { name: "Emerald Growth", hsl: "142 71% 45%", color: "#10B981" },
  { name: "Royal Vision", hsl: "262 83% 58%", color: "#8B5CF6" },
  { name: "Sunset Impact", hsl: "24 95% 53%", color: "#F97316" },
  { name: "Midnight Slate", hsl: "215 25% 27%", color: "#334155" },
  { name: "Rose Distinction", hsl: "330 81% 60%", color: "#EC4899" },
];

export default function SettingsPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].hsl);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoleIdForNav, setSelectedRoleIdForNav] = useState<string>("");

  // --- Navigation Reordering State ---
  const [orderedModules, setOrderedModules] = useState(SIDEBAR_MODULES);
  
  // Fetch Global Navigation Config
  const navSettingsRef = useMemoFirebase(() => doc(db, "settings", "navigation"), [db]);
  const { data: navSettings, isLoading: isNavLoading } = useDoc(navSettingsRef);

  useEffect(() => {
    if (navSettings?.order && Array.isArray(navSettings.order)) {
      const newOrder = navSettings.order.map((id: string) => 
        SIDEBAR_MODULES.find(m => m.id === id)
      ).filter(Boolean) as typeof SIDEBAR_MODULES;
      
      // Append any new modules that weren't in the saved order
      const existingIds = new Set(navSettings.order);
      const newModules = SIDEBAR_MODULES.filter(m => !existingIds.has(m.id));
      
      setOrderedModules([...newOrder, ...newModules]);
    }
  }, [navSettings]);

  // --- Auth & Permissions Logic ---
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: currentUserMember } = useDoc(memberRef);

  const rolesQuery = useMemoFirebase(() => query(collection(db, "roles"), orderBy("name", "asc")), [db]);
  const { data: roles, isLoading: rolesLoading } = useCollection(rolesQuery);

  const userRoleRef = useMemoFirebase(() => {
    if (!currentUserMember?.roleId) return null;
    return doc(db, "roles", currentUserMember.roleId);
  }, [db, currentUserMember?.roleId]);
  const { data: userRole } = useDoc(userRoleRef);

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRoleIdForNav) {
      setSelectedRoleIdForNav(roles[0].id);
    }
  }, [roles, selectedRoleIdForNav]);

  const hasPermission = (perm: string) => {
    if (!userRole) return true; 
    return userRole.permissions?.includes(perm) || userRole.name === 'Super Admin';
  };

  const visibleTabs = useMemo(() => {
    return SETTINGS_TABS.filter(tab => {
      if (tab.id === 'profile') return true; 
      if (tab.id === 'preferences') return true; 
      return hasPermission(`settings:${tab.id}`);
    });
  }, [userRole]);

  const [activeTab, setActiveTab] = useState("profile");

  // Initialize theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const savedColor = localStorage.getItem("theme-color");
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      if (savedTheme === "dark" || (!savedTheme && systemDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }

      if (savedColor) {
        setSelectedColor(savedColor);
        document.documentElement.style.setProperty('--primary', savedColor);
        document.documentElement.style.setProperty('--ring', savedColor);
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

  const changeThemeColor = (hsl: string) => {
    setSelectedColor(hsl);
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--ring', hsl);
    localStorage.setItem("theme-color", hsl);
    toast({
      title: "Tactical Color Updated",
      description: "Workspace primary identity has been synchronized."
    });
  };

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

  // --- DND Handlers ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedModules.findIndex((i) => i.id === active.id);
      const newIndex = orderedModules.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(orderedModules, oldIndex, newIndex);
      
      setOrderedModules(newOrder);
      
      if (navSettingsRef) {
        setDocumentNonBlocking(navSettingsRef, {
          order: newOrder.map(m => m.id),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        toast({ 
          title: "Navigation Reordered", 
          description: "Global sidebar position updated." 
        });
      }
    }
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

        <TabsContent value="navigation" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Global Menu Architecture</CardTitle>
                <CardDescription className="tracking-normal">Drag to reorder sidebar position or toggle visibility per strategic role.</CardDescription>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Select Role:</Label>
                <Select value={selectedRoleIdForNav} onValueChange={setSelectedRoleIdForNav}>
                  <SelectTrigger className="h-12 w-full md:w-[240px] rounded-xl bg-white border-slate-100 font-bold text-xs uppercase tracking-widest shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Choose Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {roles?.map(r => (
                      <SelectItem key={r.id} value={r.id} className="text-xs font-bold uppercase">{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <CardContent className="p-0">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {orderedModules.map((item) => (
                      <SortableNavigationItem 
                        key={item.id} 
                        item={item} 
                        roles={roles} 
                        selectedRoleId={selectedRoleIdForNav} 
                        db={db}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
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
                      {SIDEBAR_MODULES.map((item) => (
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

        <TabsContent value="preferences" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal dark:text-white">Workspace Appearance</CardTitle>
              <CardDescription className="tracking-normal">Customize your executive interface for maximum operational comfort.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
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

              <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white tracking-normal">Brand Alignment</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-normal">Select a tactical primary color for the global workspace.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.hsl}
                      onClick={() => changeThemeColor(color.hsl)}
                      className={`group p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                        selectedColor === color.hsl 
                          ? "border-primary bg-primary/5 shadow-inner" 
                          : "border-slate-50 bg-white hover:border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      }`}
                    >
                      <div 
                        className="h-10 w-10 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-900" 
                        style={{ backgroundColor: color.color }} 
                      />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${
                        selectedColor === color.hsl ? "text-primary" : "text-slate-400"
                      }`}>
                        {color.name}
                      </span>
                      {selectedColor === color.hsl && (
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Sortable Item Component ---
function SortableNavigationItem({ item, roles, selectedRoleId, db }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  const Icon = item.icon || Globe;
  const selectedRole = roles?.find((r: any) => r.id === selectedRoleId);
  const hasAccess = selectedRole?.permissions?.includes(`module:${item.id}`) || selectedRole?.name === 'Super Admin';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50 relative bg-white dark:bg-slate-900"
    >
      <div className="flex items-center gap-6">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800">
          <GripVertical className="h-5 w-5 text-slate-300" />
        </button>
        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white tracking-normal">{item.title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/{item.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${hasAccess ? 'text-primary' : 'text-slate-300'}`}>
          {hasAccess ? 'Authorized' : 'Restricted'}
        </span>
        <Switch 
          disabled={selectedRole?.name === 'Super Admin'}
          checked={!!hasAccess} 
          onCheckedChange={(checked) => {
            if (!selectedRole) return;
            const perm = `module:${item.id}`;
            const updatedPerms = checked 
              ? [...(selectedRole.permissions || []), perm]
              : (selectedRole.permissions || []).filter((p: string) => p !== perm);
            updateDocumentNonBlocking(doc(db, "roles", selectedRole.id), { permissions: updatedPerms });
            toast({ title: "Authority Adjusted", description: `${item.title} visibility updated for ${selectedRole.name}.` });
          }} 
        />
      </div>
    </div>
  );
}
