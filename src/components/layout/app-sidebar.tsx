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
  LogOut,
  Briefcase,
  Globe,
  Clock,
  Zap,
  User,
  ChevronsUpDown,
  TrendingUp,
  Receipt,
  Settings
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ICON_MAP: Record<string, any> = {
  LayoutGrid,
  TrendingUp,
  GitBranch,
  Folder,
  Trello,
  Calendar,
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  LogOut,
  Briefcase,
  Globe,
  Clock,
  Zap,
  User,
  Receipt,
  Settings
};

const ALL_MODULES = [
  { id: "dashboard", title: "Dashboard", iconName: "TrendingUp", url: "/dashboard", group: "core" },
  { id: "admin", title: "Admin", iconName: "ShieldCheck", url: "/admin", group: "core" },
  { id: "intelligence", title: "Intelligence", iconName: "Zap", url: "/intelligence", group: "core" },
  { id: "pipeline", title: "Pipeline", iconName: "GitBranch", url: "/pipeline", group: "phases" },
  { id: "proposals", title: "Proposal", iconName: "FileText", url: "/proposals", group: "phases" },
  { id: "projects", title: "Projects", iconName: "Folder", url: "/projects", group: "phases" },
  { id: "board", title: "Kanban", iconName: "Trello", url: "/board", group: "phases" },
  { id: "clients", title: "Clients", iconName: "Briefcase", url: "/clients", group: "phases" },
  { id: "team", title: "Organization", iconName: "Users", url: "/team", group: "phases" },
  { id: "billing", title: "Invoice", iconName: "Receipt", url: "/invoices", group: "phases" },
  { id: "market", title: "Marketing Intel", iconName: "Globe", url: "/market-research", group: "phases" },
  { id: "talent-library", title: "Talent Library", iconName: "Users", url: "/talent-library", group: "network" },
];

const GROUPS = [
  { id: "core", label: "Core" },
  { id: "phases", label: "Operations" },
  { id: "network", label: "Network" },
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

  const isMasterUser = user?.email?.toLowerCase() === 'defineperspective.in@gmail.com';
  const isAdmin = isMasterUser || userData?.role === 'admin';
  const isApproved = isAdmin || userData?.status === 'approved' || userData?.status === 'active';

  const groupedMenuItems = useMemo(() => {
    const allowedModules = ALL_MODULES.filter(item => {
      // Root admin sees everything
      if (isAdmin) return true;
      
      // Basic approved user sees everything except admin
      if (isApproved) return item.id !== 'admin';
      
      return false;
    });

    return GROUPS.map(group => ({
      ...group,
      items: allowedModules.filter(item => item.group === group.id)
    })).filter(g => g.items.length > 0);
  }, [isAdmin, isApproved]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar font-body">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 transition-transform group-hover:rotate-6">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-headline font-bold text-sm tracking-tight leading-none text-slate-900">MediaFlow</p>
            <p className="text-[7px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Permit OS v2.8</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        {groupedMenuItems.map((group) => (
          <SidebarGroup key={group.id} className="py-1">
            <SidebarGroupLabel className="px-4 text-[8px] font-bold uppercase text-slate-400 mb-1 group-data-[collapsible=icon]:hidden tracking-[0.3em]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                  const Icon = ICON_MAP[item.iconName] || Globe;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`rounded-xl h-9 px-4 transition-all ${
                          isActive 
                            ? "bg-primary text-white shadow-xl shadow-primary/20" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="ml-3 font-bold text-[10px] group-data-[collapsible=icon]:hidden uppercase tracking-widest">
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-xl px-2 hover:bg-slate-50 data-[state=open]:bg-slate-50 transition-all"
                >
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm border border-slate-100">
                    <AvatarImage src={userData?.photoURL || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                      {userData?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 text-left group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-[10px] text-slate-900 uppercase tracking-widest truncate">
                      {userData?.name || "Expert Identity"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight truncate">
                      {userData?.role || "Personnel"}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 text-slate-400 ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl p-2 shadow-2xl border-slate-100"
                side="top"
                align="end"
                sideOffset={12}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userData?.photoURL || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                        {userData?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-[10px] text-slate-900 uppercase tracking-widest">
                        {userData?.name}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">
                        {userData?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer gap-3 focus:bg-primary/5 focus:text-primary">
                  <Link href={`/team/${user?.uid}`}>
                    <User className="h-4 w-4 opacity-60" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer gap-3 text-destructive focus:bg-destructive/5 focus:text-destructive">
                  <Link href="/logout">
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span className="font-bold text-[10px] uppercase tracking-widest">Logout Session</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
