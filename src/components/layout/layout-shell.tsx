'use client';

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { Zap, Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: userData, isLoading: isRegistryLoading } = useDoc(userRef);

  // Auth & Status Redirection Logic
  useEffect(() => {
    if (!isUserLoading && !isRegistryLoading) {
      const publicRoutes = ["/", "/login", "/waiting-approval", "/account-suspended", "/about", "/contact", "/pricing", "/how-it-works", "/modules", "/industries", "/resources", "/docs", "/portfolio", "/verticals", "/book-demo"];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (user && userData) {
        if (userData.status === 'suspended' && pathname !== '/account-suspended') {
          router.push('/account-suspended');
        } else if (userData.status === 'pending' && pathname !== '/waiting-approval') {
          router.push('/waiting-approval');
        } else if (userData.status === 'approved' && (pathname === '/waiting-approval' || pathname === '/account-suspended')) {
          router.push('/dashboard');
        }
      } else if (!user && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [user, userData, isUserLoading, isRegistryLoading, pathname, router]);

  const marketingRoutes = [
    "/", "/how-it-works", "/modules", "/industries", "/pricing", "/resources", "/about", "/book-demo",
    "/verticals", "/portfolio", "/contact", "/docs"
  ];
  const authRoutes = ["/login", "/logout", "/waiting-approval", "/account-suspended"];

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
    return <main className="min-h-screen w-full bg-white">{children}</main>;
  }

  if (isUserLoading || isRegistryLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Identity State...</p>
      </div>
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