"use client";

import React from "react";
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
  Briefcase,
  Globe,
  Clock,
  Zap,
  Receipt,
  Settings,
  TrendingUp
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
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  Briefcase,
  Globe,
  Clock,
  Zap,
  Receipt,
  Settings
};

const ALL_MODULES = [
  { id: "dashboard", title: "Dashboard", iconName: "TrendingUp", url: "/dashboard", group: "core" },
  { id: "admin", title: "Admin", iconName: "ShieldCheck", url: "/admin", group: "core" },
  { id: "intelligence", title: "Intelligence", iconName: "Zap", url: "/intelligence", group: "core" },
  { id: "settings", title: "Settings", iconName: "Settings", url: "/settings", group: "core" },
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar font-body">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 transition-transform group-hover:rotate-6">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-headline font-bold text-sm tracking-tight leading-none text-slate-900">MediaFlow</p>
            <p className="text-[7px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Open Node v3.0</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        {GROUPS.map((group) => (
          <SidebarGroup key={group.id} className="py-1">
            <SidebarGroupLabel className="px-4 text-[8px] font-bold uppercase text-slate-400 mb-1 group-data-[collapsible=icon]:hidden tracking-[0.3em]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {ALL_MODULES.filter(item => item.group === group.id).map((item) => {
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
    </Sidebar>
  );
}