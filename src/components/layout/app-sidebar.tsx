"use client";

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Users2,
  Clock,
  FileText,
  TrendingUp,
  Settings,
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

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Projects", icon: Briefcase, url: "/projects" },
  { title: "Clients", icon: Users, url: "/clients" },
  { title: "Team", icon: Users2, url: "/team" },
  { title: "Time Tracking", icon: Clock, url: "/time" },
  { title: "Invoices", icon: FileText, url: "/invoices" },
  { title: "Sales Forecast", icon: TrendingUp, url: "/sales-forecast" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="flex items-center justify-center py-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1.5 flex items-center justify-center">
            <TrendingUp className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
            MediaFlow
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-sidebar-accent transition-colors"
                  >
                    <Link href={item.url} className="flex items-center gap-3 py-6">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <SidebarMenuButton className="w-full justify-start gap-3">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </SidebarMenuButton>
      </div>
    </Sidebar>
  );
}