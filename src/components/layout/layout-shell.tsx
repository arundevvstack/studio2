'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

/**
 * @fileOverview Strategic Layout Shell.
 * Manages the workspace structure and conditionally renders the sidebar based on active routes.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes where the sidebar should be hidden
  const noSidebarRoutes = ["/login", "/logout"];
  const isAuthRoute = noSidebarRoutes.includes(pathname);

  if (isAuthRoute) {
    return (
      <main className="min-h-screen w-full">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background p-6 md:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
