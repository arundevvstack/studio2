"use client";

import React from "react";
import { 
  ChevronLeft, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  Briefcase, 
  Receipt,
  MessageSquare,
  ArrowRight,
  Clock,
  Loader2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ClientEngagementPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();

  // Fetch Client Details
  const clientRef = useMemoFirebase(() => doc(db, "clients", clientId), [db, clientId]);
  const { data: client, isLoading: isClientLoading } = useDoc(clientRef);

  // Fetch Related Projects
  const projectsQuery = useMemoFirebase(() => {
    return query(
      collection(db, "projects"), 
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );
  }, [db, clientId]);
  const { data: projects, isLoading: isProjectsLoading } = useCollection(projectsQuery);

  // Fetch Related Invoices
  const invoicesQuery = useMemoFirebase(() => {
    return query(
      collection(db, "clients", clientId, "invoices"),
      orderBy("createdAt", "desc")
    );
  }, [db, clientId]);
  const { data: invoices, isLoading: isInvoicesLoading } = useCollection(invoicesQuery);

  if (isClientLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center">Identifying Client Strategy...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline">Client Not Found</h2>
        <Button onClick={() => router.push("/clients")}>Return to Portfolio</Button>
      </div>
    );
  }

  const totalProjectValue = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0"
            onClick={() => router.push("/clients")}
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none">
                {client.name}
              </h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase">
                {client.status || "Strategic Partner"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {client.industry || "General Industry"}
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Since {new Date(client.createdAt?.seconds * 1000).getFullYear() || "2024"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600">
            Edit Profile
          </Button>
          <Button asChild className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2">
            <Link href="/projects/new">
              Initiate Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Engagement Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Commitment</p>
              <h3 className="text-3xl font-bold font-headline mt-1">₹{totalProjectValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Active Projects</p>
              <h3 className="text-3xl font-bold font-headline mt-1">{projects?.filter(p => p.status !== 'Completed').length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Invoices</p>
              <h3 className="text-3xl font-bold font-headline mt-1">{invoices?.filter(i => i.status !== 'Paid').length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Communications</p>
              <h3 className="text-3xl font-bold font-headline mt-1">0</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Tabs Column */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="projects" className="space-y-8">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-50 w-fit">
              <TabsList className="bg-transparent gap-2 h-auto p-0">
                <TabsTrigger value="projects" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Active Projects
                </TabsTrigger>
                <TabsTrigger value="billing" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Billing History
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Activity Feed
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projects" className="m-0 space-y-4">
              {isProjectsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : projects && projects.length > 0 ? (
                projects.map((project) => (
                  <Card key={project.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
                    <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          <Briefcase className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold font-headline text-slate-900">{project.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] px-3 py-1 uppercase">
                              {project.status || "Planned"}
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {project.dueDate || "NO DEADLINE"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Quote Value</p>
                          <p className="text-xl font-bold font-headline text-slate-900">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all">
                          <Link href={`/projects/${project.id}`}>
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-sm font-bold text-slate-400 uppercase">No Active Projects</p>
                  <Button asChild variant="link" className="text-primary font-bold text-xs">
                    <Link href="/projects/new">Initiate new production campaign</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="billing" className="m-0 space-y-4">
              {isInvoicesLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <Card key={invoice.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                    <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <Receipt className="h-6 w-6 text-slate-300" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold font-headline text-slate-900">#{invoice.invoiceNumber || invoice.id.substring(0, 8)}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Issued {invoice.issueDate || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <Badge className={`px-4 py-1.5 rounded-lg border-none font-bold text-[10px] uppercase ${
                          invoice.status === 'Paid' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                        }`}>
                          {invoice.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold font-headline">₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold border-slate-200">
                          <Link href={`/invoices/${invoice.id}/view`}>View Document</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-sm font-bold text-slate-400 uppercase">No Billing History</p>
                  <Button asChild variant="link" className="text-primary font-bold text-xs">
                    <Link href="/invoices/new">Generate your first invoice</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="m-0">
               <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center p-5">
                      <Clock className="h-full w-full text-slate-200" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase">Activity Feed Empty</p>
                      <p className="text-xs text-slate-300 mt-1 font-medium italic">Communication logs and status changes will appear here.</p>
                    </div>
                  </div>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase">Strategic Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md rounded-2xl shrink-0">
                  <AvatarImage src={`https://picsum.photos/seed/${client.contactPerson}/200/200`} />
                  <AvatarFallback>{client.contactPerson?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xl font-bold font-headline text-slate-900 leading-tight">{client.contactPerson || "Not Assigned"}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Lead Representative</p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{client.email}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold group-hover:text-primary transition-colors">{client.phone || "No phone added"}</span>
                </div>
                <div className="flex items-start gap-4 text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold leading-relaxed">{client.address || "Physical address not recorded"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-10 space-y-8">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase">Partnership Guidance</h4>
            <p className="text-sm font-medium leading-relaxed italic text-slate-400">
              "Strategic focus should be maintained on {client.industry} vertical deliverables to maximize engagement value."
            </p>
            <div className="pt-6 border-t border-white/10">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 mb-2">
                 <span>Account Health</span>
                 <span className="text-accent">Optimized</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-accent" style={{ width: '85%' }} />
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}