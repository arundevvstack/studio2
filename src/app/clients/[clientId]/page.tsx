"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Receipt,
  ArrowRight,
  Loader2,
  Calendar,
  Settings,
  Trash2,
  Save,
  FileText,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, doc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export default function ClientEngagementPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const clientRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "clients", clientId);
  }, [db, clientId, user]);
  const { data: client, isLoading: isClientLoading } = useDoc(clientRef);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "projects"), 
      where("clientId", "==", clientId)
    );
  }, [db, clientId, user]);
  const { data: projects, isLoading: isProjectsLoading } = useCollection(projectsQuery);

  const invoicesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "clients", clientId, "invoices")
    );
  }, [db, clientId, user]);
  const { data: invoices, isLoading: isInvoicesLoading } = useCollection(invoicesQuery);

  // Edit State
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    if (client) {
      setEditData({
        name: client.name || "",
        industry: client.industry || "",
        contactPerson: client.contactPerson || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
      });
    }
  }, [client]);

  const handleUpdateClient = () => {
    if (!editData.name || !editData.email || !clientRef) return;
    
    updateDocumentNonBlocking(clientRef, {
      ...editData,
      companyName: editData.name,
      updatedAt: serverTimestamp()
    });
    
    toast({
      title: "Strategy Synchronized",
      description: `Partnership details for ${editData.name} have been updated.`
    });
  };

  const handleDeleteClient = () => {
    if (!clientRef) return;
    deleteDocumentNonBlocking(clientRef);
    toast({
      variant: "destructive",
      title: "Entity Purged",
      description: "Client has been removed from the portfolio."
    });
    router.push("/clients");
  };

  // Wait for all essential data streams before clearing the loader
  const isLoading = isUserLoading || isClientLoading || isProjectsLoading || isInvoicesLoading;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center tracking-normal">Identifying Partnership Strategy...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline tracking-normal">Entity Not Found</h2>
        <Button onClick={() => router.push("/clients")} className="font-bold tracking-normal">Return to Portfolio</Button>
      </div>
    );
  }

  const releasedCount = projects?.filter(p => p.status === "Released").length || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
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
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">
                {client.name}
              </h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                {client.status || "Strategic Partner"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 tracking-normal">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {client.industry || "General Industry"}
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Since {client.createdAt ? new Date(client.createdAt.seconds * 1000).getFullYear() : "2024"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors tracking-normal">
                <Settings className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Partnership Entity</DialogTitle>
              </DialogHeader>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Partnership Entity</label>
                    <Input 
                      value={editData?.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Industry Vertical</label>
                    <Input 
                      value={editData?.industry} 
                      onChange={(e) => setEditData({...editData, industry: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Lead Representative</label>
                    <Input 
                      value={editData?.contactPerson} 
                      onChange={(e) => setEditData({...editData, contactPerson: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Communication</label>
                    <Input 
                      value={editData?.email} 
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Contact Hotline</label>
                    <Input 
                      value={editData?.phone} 
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Headquarters</label>
                    <Input 
                      value={editData?.address} 
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Partnership Strategic Brief</label>
                  <Textarea 
                    value={editData?.notes} 
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Outline the client's core objectives and long-term partnership goals..."
                    className="rounded-xl bg-slate-50 border-none min-h-[150px] resize-none p-4 tracking-normal"
                  />
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between">
                <DialogClose asChild>
                  <Button variant="ghost" onClick={handleDeleteClient} className="text-destructive font-bold text-xs uppercase tracking-normal hover:bg-destructive/5 hover:text-destructive gap-2">
                    <Trash2 className="h-4 w-4" />
                    Purge Entity
                  </Button>
                </DialogClose>
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleUpdateClient} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6 h-11 gap-2 tracking-normal">
                      <Save className="h-4 w-4" />
                      Sync Changes
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
            <Link href="/projects/new">
              Initiate Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Project Entities</p>
              <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{projects?.length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Billing</p>
              <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{invoices?.length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Released Projects</p>
              <h3 className="text-3xl font-bold font-headline mt-1 tracking-normal">{releasedCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">Project Entities</h3>
          </div>
          
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
                <div className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                      <Briefcase className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold font-headline text-slate-900 tracking-normal">{project.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal">
                          {project.status || "Planned"}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 tracking-normal">
                          <Calendar className="h-3 w-3" />
                          DUE: {project.dueDate || "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Quote Value</p>
                      <p className="text-xl font-bold font-headline text-slate-900 tracking-normal">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all tracking-normal">
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
              <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No Active Projects</p>
              <Button asChild variant="link" className="text-primary font-bold text-xs tracking-normal">
                <Link href="/projects/new">Initiate new production entity</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md rounded-2xl shrink-0">
                  <AvatarImage src={`https://picsum.photos/seed/${client.contactPerson}/200/200`} />
                  <AvatarFallback>{client.contactPerson?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xl font-bold font-headline text-slate-900 leading-tight tracking-normal">{client.contactPerson || "Not Assigned"}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-normal">Lead Representative</p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold truncate group-hover:text-primary transition-colors tracking-normal">{client.email}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold group-hover:text-primary transition-colors tracking-normal">{client.phone || "No Hotline"}</span>
                </div>
                <div className="flex items-start gap-4 text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold leading-relaxed tracking-normal">{client.address || "Headquarters address not recorded"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {client.notes && (
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
               <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold font-headline tracking-normal">Partnership Brief</h3>
                </div>
                <div className="p-8 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap tracking-normal">
                    {client.notes}
                  </p>
                </div>
               </div>
            </Card>
          )}

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-10 space-y-8">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Partnership Guidance</h4>
            <p className="text-sm font-medium leading-relaxed italic text-slate-400 tracking-normal">
              "Strategic focus should be maintained on {client.industry || 'key vertical'} deliverables to maximize engagement value."
            </p>
            <div className="pt-6 border-t border-white/10">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-normal">
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