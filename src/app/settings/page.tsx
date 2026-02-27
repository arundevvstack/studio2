"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Check,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Smartphone,
  Laptop,
  LogOut
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
import { collection, query, orderBy, doc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SIDEBAR_MODULES = [
  { id: "dashboard", title: "Dashboard", icon: LayoutGrid },
  { id: "proposals", title: "Proposal", icon: FileText },
  { id: "talent-library", title: "Talent Library", icon: Users },
  { id: "pipeline", title: "Pipeline", icon: GitBranch },
  { id: "projects", title: "Projects", icon: Briefcase },
  { id: "board", title: "Kanban", icon: Trello },
  { id: "clients", title: "Clients", icon: Briefcase },
  { id: "schedule", title: "Schedule", icon: Calendar },
  { id: "time", title: "Time Tracking", icon: Clock },
  { id: "team", title: "Team", icon: Users },
  { id: "billing", title: "Invoice", icon: Receipt },
  { id: "intelligence", title: "Intelligence", icon: BarChart3 },
  { id: "market", title: "Marketing Intelligence", icon: Globe },
  { id: "admin", title: "Admin", icon: ShieldCheck },
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
  { id: "sessions", label: "Security & Sessions", icon: Shield },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "users", label: "Database Users", icon: Users },
  { id: "project", label: "Project Settings", icon: Briefcase },
  { id: "billing", label: "Financials", icon: Receipt },
  { id: "navigation", label: "Navigation", icon: LayoutGrid },
  { id: "roles", label: "Roles", icon: Key },
  { id: "preferences", label: "Preferences", icon: Monitor },
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

const THEME_COLORS = [
  { name: "Vibrant Blue", value: "204 61% 47%" },
  { name: "Ruby Red", value: "0 84% 60%" },
  { name: "Emerald Green", value: "142 76% 36%" },
  { name: "Deep Violet", value: "262 83% 58%" },
  { name: "Amber Gold", value: "38 92% 50%" },
  { name: "Slate Grey", value: "215 25% 27%" },
  { name: "Rose Pink", value: "330 81% 60%" },
  { name: "Cyan Spark", value: "188 86% 43%" }
];

export default function SettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [primaryColor, setPrimaryColor] = useState("204 61% 47%");
  const [selectedRoleIdForNav, setSelectedRoleIdForNav] = useState<string>("");
  const [orderedModules, setOrderedModules] = useState(SIDEBAR_MODULES);
  const [userToPurge, setUserToPurge] = useState<any>(null);
  
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme-mode") as any || "light";
      const savedColor = localStorage.getItem("theme-color") || "204 61% 47%";
      setThemeMode(savedTheme);
      setPrimaryColor(savedColor);
    }
  }, []);

  const registryRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: currentIdentity } = useDoc(registryRef);

  const rolesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "roles"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: roles } = useCollection(rolesQuery);

  const databaseUsersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users"), orderBy("updatedAt", "desc"));
  }, [db, user]);
  const { data: databaseUsers, isLoading: usersLoading } = useCollection(databaseUsersQuery);

  const userRoleRef = useMemoFirebase(() => {
    if (!currentIdentity?.role) return null;
    return doc(db, "roles", currentIdentity.role);
  }, [db, currentIdentity?.role]);
  const { data: userRole } = useDoc(userRoleRef);

  const isMasterAdmin = currentIdentity?.role === 'admin' || currentIdentity?.email === 'defineperspective.in@gmail.com';

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers", user.uid, "sessions"), orderBy("lastActive", "desc"));
  }, [db, user]);
  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRoleIdForNav) {
      setSelectedRoleIdForNav(roles[0].id);
    }
  }, [roles, selectedRoleIdForNav]);

  const hasPermission = (perm: string) => {
    if (isMasterAdmin) return true;
    return userRole?.permissions?.includes(perm) || false;
  };

  const visibleTabs = useMemo(() => {
    return SETTINGS_TABS.filter(tab => {
      if (tab.id === 'sessions') return true;
      if (tab.id === 'preferences') return true; 
      if (tab.id === 'users') return isMasterAdmin;
      return hasPermission(`settings:${tab.id}`);
    });
  }, [userRole, isMasterAdmin]);

  const [activeTab, setActiveTab] = useState("sessions");

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

  const handleApplyPreferences = () => {
    if (typeof window === "undefined") return;
    setIsSaving(true);
    localStorage.setItem("theme-mode", themeMode);
    localStorage.setItem("theme-color", primaryColor);
    
    const html = document.documentElement;
    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    html.style.setProperty('--primary', primaryColor);
    html.style.setProperty('--ring', primaryColor);

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Preferences Applied", description: "Theme and branding synchronized." });
    }, 500);
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

  const executePurgeUser = () => {
    if (userToPurge) {
      deleteDocumentNonBlocking(doc(db, "users", userToPurge.id));
      toast({ variant: "destructive", title: "Identity Deleted", description: `${userToPurge.email} removed from system registry.` });
      setUserToPurge(null);
    }
  };

  const handleTerminateSession = async (sid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "teamMembers", user.uid, "sessions", sid));
      toast({ title: "Session Terminated", description: "Access revoked for the selected entry node." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Termination Failed", description: e.message });
    }
  };

  const currentSid = typeof window !== 'undefined' ? localStorage.getItem('mf_session_id') : null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Manage your organization profile, team access, and system preferences.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-xl shadow-sm gap-1 dark:bg-slate-900 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal whitespace-nowrap">
              <tab.icon className="h-4 w-4" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="sessions" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[10px] bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold font-headline">Active Entry Nodes</CardTitle>
                  <CardDescription>Monitor and manage all active browser and device sessions for this identity.</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {sessions?.length || 0} ACTIVE NODES
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {sessionsLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-widest">Device / Browser</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Platform</TableHead>
                      <TableHead className="text-[10px) font-bold uppercase tracking-widest">Last Intelligence Sync</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions?.map((session) => {
                      const isCurrent = session.id === currentSid;
                      return (
                        <TableRow key={session.id} className={`group hover:bg-slate-50/50 transition-colors border-slate-50 dark:border-slate-800 ${isCurrent ? 'bg-primary/5' : ''}`}>
                          <TableCell className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center dark:bg-slate-800 dark:border-slate-700">
                                {session.deviceType === 'Mobile' ? <Smartphone className="h-5 w-5 text-slate-400" /> : <Laptop className="h-5 w-5 text-slate-400" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {session.browser || "Unknown Browser"}
                                  {isCurrent && <Badge className="bg-primary text-white border-none text-[7px] px-2 h-4 rounded-full uppercase tracking-widest">CURRENT</Badge>}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">{session.userAgent?.substring(0, 40)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{session.platform}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                              <Clock className="h-3.5 w-3.5 opacity-40" />
                              <span>{session.lastActive?.toDate().toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-10">
                            {isCurrent ? (
                              <Button variant="ghost" disabled className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-300">Self Node</Button>
                            ) : (
                              <Button 
                                onClick={() => handleTerminateSession(session.id)}
                                variant="outline" 
                                size="sm" 
                                className="h-10 px-4 rounded-xl bg-white hover:bg-red-50 hover:text-red-600 text-slate-600 border-slate-100 transition-all font-bold text-[10px] uppercase tracking-widest gap-2"
                              >
                                <LogOut className="h-3.5 w-3.5" />
                                Logout
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[10px] bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-xl font-bold font-headline">Identity Registry</CardTitle>
              <CardDescription>Authorize permits and manage permanent organizational deletions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-widest">Expert Identity</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Email Identifier</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Access</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {databaseUsers?.map((dbUser) => (
                      <TableRow key={dbUser.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                        <TableCell className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 rounded-xl border-2 border-white shadow-sm">
                              <AvatarImage src={dbUser.photoURL} />
                              <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{dbUser.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-slate-900 dark:text-white">{dbUser.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <Mail className="h-3.5 w-3.5 opacity-40" />
                            <span>{dbUser.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full ${
                            dbUser.status === 'active' ? 'bg-green-50 text-green-600' : 
                            dbUser.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {dbUser.status === 'active' ? 'AUTHORIZED' : dbUser.status === 'pending' ? 'PENDING' : 'SUSPENDED'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                              <Link href="/admin">
                                <Edit2 className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setUserToPurge(dbUser)}
                              className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 dark:bg-slate-800 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        <TabsContent value="preferences" className="animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-[10px] bg-white dark:bg-slate-900">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" /> Visual Theme
                </CardTitle>
                <CardDescription>Configure the interface aesthetics for your workspace.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-10">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "dark", icon: Moon, label: "Deep Black" },
                    { id: "system", icon: Monitor, label: "System" }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setThemeMode(mode.id as any)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                        themeMode === mode.id 
                          ? "border-primary bg-primary/5 text-primary shadow-md" 
                          : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200 dark:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <mode.icon className="h-6 w-6" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{mode.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Brand Primary Color</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setPrimaryColor(color.value)}
                        className={`h-12 w-full rounded-xl transition-all flex items-center justify-center border-2 ${
                          primaryColor === color.value ? "border-slate-900 dark:border-white scale-105" : "border-transparent"
                        }`}
                        style={{ backgroundColor: `hsl(${color.value})` }}
                        title={color.name}
                      >
                        {primaryColor === color.value && <Check className="h-4 w-4 text-white" />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <Pipette className="h-4 w-4 text-slate-400" />
                    <Input 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)} 
                      placeholder="Custom HSL Value (e.g. 204 61% 47%)" 
                      className="h-12 rounded-xl bg-slate-50 border-none font-mono text-xs dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                  <Button onClick={handleApplyPreferences} disabled={isSaving} className="h-12 px-10 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 
                    Apply Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[10px] bg-slate-900 text-white p-10 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 space-y-6">
                <Badge className="bg-white/10 text-white border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Aesthetics Sync</Badge>
                <h3 className="text-3xl font-bold font-headline tracking-tight leading-tight">Unified Brand Architecture</h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed italic">
                  "Your preferences are applied across the entire operating system, from the client-facing portal to the internal intelligence ledger."
                </p>
                <div className="pt-10 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {i}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Environment Synchronized</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="project" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[10px] bg-white dark:bg-slate-900">
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
                    <div key={type} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
                      {editingServiceType === type ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input value={editServiceValue} onChange={e => setEditServiceValue(e.target.value)} className="h-10 rounded-xl bg-white border-primary/20 font-bold" autoFocus onKeyDown={e => e.key === 'Enter' && handleUpdateServiceType()} />
                          <Button size="icon" variant="ghost" onClick={handleUpdateServiceType} className="text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{type}</span>
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
          <Card className="border-none shadow-sm rounded-[10px] bg-white dark:bg-slate-900">
            <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30 dark:bg-slate-800/20">
              <div><CardTitle className="text-xl font-bold font-headline">Navigation Architecture</CardTitle></div>
              <div className="flex items-center gap-4"><Label className="text-[10px] font-bold uppercase text-slate-400">Select Role:</Label><Select value={selectedRoleIdForNav} onValueChange={setSelectedRoleIdForNav}><SelectTrigger className="h-12 w-full md:w-[240px] rounded-xl bg-white font-bold text-xs uppercase dark:bg-slate-800"><SelectValue placeholder="Choose Role" /></SelectTrigger><SelectContent className="rounded-xl shadow-xl">{roles?.map(r => (<SelectItem key={r.id} value={r.id} className="text-xs font-bold uppercase">{r.name}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <CardContent className="p-0">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {orderedModules.map((item) => (
                      <SortableNavigationItem key={item.id} item={item} roles={roles} selectedRoleId={selectedRoleIdForNav} db={db} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="animate-in slide-in-from-left-2 duration-300">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-headline">Administrative Access Roles</h3>
                <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Configure module access and action permissions for the production team.</p>
              </div>
              <Button onClick={() => handleOpenRoleDialog()} className="rounded-xl font-bold h-12 gap-2 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" /> Create Role</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles?.map((role) => (
                <Card key={role.id} className="border-none shadow-sm rounded-[10px] bg-white group hover:shadow-xl transition-all dark:bg-slate-900">
                  <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold font-headline">{role.name}</h4>
                      <Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100 dark:border-slate-800">{role.permissions?.length || 0} Permissions</Badge>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800" onClick={() => handleOpenRoleDialog(role)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-destructive dark:bg-slate-800" onClick={() => deleteDocumentNonBlocking(doc(db, "roles", role.id))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed dark:text-slate-400">{role.description || "No strategic description provided."}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent className="sm:max-w-[800px] rounded-[10px] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-10 pb-4 bg-slate-50 dark:bg-slate-800"><DialogTitle className="text-2xl font-bold font-headline">{editingRole ? 'Update Access Role' : 'Provision New Role'}</DialogTitle></DialogHeader>
              <div className="p-10 pt-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Role Nomenclature</Label><Input value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg dark:bg-slate-800" placeholder="e.g. Executive Producer" /></div>
                  <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Strategic Description</Label><Input value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold dark:bg-slate-800" /></div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-sm font-bold font-headline flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-primary" /> Dashboard Modules</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {DASHBOARD_ITEMS.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700" onClick={() => handleTogglePermission(`dash:${item.id}`)}>
                        <Checkbox checked={roleForm.permissions.includes(`dash:${item.id}`)} onCheckedChange={() => {}} className="rounded-md border-slate-200 pointer-events-none" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest dark:text-slate-300">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-sm font-bold font-headline flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> System Capabilities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['settings:view', 'settings:organization', 'settings:roles', 'settings:project', 'settings:billing', 'settings:navigation', 'settings:preferences'].map(perm => (
                      <div key={perm} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700" onClick={() => handleTogglePermission(perm)}>
                        <Checkbox checked={roleForm.permissions.includes(perm)} onCheckedChange={() => {}} className="rounded-md border-slate-200 pointer-events-none" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest dark:text-slate-300">{perm.split(':')[1].toUpperCase()} Access</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-10 dark:bg-slate-800"><Button onClick={handleSaveRole} disabled={isSaving} className="h-14 px-12 rounded-full font-bold bg-primary text-white shadow-2xl shadow-primary/20 transition-all active:scale-95">{isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />} Deploy Role</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!userToPurge} onOpenChange={(o) => !o && setUserToPurge(null)}>
        <AlertDialogContent className="rounded-[10px] border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle className="font-headline text-xl">Confirm Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-500 font-medium leading-relaxed">
              This will permanently remove <span className="font-bold text-slate-900">{userToPurge?.email}</span> from the organizational registry. This action is irreversible and terminates all future authentication permits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-[10px] font-bold text-xs uppercase tracking-normal">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executePurgeUser} 
              className="bg-destructive hover:bg-destructive/90 text-white rounded-[10px] font-bold px-8 uppercase text-xs tracking-normal"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableNavigationItem({ item, roles, selectedRoleId, db }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.5 : 1 };
  const Icon = item.icon || Globe;
  const selectedRole = roles?.find((r: any) => r.id === selectedRoleId);
  const isMasterRole = selectedRole?.name === 'Root Administrator' || selectedRole?.name === 'Super Admin' || selectedRole?.id === 'root-admin';
  const hasAccess = selectedRole?.permissions?.includes(`module:${item.id}`) || isMasterRole;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors bg-white dark:bg-slate-900">
      <div className="flex items-center gap-6">
        <button {...attributes} {...listeners} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800">
          <GripVertical className="h-5 w-5 text-slate-300" />
        </button>
        <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center dark:bg-slate-800 dark:border-slate-700">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/{item.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${hasAccess ? 'text-primary' : 'text-slate-300'}`}>
          {hasAccess ? 'Authorized' : 'Restricted'}
        </span>
        <Switch 
          disabled={isMasterRole} 
          checked={!!hasAccess} 
          onCheckedChange={checked => { 
            if (!selectedRole) return; 
            const perm = `module:${item.id}`; 
            const updatedPerms = checked 
              ? [...(selectedRole.permissions || []), perm] 
              : (selectedRole.permissions || []).filter((p: string) => p !== perm); 
            updateDocumentNonBlocking(doc(db, "roles", selectedRole.id), { permissions: updatedPerms }); 
            toast({ title: "Authority Adjusted", description: `${item.title} visibility updated.` }); 
          }} 
        />
      </div>
    </div>
  );
}
