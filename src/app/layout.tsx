import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { LayoutShell } from "@/components/layout/layout-shell";

export const metadata: Metadata = {
  title: 'MediaFlow - Production Project Management',
  description: 'Manage clients, projects, team, billing, and sales for media production.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
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
