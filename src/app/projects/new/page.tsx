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
  Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AddProjectPage() {
  const router = useRouter();
  const db = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db]);

  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, clientId: value }));
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
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">
            Initiate Project
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Deploy a new high-growth media campaign for your partners.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        {/* Top Accent Border (Red for Projects) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ef4444]" />
        
        <div className="p-10 space-y-12">
          {/* Top Row: Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Project Name
              </label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Nike Summer '24" 
                className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
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
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Clients Found</p>
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

          {/* Second Row: Visuals and Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Project Visuals
              </label>
              <div className="h-48 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/30 transition-colors">
                <div className="mb-3 p-4 rounded-full bg-white shadow-sm">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ingest Campaign Asset
                </span>
              </div>
            </div>
            <div className="space-y-3">
               <div className="mt-7 p-8 rounded-2xl bg-slate-50/50 border border-slate-100 h-48 flex flex-col justify-center">
                <h4 className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest mb-2">
                  Strategic Guidance
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  High-resolution stills or mood-board assets are recommended to define the creative direction.
                </p>
              </div>
            </div>
          </div>

          {/* Third Row: Executive Brief */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
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
            variant="ghost" 
            className="text-slate-900 font-bold text-sm hover:bg-transparent"
            onClick={() => router.back()}
          >
            Discard
          </Button>
          <Button 
            className="h-14 px-10 rounded-xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-bold text-base shadow-lg shadow-red-200 gap-3 group"
            disabled={!formData.clientId}
          >
            Initiate Production
            <SendHorizontal className="h-5 w-5 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
