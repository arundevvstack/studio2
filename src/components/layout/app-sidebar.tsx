
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
  SidebarSeparator,
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
  { id: "dashboard", title: "Dashboard", iconName: "LayoutGrid", url: "/dashboard", group: "sales_marketing" },
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
    if (!user) return null;
    return doc(db, "companyBillingSettings", "global");
  }, [db, user]);
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

  const isSuperAdmin = role?.name === 'Super Admin' || role?.name === 'Root Administrator' || member?.roleId === 'root-admin';

  const groupedMenuItems = useMemo(() => {
    const allowedModules = ALL_MODULES.filter(item => {
      if (isSuperAdmin) return true;
      if (!role) return true; 
      return role.permissions?.includes(`module:${item.id}`);
    });

    return GROUPS.map(group => ({
      ...group,
      items: allowedModules.filter(item => item.group === group.id)
    })).filter(g => g.items.length > 0);
  }, [role, isSuperAdmin, member]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-3 pb-1">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-headline font-bold text-[13px] tracking-tight group-data-[collapsible=icon]:hidden">DP PM TOOL</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {groupedMenuItems.map((group) => (
          <SidebarGroup key={group.id} className="py-2">
            <SidebarGroupLabel className="px-2 text-[8px] font-bold uppercase text-slate-400 mb-1 group-data-[collapsible=icon]:hidden tracking-widest">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.url);
                  const Icon = ICON_MAP[item.iconName] || Globe;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`rounded-lg h-9 px-3 ${
                          isActive 
                            ? "bg-primary/5 text-primary" 
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center w-full">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                          <span className="ml-3 font-bold text-[11px] group-data-[collapsible=icon]:hidden">
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

      <SidebarFooter className="p-2 mt-auto">
        {member && (
          <SidebarMenu className="group-data-[collapsible=icon]:hidden px-2 py-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
              <Avatar className="h-8 w-8 rounded-lg shadow-sm border border-white">
                <AvatarImage src={member.thumbnail} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {member.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-900 truncate">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest truncate">
                  {role?.name || "Expert"}
                </p>
              </div>
            </div>
          </SidebarMenu>
        )}

        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-lg h-9 px-3 text-slate-500 hover:bg-slate-50">
              <Link href="/settings"><Settings className="h-4 w-4" /><span className="ml-3 font-bold text-[11px] group-data-[collapsible=icon]:hidden">Settings</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-lg h-9 px-3 text-slate-500 hover:bg-slate-50">
              <Link href="/logout"><LogOut className="h-4 w-4" /><span className="ml-3 font-bold text-[11px] group-data-[collapsible=icon]:hidden">Log Out</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
