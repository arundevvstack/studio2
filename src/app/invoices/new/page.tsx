"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  Receipt, 
  Search,
  Loader2,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function CreateInvoicePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Fetch real clients
  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  // Fetch real projects
  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);
  const { data: allProjects, isLoading: isLoadingProjects } = useCollection(projectsQuery);

  // Filter projects based on selected client
  const availableProjects = useMemo(() => {
    if (!allProjects || !selectedClientId) return [];
    return allProjects.filter(p => p.clientId === selectedClientId);
  }, [allProjects, selectedClientId]);

  const toggleProject = (id: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalRevenue = useMemo(() => {
    return availableProjects
      .filter(p => selectedProjectIds.includes(p.id))
      .reduce((sum, p) => sum + (p.budget || 0), 0);
  }, [availableProjects, selectedProjectIds]);

  const handleDeploy = () => {
    const targetId = selectedProjectIds[0] || "MRZL_202602_25";
    router.push(`/invoices/${targetId}/view?dueDate=${dueDate}`);
  };

  const isLoading = isLoadingClients || isLoadingProjects;

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-xl bg-white border-slate-200 shadow-sm shrink-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">
            Revenue Generation
          </h1>
          <p className="text-slate-500 mt-2 font-medium tracking-normal">
            Synthesize production assets into a strategic billing document.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden p-10">
            <CardHeader className="p-0 mb-10">
              <CardTitle className="text-2xl font-bold font-headline text-slate-900 tracking-normal">
                Client & Project Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">
                  Select Strategic Client
                </label>
                <Select value={selectedClientId} onValueChange={(val) => {
                  setSelectedClientId(val);
                  setSelectedProjectIds([]); // Reset selection on client change
                }}>
                  <SelectTrigger className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 px-8 text-slate-900 font-bold focus:ring-primary/20 tracking-normal">
                    <SelectValue placeholder={isLoading ? "Syncing partners..." : "Identify client for billing..."} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="tracking-normal font-medium">
                        {client.name}
                      </SelectItem>
                    ))}
                    {(!clients || clients.length === 0) && !isLoading && (
                      <SelectItem value="none" disabled className="tracking-normal">No strategic clients found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                    Project Entities
                  </h3>
                  {selectedClientId && availableProjects.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-normal">Aggregate Recurring</span>
                      <Checkbox className="h-5 w-5 rounded-md border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  ) : availableProjects.length > 0 ? (
                    availableProjects.map((project) => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => toggleProject(project.id)}
                      >
                        <div className="flex items-center gap-6">
                          <Checkbox 
                            checked={selectedProjectIds.includes(project.id)}
                            className="h-6 w-6 rounded-lg border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                            onCheckedChange={() => toggleProject(project.id)}
                          />
                          <div>
                            <h4 className="text-xl font-bold font-headline text-slate-900 tracking-normal">{project.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal">
                                {project.status || "Planned"}
                              </Badge>
                              <span className="text-[10px] font-bold text-slate-300 tracking-normal">#{project.id.substring(0, 6).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold font-headline text-slate-900 tracking-normal">
                            ₹{(project.budget || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-normal">
                            PROJECT VALUE
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-50 rounded-3xl">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center p-5">
                        <Search className="h-full w-full text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-300 uppercase text-center tracking-normal">
                        {selectedClientId ? "No project entities found for this client" : "Select a client to visualize production items"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 blur-3xl -z-10" />
            
            <CardContent className="p-10 pt-12 space-y-12">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">
                  Invoice Synthesis
                </h3>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                  Total Revenue
                </p>
                <h2 className="text-5xl font-bold font-headline text-slate-900 tracking-normal">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                  Payment Due Date
                </p>
                <div className="relative group">
                  <Input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-16 w-full rounded-2xl bg-slate-50 border-none px-8 text-slate-900 font-bold text-sm shadow-inner focus-visible:ring-primary/20 tracking-normal appearance-none"
                  />
                  <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none transition-colors group-focus-within:text-primary" />
                </div>
              </div>

              <Button 
                onClick={handleDeploy}
                disabled={selectedProjectIds.length === 0}
                className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 tracking-normal"
              >
                Deploy Invoice
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-50/50 p-8 flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase mb-1 tracking-normal">
                Auto-Aggregation
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed tracking-normal">
                Recurring projects for the same client are grouped for strategic clarity.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
