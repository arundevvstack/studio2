
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
  { id: "dashboard", title: "Dashboard", iconName: "LayoutGrid", url: "/dashboard", group: "core", phase: null },
  { id: "pipeline", title: "Sales Phase", iconName: "GitBranch", url: "/pipeline", group: "phases", phase: "sales" },
  { id: "proposals", title: "Proposals", iconName: "FileText", url: "/proposals", group: "phases", phase: "sales" },
  { id: "projects", title: "Production Phase", iconName: "Folder", url: "/projects", group: "phases", phase: "production" },
  { id: "board", title: "Kanban Board", iconName: "Trello", url: "/board", group: "phases", phase: "production" },
  { id: "billing", title: "Release Phase", iconName: "FileText", url: "/invoices", group: "phases", phase: "release" },
  { id: "market", title: "Market Intel", iconName: "Globe", url: "/market-research", group: "phases", phase: "socialMedia" },
  { id: "talent-library", title: "Talent Registry", iconName: "Users", url: "/talent-library", group: "network", phase: null },
  { id: "team", title: "Organization", iconName: "Users", url: "/team", group: "admin", phase: null },
  { id: "admin", title: "Admin Hub", iconName: "ShieldCheck", url: "/admin", group: "admin", phase: null },
];

const GROUPS = [
  { id: "core", label: "Core" },
  { id: "phases", label: "Operational Phases" },
  { id: "network", label: "Network" },
  { id: "admin", label: "Administration" },
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
  const userRole = userData?.role || null;

  const groupedMenuItems = useMemo(() => {
    const isAdmin = userRole === 'admin';
    
    const allowedModules = ALL_MODULES.filter(item => {
      // Admins see everything
      if (isAdmin) return true;
      
      // If module is tied to a phase, check permit
      if (item.phase) {
        return permittedPhases.includes(item.phase);
      }
      
      // Default core modules for all active users
      return item.group === 'core' || item.group === 'network';
    });

    return GROUPS.map(group => ({
      ...group,
      items: allowedModules.filter(item => item.group === group.id)
    })).filter(g => g.items.length > 0);
  }, [permittedPhases, userRole]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 transition-transform group-hover:rotate-6">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-headline font-bold text-sm tracking-tight">MediaFlow</p>
            <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Phase Operating System</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-6">
        {groupedMenuItems.map((group) => (
          <SidebarGroup key={group.id} className="py-2">
            <SidebarGroupLabel className="px-4 text-[9px] font-bold uppercase text-slate-400 mb-2 group-data-[collapsible=icon]:hidden tracking-[0.2em]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.url);
                  const Icon = ICON_MAP[item.iconName] || Globe;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`rounded-xl h-11 px-4 ${
                          isActive 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="ml-4 font-bold text-[11px] group-data-[collapsible=icon]:hidden uppercase tracking-wider">
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

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-xl h-11 px-4 text-slate-500 hover:bg-slate-50">
              <Link href="/settings"><Settings className="h-4 w-4" /><span className="ml-4 font-bold text-[11px] uppercase tracking-wider group-data-[collapsible=icon]:hidden">Settings</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-xl h-11 px-4 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Link href="/logout"><LogOut className="h-4 w-4" /><span className="ml-4 font-bold text-[11px] uppercase tracking-wider group-data-[collapsible=icon]:hidden">Terminate Session</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
