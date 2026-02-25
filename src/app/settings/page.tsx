
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
  Palette,
  Pipette,
  Tag,
  Check
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
import { collection, query, orderBy, doc, writeBatch, serverTimestamp, updateDoc } from "firebase/firestore";
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

const DASHBOARD_ITEMS = [
  { id: "stats", title: "Global Statistics" },
  { id: "workspace", title: "Workspace Header" },
  { id: "projects", title: "Project Grid" },
  { id: "intelligence", title: "Intelligence Chart" },
  { id: "efficiency", title: "Efficiency Index" },
  { id: "market", title: "Market Strategy Hub" },
];

const SETTINGS_TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "workflow", label: "Workflow Manager", icon: GitBranch },
  { id: "project", label: "Project Settings", icon: Briefcase },
  { id: "billing", label: "Financials", icon: Receipt },
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

const DEFAULT_SERVICE_TYPES = [
  "TV Commercials (TVC)",
  "Digital Ad Film Production",
  "Performance Marketing Ads",
  "Brand Commercials",
  "AI Video Production",
  "Reels / Shorts Production",
  "Product Photography",
  "Corporate Profile Films",
  "Virtual Tours"
];

function hexToHslValues(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function SettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].hsl);
  const [customHex, setCustomHex] = useState("#2E86C1");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoleIdForNav, setSelectedRoleIdForNav] = useState<string>("");

  const [orderedModules, setOrderedModules] = useState(SIDEBAR_MODULES);
  
  const navSettingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "settings", "navigation");
  }, [db, user]);
  const { data: navSettings } = useDoc(navSettingsRef);

  useEffect(() => {
    if (navSettings?.order && Array.isArray(navSettings.order)) {
      const newOrder = navSettings.order.map((id: string) => 
        SIDEBAR_MODULES.find(m => m.id === id)
      ).filter(Boolean) as typeof SIDEBAR_MODULES;
      
      const existingIds = new Set(navSettings.order);
      const newModules = SIDEBAR_MODULES.filter(m => !existingIds.has(m.id));
      
      setOrderedModules([...newOrder, ...newModules]);
    }
  }, [navSettings]);

  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: currentUserMember } = useDoc(memberRef);

  const rolesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "roles"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: roles, isLoading: rolesLoading } = useCollection(rolesQuery);

  const userRoleRef = useMemoFirebase(() => {
    if (!currentUserMember?.roleId) return null;
    return doc(db, "roles", currentUserMember.roleId);
  }, [db, currentUserMember?.roleId]);
  const { data: userRole } = useDoc(userRoleRef);

  const isMasterAdmin = userRole?.name === 'Root Administrator' || userRole?.name === 'Super Admin' || currentUserMember?.roleId === 'super-admin';

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRoleIdForNav) {
      setSelectedRoleIdForNav(roles[0].id);
    }
  }, [roles, selectedRoleIdForNav]);

  const hasPermission = (perm: string) => {
    if (!userRole) return true; 
    return userRole.permissions?.includes(perm) || isMasterAdmin;
  };

  const visibleTabs = useMemo(() => {
    return SETTINGS_TABS.filter(tab => {
      if (tab.id === 'profile') return true; 
      if (tab.id === 'preferences') return true; 
      return hasPermission(`settings:${tab.id}`);
    });
  }, [userRole, isMasterAdmin]);

  const [activeTab, setActiveTab] = useState("profile");

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
    toast({ title: "Tactical Color Updated", description: "Workspace identity synchronized." });
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    const hslValues = hexToHslValues(hex);
    changeThemeColor(hslValues);
  };

  const billingSettingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "companyBillingSettings", "global");
  }, [db, user]);
  const { data: billingSettings } = useDoc(billingSettingsRef);

  const [billingForm, setBillingForm] = useState({
    companyName: "", companyAddress: "", bankName: "", bankAccountNumber: "",
    bankSwiftCode: "", bankIban: "", companyPhone: "", taxId: "",
    invoicePrefix: "", nextInvoiceNumberSequence: 1001, panNumber: "", cinNumber: "", logo: ""
  });

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "", thumbnail: "" });

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

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: [] as string[] });

  const handleOpenRoleDialog = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({ name: role.name, description: role.description || "", permissions: role.permissions || [] });
    } else {
      setEditingRole(null);
      setRoleForm({ name: "", description: "", permissions: [] });
    }
    setIsRoleDialogOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
    }));
  };

  const handleSaveRole = async () => {
    if (!roleForm.name) return;
    setIsSaving(true);
    const data = { ...roleForm, updatedAt: serverTimestamp() };
    if (editingRole) updateDocumentNonBlocking(doc(db, "roles", editingRole.id), data);
    else addDocumentNonBlocking(collection(db, "roles"), { ...data, createdAt: serverTimestamp() });
    setIsRoleDialogOpen(false);
    setIsSaving(false);
    toast({ title: "Role Synchronized", description: `${roleForm.name} updated.` });
  };

  const handleSaveOrgProfile = () => {
    if (!billingSettingsRef) return;
    setIsSaving(true);
    setDocumentNonBlocking(billingSettingsRef, { ...billingForm, updatedAt: serverTimestamp() }, { merge: true });
    setTimeout(() => { setIsSaving(false); toast({ title: "Profile Synchronized", description: "Org details updated." }); }, 800);
  };

  const handleSavePersonalProfile = async () => {
    if (!memberRef || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(memberRef, { ...profileForm, updatedAt: serverTimestamp() });
      toast({ title: "Identity Synchronized", description: "Personal profile updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally { setIsSaving(false); }
  };

  const projectSettingsRef = useMemoFirebase(() => doc(db, "settings", "projects"), [db]);
  const { data: projectSettings } = useDoc(projectSettingsRef);
  const [newServiceType, setNewServiceType] = useState("");
  const [editingServiceType, setEditingServiceType] = useState<string | null>(null);
  const [editServiceValue, setEditServiceValue] = useState("");

  const handleAddServiceType = async () => {
    if (!newServiceType) return;
    const currentTypes = projectSettings?.serviceTypes || [];
    if (currentTypes.includes(newServiceType)) return;
    setIsSaving(true);
    try {
      await setDocumentNonBlocking(projectSettingsRef, { serviceTypes: [...currentTypes, newServiceType], updatedAt: serverTimestamp() }, { merge: true });
      setNewServiceType("");
      toast({ title: "Vertical Added", description: `${newServiceType} available.` });
    } catch (e: any) { toast({ variant: "destructive", title: "Sync Error", description: e.message }); } finally { setIsSaving(false); }
  };

  const handleUpdateServiceType = async () => {
    if (!editingServiceType || !editServiceValue || editingServiceType === editServiceValue) { setEditingServiceType(null); return; }
    const currentTypes = projectSettings?.serviceTypes || [];
    setIsSaving(true);
    try {
      const updatedTypes = currentTypes.map((t: string) => t === editingServiceType ? editServiceValue : t);
      await updateDoc(projectSettingsRef, { serviceTypes: updatedTypes, updatedAt: serverTimestamp() });
      setEditingServiceType(null);
      toast({ title: "Vertical Refined", description: "Nomenclature updated." });
    } catch (e: any) { toast({ variant: "destructive", title: "Update Failed", description: e.message }); } finally { setIsSaving(false); }
  };

  const handleRemoveServiceType = async (type: string) => {
    if (!confirm(`Remove '${type}'?`)) return;
    setIsSaving(true);
    try {
      const currentTypes = projectSettings?.serviceTypes || [];
      await updateDoc(projectSettingsRef, { serviceTypes: currentTypes.filter((t: string) => t !== type), updatedAt: serverTimestamp() });
      toast({ title: "Vertical Removed", description: "Library updated." });
    } catch (e: any) { toast({ variant: "destructive", title: "Sync Error", description: e.message }); } finally { setIsSaving(false); }
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedModules.findIndex((i) => i.id === active.id);
      const newIndex = orderedModules.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(orderedModules, oldIndex, newIndex);
      setOrderedModules(newOrder);
      if (navSettingsRef) setDocumentNonBlocking(navSettingsRef, { order: newOrder.map(m => m.id), updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Navigation Reordered", description: "Sidebar position updated." });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal dark:text-white">Strategic Settings</h1>
        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Manage your organization profile, team access, and system permissions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1 dark:bg-slate-900 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal whitespace-nowrap">
              <tab.icon className="h-4 w-4" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-0"><CardTitle className="text-xl font-bold font-headline">Personal Identity</CardTitle></CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="flex flex-col items-center gap-4 py-4 border-b border-slate-50 dark:border-slate-800">
                <div className="relative group cursor-pointer" onClick={() => profilePicInputRef.current?.click()}>
                  <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl bg-white dark:bg-slate-800">
                    <AvatarImage src={profileForm.thumbnail} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">{profileForm.firstName?.[0] || 'E'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Upload className="h-6 w-6 text-white" /></div>
                  <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setProfileForm(p => ({ ...p, thumbnail: r.result as string })); r.readAsDataURL(f); } }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-400">First Name</Label><Input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Last Name</Label><Input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold" /></div>
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-50"><Button onClick={handleSavePersonalProfile} disabled={isSaving} className="h-12 px-8 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Profile</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900">
            <CardHeader className="p-10 pb-0">
              <div className="flex items-center justify-between">
                <div><CardTitle className="text-xl font-bold font-headline">Project Matrix</CardTitle></div>
                <Button variant="outline" size="sm" onClick={() => { if(confirm("Restore defaults?")) { setDocumentNonBlocking(projectSettingsRef, { serviceTypes: DEFAULT_SERVICE_TYPES, updatedAt: serverTimestamp() }, { merge: true }); toast({ title: "Defaults Restored" }); } }} className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase gap-2"><RotateCcw className="h-3.5 w-3.5" /> Defaults</Button>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Add Service Vertical</Label>
                  <div className="flex gap-4"><Input value={newServiceType} onChange={e => setNewServiceType(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddServiceType()} placeholder="e.g. AI Content Repurposing" className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold flex-1" /><Button onClick={handleAddServiceType} disabled={isSaving || !newServiceType} className="h-14 px-8 rounded-2xl bg-primary text-white font-bold gap-2 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add</Button></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectSettings?.serviceTypes?.map((type: string) => (
                    <div key={type} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:shadow-md">
                      {editingServiceType === type ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input value={editServiceValue} onChange={e => setEditServiceValue(e.target.value)} className="h-10 rounded-xl bg-white border-primary/20 font-bold" autoFocus onKeyDown={e => e.key === 'Enter' && handleUpdateServiceType()} />
                          <Button size="icon" variant="ghost" onClick={handleUpdateServiceType} className="text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold text-slate-900">{type}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingServiceType(type); setEditServiceValue(type); }} className="text-slate-400 hover:text-primary">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveServiceType(type)} className="text-slate-400 hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900">
            <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30">
              <div><CardTitle className="text-xl font-bold font-headline">Navigation Architecture</CardTitle></div>
              <div className="flex items-center gap-4"><Label className="text-[10px] font-bold uppercase text-slate-400">Select Role:</Label><Select value={selectedRoleIdForNav} onValueChange={setSelectedRoleIdForNav}><SelectTrigger className="h-12 w-full md:w-[240px] rounded-xl bg-white font-bold text-xs uppercase"><SelectValue placeholder="Choose Role" /></SelectTrigger><SelectContent className="rounded-xl shadow-xl">{roles?.map(r => (<SelectItem key={r.id} value={r.id} className="text-xs font-bold uppercase">{r.name}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <CardContent className="p-0">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-slate-50">
                    {orderedModules.map((item) => (
                      <SortableNavigationItem key={item.id} item={item} roles={roles} selectedRoleId={selectedRoleIdForNav} db={db} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SortableNavigationItem({ item, roles, selectedRoleId, db }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.5 : 1 };
  const Icon = item.icon || Globe;
  const selectedRole = roles?.find((r: any) => r.id === selectedRoleId);
  const isMasterRole = selectedRole?.name === 'Root Administrator' || selectedRole?.name === 'Super Admin';
  const hasAccess = selectedRole?.permissions?.includes(`module:${item.id}`) || isMasterRole;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors bg-white dark:bg-slate-900">
      <div className="flex items-center gap-6"><button {...attributes} {...listeners} className="p-2 hover:bg-slate-100 rounded-lg"><GripVertical className="h-5 w-5 text-slate-300" /></button><div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div><div><p className="font-bold text-slate-900 dark:text-white">{item.title}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/{item.id}</p></div></div>
      <div className="flex items-center gap-4"><span className={`text-[10px] font-bold uppercase tracking-widest ${hasAccess ? 'text-primary' : 'text-slate-300'}`}>{hasAccess ? 'Authorized' : 'Restricted'}</span><Switch disabled={isMasterRole} checked={!!hasAccess} onCheckedChange={checked => { if (!selectedRole) return; const perm = `module:${item.id}`; const updatedPerms = checked ? [...(selectedRole.permissions || []), perm] : (selectedRole.permissions || []).filter((p: string) => p !== perm); updateDocumentNonBlocking(doc(db, "roles", selectedRole.id), { permissions: updatedPerms }); toast({ title: "Authority Adjusted", description: `${item.title} visibility updated.` }); }} /></div>
    </div>
  );
}
