"use client";

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

const workspaceItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/" },
  { title: "Pipeline", icon: GitBranch, url: "/pipeline" },
  { title: "Projects", icon: Folder, url: "/projects" },
  { title: "Board", icon: Trello, url: "/board" },
  { title: "Schedule", icon: Calendar, url: "/schedule" },
  { title: "Team", icon: Users, url: "/team" },
  { title: "Billing", icon: FileText, url: "/invoices" },
  { title: "Intelligence", icon: BarChart3, url: "/sales-forecast" },
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-slate-50/50">
      <SidebarHeader className="p-6 pb-2 space-y-6">
        {/* Brand Logo */}
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
            <h1 className="text-sm font-bold tracking-tighter text-slate-900 uppercase">Marzelz</h1>
            <p className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase -mt-1">Lifestyle</p>
          </div>
        </div>

        {/* Add Projects Action */}
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold text-sm shadow-lg shadow-primary/20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
          <Link href="/projects/new">
            <Plus className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Add Projects</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        {/* Workspace Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 mb-4 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {workspaceItems.map((item) => {
              const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`rounded-xl h-11 px-3 transition-all ${
                      isActive 
                        ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" 
                        : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
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

        {/* Management Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 mb-4 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarMenu>
            {managementItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="rounded-xl h-11 px-3 text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
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
        <SidebarSeparator className="mb-4" />
        <SidebarMenu className="space-y-1">
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`rounded-xl h-11 px-3 hover:bg-slate-100/50 ${item.color}`}
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
