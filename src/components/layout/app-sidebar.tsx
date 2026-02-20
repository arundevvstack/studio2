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
  Mail,
  Calendar,
  MessageSquare,
  Plus,
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "My Tasks", icon: FileText, url: "/tasks" },
  { title: "Inbox", icon: Mail, url: "/inbox", badge: 0 },
  { title: "Projects", icon: Briefcase, url: "/projects" },
  { title: "Standups", icon: MessageSquare, url: "/standups" },
  { title: "Meetings", icon: Calendar, url: "/meetings", badge: 5 },
  { title: "Settings", icon: Settings, url: "/settings" },
];

const favorites = [
  { title: "Redwhale Design", color: "bg-blue-500" },
  { title: "Mobile App Mock...", color: "bg-red-500" },
  { title: "UI Design Revisi...", color: "bg-teal-500" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-white shadow-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-12 w-12 border-2 border-primary/20 p-0.5">
            <AvatarImage src="https://picsum.photos/seed/shakir/200/200" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-base">AR Shakir</span>
            <span className="text-xs text-muted-foreground">Sr. Visual Designer</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}
                  className="rounded-xl h-12 px-4 transition-all hover:bg-primary/5 active:scale-95"
                >
                  <Link href={item.url} className="flex items-center gap-4">
                    <item.icon className={`h-5 w-5 ${pathname.startsWith(item.url) ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden mb-2">
            Favorites
          </SidebarGroupLabel>
          <SidebarMenu>
            {favorites.map((fav) => (
              <SidebarMenuItem key={fav.title}>
                <SidebarMenuButton className="h-10 px-4 group-data-[collapsible=icon]:justify-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${fav.color} shrink-0`} />
                  <span className="ml-4 text-sm font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">{fav.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <Button size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 active:scale-95">
          <Plus className="h-6 w-6" />
        </Button>
        <div className="mt-4 text-[10px] text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">
          2024 MediaFlow License
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}