
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
  HelpCircle
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
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

// Icon Map for Dynamic Sidebar
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
  Clock
};

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

const managementItems = [
  { title: "Admin Console", icon: ShieldCheck, url: "/admin" },
];

const footerItems = [
  { title: "Settings", icon: Settings, url: "/settings", color: "text-slate-500" },
  { title: "Log out", icon: LogOut, url: "/logout", color: "text-primary" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const db = useFirestore();
  const { user } = useUser();

  const navQuery = useMemoFirebase(() => {
    return query(collection(db, "sidebar_items"), orderBy("order", "asc"));
  }, [db]);

  const { data: remoteItems, isLoading } = useCollection(navQuery);

  const displayItems = React.useMemo(() => {
    // If we have remote items and not loading, use them filtered by visibility
    if (remoteItems && remoteItems.length > 0) {
      return remoteItems.filter(item => item.isVisible !== false);
    }
    // Fallback to defaults if no remote items yet
    return DEFAULT_WORKSPACE_ITEMS;
  }, [remoteItems]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 pb-2 space-y-6">
        <div className="flex flex-col items-center gap-1 group-data-[collapsible=icon]:hidden">
          <svg
            width="40"
            height="30"
            viewBox="0 0 40 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path
              d="M5 25L15 5L25 25M15 25L25 5L35 25"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-900 uppercase dark:text-white">Marzelz</h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase -mt-1">Lifestyle</p>
          </div>
        </div>

        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold text-sm shadow-lg shadow-primary/20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
          <Link href="/projects/new">
            <Plus className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Add Project</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase text-slate-400 mb-4 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {displayItems.map((item) => {
              const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
              const Icon = ICON_MAP[item.iconName] || HelpCircle;
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`rounded-xl h-11 px-3 transition-all ${
                      isActive 
                        ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-100 dark:bg-white/10 dark:text-white dark:ring-white/20" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
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

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase text-slate-400 mb-4 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarMenu>
            {managementItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="rounded-xl h-11 px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Link href={item.url} className="flex items-center">
                    <item.icon className="h-[18px] w-[18px] text-slate-400" />
                    <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarSeparator className="mb-4 bg-slate-100 dark:bg-white/10" />
        <SidebarMenu className="space-y-1">
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`rounded-xl h-11 px-3 hover:bg-slate-50 dark:hover:bg-white/5 ${item.color}`}
              >
                <Link href={item.url} className="flex items-center">
                  <item.icon className="h-[18px] w-[18px]" />
                  <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
