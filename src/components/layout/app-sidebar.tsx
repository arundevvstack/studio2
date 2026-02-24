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
  LogIn,
  Plus,
  ChevronRight,
  Briefcase,
  Globe,
  Clock,
  HelpCircle,
  Key,
  Shield
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
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";

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
  LogIn,
  Plus,
  ChevronRight,
  Briefcase,
  Globe,
  Clock,
  Key,
  Shield
};

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

const managementItems = [
  { id: "admin", title: "Admin Console", icon: ShieldCheck, url: "/admin" },
  { id: "user-management", title: "User Management", icon: Shield, url: "/admin/users" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const db = useFirestore();
  const { user } = useUser();

  // Auth & Permissions
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member } = useDoc(memberRef);

  const roleRef = useMemoFirebase(() => {
    if (!member?.roleId) return null;
    return doc(db, "roles", member.roleId);
  }, [db, member?.roleId]);
  const { data: role } = useDoc(roleRef);

  const hasPermission = (perm: string) => {
    if (!role) return true; // Proto phase: assume access if role registry not yet managed
    return role.permissions?.includes(perm);
  };

  const navQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "sidebar_items"), orderBy("order", "asc"));
  }, [db, user]);
  const { data: remoteItems } = useCollection(navQuery);

  const billingRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: globalSettings } = useDoc(billingRef);

  const displayItems = React.useMemo(() => {
    const items = (remoteItems && remoteItems.length > 0) ? remoteItems : DEFAULT_WORKSPACE_ITEMS;
    return items.filter(item => (item.isVisible !== false) && hasPermission(`module:${item.id}`));
  }, [remoteItems, role]);

  const displayManagement = React.useMemo(() => {
    return managementItems.filter(item => hasPermission(`module:${item.id}`));
  }, [role]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 pb-2 space-y-6">
        <div className="flex flex-col items-center gap-1 group-data-[collapsible=icon]:hidden">
          {globalSettings?.logo ? (
            <div className="h-14 w-auto mb-1 flex items-center justify-center">
              <img src={globalSettings.logo} alt="Organization Logo" className="h-full w-auto object-contain" />
            </div>
          ) : (
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M5 25L15 5L25 25M15 25L25 5L35 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
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
                <SidebarMenuItem key={item.id}>
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

        {displayManagement.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase text-slate-400 mb-4 group-data-[collapsible=icon]:hidden">
              Management
            </SidebarGroupLabel>
            <SidebarMenu>
              {displayManagement.map((item) => {
                const isActive = pathname.startsWith(item.url);
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
                      <Link href={item.url} className="flex items-center">
                        <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                        <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarSeparator className="mb-4 bg-slate-100 dark:bg-white/10" />
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="rounded-xl h-11 px-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <Link href="/settings" className="flex items-center">
                <Settings className="h-[18px] w-[18px]" />
                <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                asChild
                className="rounded-xl h-11 px-3 text-primary hover:bg-primary/5"
              >
                <Link href="/logout" className="flex items-center">
                  <LogOut className="h-[18px] w-[18px]" />
                  <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                    Log out
                  </span>
                </Link>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                className="rounded-xl h-11 px-3 text-primary hover:bg-primary/5"
              >
                <Link href="/login" className="flex items-center">
                  <LogIn className="h-[18px] w-[18px]" />
                  <span className="ml-3 font-semibold text-[13px] group-data-[collapsible=icon]:hidden">
                    Log in
                  </span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}