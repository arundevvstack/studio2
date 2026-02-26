"use client";

import React, { useEffect } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { LayoutShell } from "@/components/layout/layout-shell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Apply saved theme mode and primary color on initial mount
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("theme-color");
      const savedMode = localStorage.getItem("theme-mode") || "light";
      
      const html = document.documentElement;

      // Apply primary color
      if (savedColor) {
        html.style.setProperty('--primary', savedColor);
        html.style.setProperty('--ring', savedColor);
      }

      // Apply theme mode
      if (savedMode === 'dark' || (savedMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <title>DP MediaFlow - Production Project Management</title>
        <meta name="description" content="Manage clients, projects, team, billing, and sales for media production." />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <FirebaseClientProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}