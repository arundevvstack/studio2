"use client";

import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  User,
  Clock,
  Pencil
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CLIENT_GROUPS = [
  {
    id: "c1",
    name: "Amaze Homes",
    activeCount: 1,
    projects: [
      { id: "p1", name: "TVC", code: "VVVWXL", phase: "PRODUCTION", progress: 65, delivery: "TBD", phaseColor: "text-orange-500 bg-orange-50" }
    ]
  },
  {
    id: "c2",
    name: "GG",
    activeCount: 2,
    projects: [
      { id: "p2", name: "TVC", code: "WTXFED", phase: "PRODUCTION", progress: 85, delivery: "TBD", phaseColor: "text-orange-500 bg-orange-50" },
      { id: "p3", name: "Podcast", code: "QORSVN", phase: "PRE PRODUCTION", progress: 35, delivery: "TBD", phaseColor: "text-blue-500 bg-blue-50" }
    ]
  },
  {
    id: "c3",
    name: "Kumbaya Kombucha",
    activeCount: 1,
    projects: [
      { id: "p4", name: "Ai Video production", code: "AIDMKQ", phase: "POST PRODUCTION", progress: 85, delivery: "TBD", phaseColor: "text-pink-500 bg-pink-50" }
    ]
  }
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Managing global production assets grouped by client.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md"><List className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400"><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <Button asChild className="gap-2 px-6 shadow-lg shadow-primary/20 font-bold">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input className="pl-11 h-14 bg-white border-none shadow-sm rounded-xl text-base" placeholder="Search projects or clients..." />
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="h-10 rounded-lg border-slate-200 text-xs font-bold gap-2 text-slate-600 bg-white">
            <ArrowUpDown className="h-3.5 w-3.5" />
            CLIENT A-Z
          </Button>
          <Button variant="outline" className="h-10 rounded-lg border-slate-200 text-xs font-bold gap-2 text-slate-600 bg-white">
            <Filter className="h-3.5 w-3.5" />
            Refine
          </Button>
        </div>
      </div>

      {/* Grouped Content */}
      <div className="space-y-12">
        {CLIENT_GROUPS.map((group) => (
          <div key={group.id} className="space-y-4">
            {/* Client Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-primary/40" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline text-slate-900">{group.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {group.activeCount} ACTIVE PROJECTS
                </p>
              </div>
            </div>

            {/* Project List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 px-8 py-4 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="col-span-4">PRODUCTION ENTITY</div>
                <div className="col-span-3 text-center">CURRENT PHASE</div>
                <div className="col-span-2">OPTIMIZATION</div>
                <div className="col-span-2 text-center">DELIVERY</div>
                <div className="col-span-1 text-right">ACTIONS</div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {group.projects.map((project) => (
                  <div key={project.id} className="grid grid-cols-12 px-8 py-6 items-center group hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-4">
                      <h4 className="font-bold text-base text-slate-900">{project.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">ID: {project.code}</p>
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <Badge className={`rounded-lg px-4 py-1.5 text-[10px] font-bold border-none shadow-none ${project.phaseColor}`}>
                        {project.phase}
                      </Badge>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-primary">{project.progress}% SYNC</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5 bg-slate-100" />
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-bold text-slate-600">{project.delivery}</span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:border-primary/20 hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-[10px] font-bold uppercase">Edit Entity</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 group-hover:border-primary/20 group-hover:text-primary transition-all shadow-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
