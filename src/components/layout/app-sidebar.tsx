
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
  Plus,
  ChevronRight,
  Briefcase,
  Globe,
  Clock,
  Key,
  Shield,
  Zap,
  Sparkles
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
  Zap,
  Sparkles
};

const ALL_MODULES = [
  { id: "dashboard", title: "Dashboard", iconName: "LayoutGrid", url: "/", group: "workspace" },
  { id: "proposals", title: "Proposals", iconName: "FileText", url: "/proposals", group: "workspace" },
  { id: "talent-library", title: "Talent Library", iconName: "Users", url: "/talent-library", group: "workspace" },
  { id: "pipeline", title: "Pipeline", iconName: "GitBranch", url: "/pipeline", group: "workspace" },
  { id: "projects", title: "Projects", iconName: "Folder", url: "/projects", group: "workspace" },
  { id: "board", title: "Board", iconName: "Trello", url: "/board", group: "workspace" },
  { id: "clients", title: "Clients", iconName: "Briefcase", url: "/clients", group: "workspace" },
  { id: "schedule", title: "Schedule", iconName: "Calendar", url: "/schedule", group: "workspace" },
  { id: "time", title: "Time Tracking", iconName: "Clock", url: "/time", group: "workspace" },
  { id: "team", title: "Team", iconName: "Users", url: "/team", group: "workspace" },
  { id: "billing", title: "Billing", iconName: "FileText", url: "/invoices", group: "workspace" },
  { id: "intelligence", title: "Intelligence", iconName: "BarChart3", url: "/sales-forecast", group: "workspace" },
  { id: "market", title: "Market Research", iconName: "Globe", url: "/market-research", group: "workspace" },
  { id: "admin", title: "Admin Console", iconName: "ShieldCheck", url: "/admin", group: "management" },
  { id: "settings", title: "Settings", iconName: "Settings", url: "/settings", group: "management" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const db = useFirestore();
  const { user } = useUser();

  const billingRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: globalSettings } = useDoc(billingRef);

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

  const navSettingsRef = useMemoFirebase(() => doc(db, "settings", "navigation"), [db]);
  const { data: navSettings } = useDoc(navSettingsRef);

  const isSuperAdmin = role?.name === 'Super Admin' || member?.roleId === 'super-admin';

  // Master Sorting & Filtering Logic
  const menuItems = useMemo(() => {
    const hasCustomOrder = navSettings?.order && Array.isArray(navSettings.order);
    const orderMap = hasCustomOrder 
      ? new Map(navSettings.order.map((id: string, index: number) => [id, index]))
      : null;

    const items = [...ALL_MODULES]
      .filter(item => {
        if (isSuperAdmin) return true;
        if (!role) return true; 
        return role.permissions?.includes(`module:${item.id}`);
      })
      .sort((a, b) => {
        if (orderMap) {
          const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
          const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
          return orderA - orderB;
        }
        // Default sort: Group first, then standard sequence
        if (a.group !== b.group) return a.group === 'workspace' ? -1 : 1;
        return 0;
      });

    return items;
  }, [navSettings, role, isSuperAdmin]);

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
            Workspace Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => {
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
