"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  Image as ImageIcon, 
  SendHorizontal,
  Loader2,
  Briefcase,
  IndianRupee
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, serverTimestamp } from "firebase/firestore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export default function AddProjectPage() {
  const router = useRouter();
  const db = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db]);

  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    description: "",
    budget: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, clientId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please provide a project name and select a client."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const projectsRef = collection(db, "projects");
      const newProjectRef = doc(projectsRef);
      const projectId = newProjectRef.id;

      const projectData = {
        id: projectId,
        name: formData.name,
        clientId: formData.clientId,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
        status: "Planned",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      setDocumentNonBlocking(newProjectRef, projectData, { merge: true });
      
      toast({
        title: "Success",
        description: `${formData.name} has been initiated.`
      });

      router.push("/projects");
    } catch (error) {
      console.error("Error initiating project:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
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
          <h1 className="text-4xl font-bold font-headline text-slate-900">
            Initiate Project
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Deploy a new high-growth media campaign for your partners.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        {/* Top Accent Border (Red for Projects) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ef4444]" />
        
        <div className="p-10 space-y-12">
          {/* Row 1: Basic Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase px-1">
                Project Name
              </label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Nike Summer '24" 
                className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase px-1">
                Strategic Client
              </label>
              <Select onValueChange={handleClientChange} value={formData.clientId}>
                <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus:ring-primary/20">
                  <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Identify client..."} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {isLoadingClients ? (
                    <div className="p-4 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="font-medium text-slate-700">
                        {client.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase">No Clients Found</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => router.push('/clients/new')}
                        className="text-primary p-0 h-auto mt-1"
                      >
                        Onboard Client First
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Financials & Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase px-1">
                Quote Price (INR)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="e.g. 50,000" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Currency Focus</p>
                <p className="text-xs text-slate-500 font-medium">All billing for this entity will be processed in Indian Rupees (₹).</p>
              </div>
            </div>
          </div>

          {/* Row 3: Visuals and Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase px-1">
                Project Visuals
              </label>
              <div className="h-48 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/30 transition-colors">
                <div className="mb-3 p-4 rounded-full bg-white shadow-sm">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Ingest Campaign Asset
                </span>
              </div>
            </div>
            <div className="space-y-3">
               <div className="mt-7 p-8 rounded-2xl bg-slate-50/50 border border-slate-100 h-48 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-[#ef4444] uppercase mb-2">
                  Strategic Guidance
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  High-resolution stills or mood-board assets are recommended to define the creative direction.
                </p>
              </div>
            </div>
          </div>

          {/* Row 4: Executive Brief */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase px-1">
              Executive Brief
            </label>
            <Textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Outline the core creative direction, target demographics, and key deliverables..."
              className="min-h-[250px] rounded-2xl bg-slate-50 border-none shadow-inner text-base p-8 focus-visible:ring-primary/20 resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Form Footer */}
        <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-end gap-10">
          <Button 
            type="button"
            variant="ghost" 
            className="text-slate-900 font-bold text-sm hover:bg-transparent"
            onClick={() => router.back()}
          >
            Discard
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !formData.clientId}
            className="h-14 px-10 rounded-xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-bold text-base shadow-lg shadow-red-200 gap-3 group"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Initiate Production
                <SendHorizontal className="h-5 w-5 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
