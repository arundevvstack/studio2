
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
  Sparkles,
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
  Sparkles,
  User
};

const ALL_MODULES = [
  { id: "dashboard", title: "Dashboard", iconName: "LayoutGrid", url: "/", group: "sales_marketing" },
  { id: "pipeline", title: "Pipeline", iconName: "GitBranch", url: "/pipeline", group: "sales_marketing" },
  { id: "proposals", title: "Proposals", iconName: "FileText", url: "/proposals", group: "sales_marketing" },
  { id: "intelligence", title: "Intelligence", iconName: "BarChart3", url: "/sales-forecast", group: "sales_marketing" },
  { id: "market", title: "Market Research", iconName: "Globe", url: "/market-research", group: "sales_marketing" },
  { id: "clients", title: "Clients", iconName: "Briefcase", url: "/clients", group: "production" },
  { id: "billing", title: "Billing", iconName: "FileText", url: "/invoices", group: "production" },
  { id: "projects", title: "Projects", iconName: "Folder", url: "/projects", group: "production" },
  { id: "board", title: "Board", iconName: "Trello", url: "/board", group: "production" },
  { id: "schedule", title: "Schedule", iconName: "Calendar", url: "/schedule", group: "production" },
  { id: "time", title: "Time Tracking", iconName: "Clock", url: "/time", group: "production" },
  { id: "talent-library", title: "Talent Library", iconName: "Users", url: "/talent-library", group: "network" },
  { id: "team", title: "Team", iconName: "Users", url: "/team", group: "organisation" },
  { id: "admin", title: "Admin Console", iconName: "ShieldCheck", url: "/admin", group: "organisation" },
  { id: "settings", title: "Settings", iconName: "Settings", url: "/settings", group: "organisation" },
];

const GROUPS = [
  { id: "sales_marketing", label: "Sales & Marketing" },
  { id: "production", label: "Production" },
  { id: "network", label: "Network" },
  { id: "organisation", label: "Organisation" },
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

  // Master Sorting & Grouping Logic
  const groupedMenuItems = useMemo(() => {
    const hasCustomOrder = navSettings?.order && Array.isArray(navSettings.order);
    const orderMap = hasCustomOrder 
      ? new Map(navSettings.order.map((id: string, index: number) => [id, index]))
      : null;

    // Filter allowed modules
    const allowedModules = ALL_MODULES.filter(item => {
      if (isSuperAdmin) return true;
      if (!role) return true; 
      return role.permissions?.includes(`module:${item.id}`);
    });

    // Create groups
    return GROUPS.map(group => ({
      ...group,
      items: allowedModules
        .filter(item => item.group === group.id)
        .sort((a, b) => {
          if (orderMap) {
            const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
            const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
            return orderA - orderB;
          }
          return 0; // Default sequence
        })
    })).filter(g => g.items.length > 0);
  }, [navSettings, role, isSuperAdmin, member]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 pb-1 space-y-4">
        <div className="flex flex-col items-center gap-1 group-data-[collapsible=icon]:hidden">
          {globalSettings?.logo ? (
            <div className="h-12 w-auto mb-1 flex items-center justify-center">
              <img src={globalSettings.logo} alt="Organization Logo" className="h-full w-auto object-contain" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
          )}
        </div>

        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-5 font-bold text-xs shadow-lg shadow-primary/20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
          <Link href="/pipeline">
            <Plus className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">New Lead</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2 space-y-1">
        {groupedMenuItems.map((group) => (
          <SidebarGroup key={group.id} className="py-1">
            <SidebarGroupLabel className="px-2 text-[9px] font-bold uppercase text-slate-400 mb-1 h-6 group-data-[collapsible=icon]:hidden tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                  const Icon = ICON_MAP[item.iconName] || Globe;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`rounded-lg h-8 px-2 transition-all ${
                          isActive 
                            ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-100" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                          <span className="ml-3 font-semibold text-[12px] group-data-[collapsible=icon]:hidden">
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
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 mt-auto">
        <SidebarSeparator className="mb-3 bg-slate-100" />
        <SidebarMenu className="space-y-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`rounded-lg h-8 px-2 transition-all ${
                pathname === "/settings" 
                  ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Link href="/settings" className="flex items-center">
                <User className="h-4 w-4" />
                <span className="ml-3 font-semibold text-[12px] group-data-[collapsible=icon]:hidden">
                  Profile
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="rounded-lg h-8 px-2 text-slate-500 hover:bg-slate-50"
            >
              <Link href="/logout" className="flex items-center">
                <LogOut className="h-4 w-4" />
                <span className="ml-3 font-semibold text-[12px] group-data-[collapsible=icon]:hidden">
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
