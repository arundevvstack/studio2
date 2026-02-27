
"use client";

import React, { useMemo } from "react";
import {
  LayoutGrid,
  GitBranch,
  Folder,
  Trello,
  Calendar,
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Briefcase,
  Globe,
  Clock,
  Zap,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ICON_MAP: Record<string, any> = {
  LayoutGrid,
  GitBranch,
  Folder,
  Trello,
  Calendar,
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Briefcase,
  Globe,
  Clock,
  Zap,
  User
};

const ALL_MODULES = [
  { id: "dashboard", title: "Expert Hub", iconName: "LayoutGrid", url: "/dashboard", group: "core", phase: null },
  { id: "pipeline", title: "Sales Phase", iconName: "GitBranch", url: "/pipeline", group: "phases", phase: "sales" },
  { id: "proposals", title: "Proposals Hub", iconName: "FileText", url: "/proposals", group: "phases", phase: "sales" },
  { id: "projects", title: "Production Phase", iconName: "Folder", url: "/projects", group: "phases", phase: "production" },
  { id: "board", title: "Kanban Grid", iconName: "Trello", url: "/board", group: "phases", phase: "production" },
  { id: "billing", title: "Release Phase", iconName: "FileText", url: "/invoices", group: "phases", phase: "release" },
  { id: "market", title: "Market Intel", iconName: "Globe", url: "/market-research", group: "phases", phase: "socialMedia" },
  { id: "talent-library", title: "Talent Library", iconName: "Users", url: "/talent-library", group: "network", phase: null },
  { id: "team", title: "Organization", iconName: "Users", url: "/team", group: "admin", phase: null },
  { id: "admin", title: "Admin Console", iconName: "ShieldCheck", url: "/admin", group: "admin", phase: null },
];

const GROUPS = [
  { id: "core", label: "Intelligence" },
  { id: "phases", label: "Permitted Phases" },
  { id: "network", label: "Network Node" },
  { id: "admin", label: "Identity Governance" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const db = useFirestore();
  const { user } = useUser();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: userData } = useDoc(userRef);

  const permittedPhases = userData?.permittedPhases || [];
  const isAdmin = userData?.role === 'admin';

  const groupedMenuItems = useMemo(() => {
    const allowedModules = ALL_MODULES.filter(item => {
      // 1. Root Administrators see everything
      if (isAdmin) return true;
      
      // 2. Filter modules tied to specific Permit Phases
      if (item.phase) {
        return permittedPhases.includes(item.phase);
      }
      
      // 3. Baseline modules for authorized experts
      return item.group === 'core' || item.group === 'network';
    });

    return GROUPS.map(group => ({
      ...group,
      items: allowedModules.filter(item => item.group === group.id)
    })).filter(g => g.items.length > 0);
  }, [permittedPhases, isAdmin]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar font-body">
      <SidebarHeader className="p-6">
        <Link href="/dashboard" className="flex items-center gap-4 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 shrink-0 transition-transform group-hover:rotate-6">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-headline font-bold text-base tracking-tight leading-none text-slate-900">MediaFlow</p>
            <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5">Permit OS v2.8</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-8">
        {groupedMenuItems.map((group) => (
          <SidebarGroup key={group.id} className="py-3">
            <SidebarGroupLabel className="px-4 text-[9px] font-bold uppercase text-slate-400 mb-3 group-data-[collapsible=icon]:hidden tracking-[0.3em]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.url);
                  const Icon = ICON_MAP[item.iconName] || Globe;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`rounded-2xl h-12 px-5 transition-all ${
                          isActive 
                            ? "bg-primary text-white shadow-xl shadow-primary/20" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="ml-4 font-bold text-[11px] group-data-[collapsible=icon]:hidden uppercase tracking-widest">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-sidebar-border/50">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-2xl h-12 px-5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <Link href="/settings"><Settings className="h-4.5 w-4.5" /><span className="ml-4 font-bold text-[11px] uppercase tracking-widest group-data-[collapsible=icon]:hidden">Preferences</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-2xl h-12 px-5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Link href="/logout"><LogOut className="h-4.5 w-4.5" /><span className="ml-4 font-bold text-[11px] uppercase tracking-widest group-data-[collapsible=icon]:hidden">Terminate Session</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
