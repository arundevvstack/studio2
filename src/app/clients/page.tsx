"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Briefcase,
  TrendingUp,
  Mail,
  ArrowRight,
  Filter,
  Loader2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

const MOCK_GRADIENTS = [
  "bg-gradient-pink",
  "bg-gradient-purple",
  "bg-gradient-blue"
];

export default function ClientsPage() {
  const db = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const projectsQuery = useMemoFirebase(() => {
    return query(collection(db, "projects"));
  }, [db]);

  const { data: projects, isLoading: isLoadingProjects } = useCollection(projectsQuery);

  const stats = useMemo(() => {
    const totalClients = clients?.length || 0;
    const projectValue = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
    const totalPitch = projects?.filter(p => (p.status || "").toLowerCase() === "planned").length || 0;

    return { totalClients, projectValue, totalPitch };
  }, [clients, projects]);

  const isLoading = isLoadingClients || isLoadingProjects;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900">
            Client Portfolio
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Managing global partnerships and strategic accounts.
          </p>
        </div>
        <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Clients</p>
              <h3 className="text-2xl font-bold font-headline">{stats.totalClients}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Project Value</p>
              <h3 className="text-2xl font-bold font-headline">₹{stats.projectValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Pitch</p>
              <h3 className="text-2xl font-bold font-headline">{stats.totalPitch}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400" 
            placeholder="Filter clients by name, industry, or key contact..." 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-sm uppercase">Loading Portfolio...</p>
          </div>
        ) : clients && clients.length > 0 ? (
          clients.map((client, index) => (
            <Card key={client.id} className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`h-24 ${MOCK_GRADIENTS[index % MOCK_GRADIENTS.length]} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="absolute -bottom-10 left-8">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg rounded-3xl">
                    <AvatarImage src={`https://picsum.photos/seed/${client.id}/200/200`} />
                    <AvatarFallback>{client.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <CardContent className="p-8 pt-14 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold font-headline text-slate-900">{client.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">{client.industry || "General Industry"}</p>
                  </div>
                  <Badge className="bg-slate-50 text-slate-500 border-none font-bold text-[10px] uppercase px-3 py-1">
                    {client.status || "Active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contact</p>
                    <p className="text-base font-bold mt-1 text-primary truncate">{client.contactPerson || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                    <p className="text-sm font-bold mt-1 text-slate-900 truncate">{client.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500 overflow-hidden">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium truncate">{client.email}</span>
                  </div>
                </div>

                <Button asChild variant="ghost" className="w-full h-12 rounded-2xl bg-slate-50 text-slate-900 font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all gap-2">
                  <Link href={`/clients/${client.id}`}>
                    More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Link href="/clients/new" className="col-span-full border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 min-h-[400px] hover:border-primary/20 hover:bg-slate-50/50 transition-all group">
            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-slate-300 group-hover:text-primary" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase">Scale Portfolio</p>
            <p className="text-xs text-slate-300 mt-2 font-medium">Add your first high-value client</p>
          </Link>
        )}
      </div>
    </div>
  );
}
