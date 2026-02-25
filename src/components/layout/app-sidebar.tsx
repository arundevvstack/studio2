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
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  Briefcase,
  Globe,
  Clock,
  Key,
  Shield,
  Zap
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";

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
  Plus,
  ChevronRight,
  Briefcase,
  Globe,
  Clock,
  Key,
  Shield,
  Zap
};

const DEFAULT_WORKSPACE_ITEMS = [
  { id: "dashboard", title: "Dashboard", iconName: "LayoutGrid", url: "/", order: 1, isVisible: true },
  { id: "talent-library", title: "Talent Library", iconName: "Users", url: "/talent-library", order: 2, isVisible: true },
  { id: "pipeline", title: "Pipeline", iconName: "GitBranch", url: "/pipeline", order: 3, isVisible: true },
  { id: "projects", title: "Projects", iconName: "Folder", url: "/projects", order: 4, isVisible: true },
  { id: "board", title: "Board", iconName: "Trello", url: "/board", order: 5, isVisible: true },
  { id: "clients", title: "Clients", iconName: "Briefcase", url: "/clients", order: 6, isVisible: true },
  { id: "schedule", title: "Schedule", iconName: "Calendar", url: "/schedule", order: 7, isVisible: true },
  { id: "time", title: "Time Tracking", iconName: "Clock", url: "/time", order: 8, isVisible: true },
  { id: "team", title: "Team", iconName: "Users", url: "/team", order: 9, isVisible: true },
  { id: "billing", title: "Billing", iconName: "FileText", url: "/invoices", order: 10, isVisible: true },
  { id: "intelligence", title: "Intelligence", iconName: "BarChart3", url: "/sales-forecast", order: 11, isVisible: true },
  { id: "market", title: "Market Research", iconName: "Globe", url: "/market-research", order: 12, isVisible: true },
];

const MANAGEMENT_ITEMS = [
  { id: "admin", title: "Admin Console", iconName: "ShieldCheck", url: "/admin", order: 1, isVisible: true },
  { id: "settings", title: "Settings", iconName: "Settings", url: "/settings", order: 2, isVisible: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const db = useFirestore();
  const { user } = useUser();

  const billingRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: globalSettings } = useDoc(billingRef);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 pb-2 space-y-6">
        <div className="flex flex-col items-center gap-1 group-data-[collapsible=icon]:hidden">
          {globalSettings?.logo ? (
            <div className="h-14 w-auto mb-1 flex items-center justify-center">
              <img src={globalSettings.logo} alt="Organization Logo" className="h-full w-auto object-contain" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
          )}
        </div>

        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold text-sm shadow-lg shadow-primary/20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
          <Link href="/projects/new">
            <Plus className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Add Project</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase text-slate-400 mb-4 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {DEFAULT_WORKSPACE_ITEMS.map((item) => {
              const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
              const Icon = ICON_MAP[item.iconName] || Globe;
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`rounded-xl h-11 px-3 transition-all ${
                      isActive 
                        ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-100" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="ml-auto h-3 w-3 opacity-40 group-data-[collapsible=icon]:hidden" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase text-slate-400 mb-4 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {MANAGEMENT_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.url);
              const Icon = ICON_MAP[item.iconName] || ShieldCheck;
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`rounded-xl h-11 px-3 transition-all ${
                      isActive 
                        ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-100" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="ml-auto h-3 w-3 opacity-40 group-data-[collapsible=icon]:hidden" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarSeparator className="mb-4 bg-slate-100" />
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="rounded-xl h-11 px-3 text-slate-500 hover:bg-slate-50"
            >
              <Link href="/logout" className="flex items-center">
                <LogOut className="h-[18px] w-[18px]" />
                <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                  Log Out
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
