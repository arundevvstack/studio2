
'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { Zap } from "lucide-react";

/**
 * @fileOverview Strategic Layout Shell.
 * Manages the workspace structure and conditionally renders the sidebar based on active routes.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Routes where the authenticated sidebar should be hidden
  const marketingRoutes = [
    "/", 
    "/how-it-works", 
    "/modules", 
    "/industries", 
    "/pricing", 
    "/resources", 
    "/about", 
    "/book-demo",
    "/verticals", 
    "/portfolio", 
    "/contact", 
    "/docs"
  ];

  const authRoutes = ["/login", "/logout"];

  const isMarketingRoute = marketingRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  if (isMarketingRoute) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-white">
        <PublicNav />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (isAuthRoute) {
    return (
      <main className="min-h-screen w-full bg-white">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10 text-slate-600" />
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-headline font-bold text-sm tracking-tight">DP MediaFlow</span>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="mx-auto max-w-[1600px] w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
