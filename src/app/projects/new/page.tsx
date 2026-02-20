"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Image as ImageIcon, SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddProjectPage() {
  const router = useRouter();

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
            Initiate Production
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Deploy a new high-growth media campaign.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        {/* Top Accent Border (Red as per image) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ef4444]" />
        
        <div className="p-10 space-y-12">
          {/* Top Row: Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Project Identifier
              </label>
              <Input 
                placeholder="e.g. Nike Summer '24" 
                className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Strategic Client
              </label>
              <Input 
                placeholder="e.g. Nike EMEA" 
                className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Second Row: Visuals and Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Project Visuals
              </label>
              <div className="h-48 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/30 transition-colors">
                <div className="mb-3">
                  <ImageIcon className="h-10 w-10 text-slate-300" />
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
                  High-resolution stills or mood-board assets are recommended.
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
              placeholder="Outline the core creative direction..."
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
          <Button className="h-14 px-10 rounded-xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-bold text-base shadow-lg shadow-red-200 gap-3 group">
            Launch Production
            <SendHorizontal className="h-5 w-5 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
