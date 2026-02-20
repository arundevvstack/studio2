"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles,
  SearchIcon
} from "lucide-react";
import Link from "next/link";

export default function PipelinePage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">
              Strategic Pipeline
            </h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 mr-1" />
              Early Stage
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Managing high-potential opportunities in Pitch & Discussion phases.
          </p>
        </div>
        <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Pitch
          </Link>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400" 
            placeholder="Search pending pitches and discussions..." 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      {/* Pipeline Table */}
      <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-10 py-6 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-4">Potential Production</div>
          <div className="col-span-3">Pipeline Phase</div>
          <div className="col-span-2 text-center">Confidence</div>
          <div className="col-span-2 text-center">Est. Kickoff</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        
        {/* Empty State Body */}
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="bg-slate-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium italic text-sm">
              No projects in the early-stage pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
