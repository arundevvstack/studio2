"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const BOARD_DATA = [
  {
    id: "col-1",
    title: "PITCH",
    count: 0,
    cards: []
  },
  {
    id: "col-2",
    title: "DISCUSSION",
    count: 0,
    cards: []
  },
  {
    id: "col-3",
    title: "PRE PRODUCTION",
    count: 1,
    cards: [
      {
        id: "p-1",
        title: "Podcast",
        criticality: "MEDIUM",
        client: "GG",
        progress: 35,
        deadline: "N/A",
        team: ["u1", "u2"]
      }
    ]
  },
  {
    id: "col-4",
    title: "PRODUCTION",
    count: 2,
    cards: [
      {
        id: "p-2",
        title: "TVC",
        criticality: "MEDIUM",
        client: "GG",
        progress: 65,
        deadline: "N/A",
        team: ["u3", "u4"]
      },
      {
        id: "p-3",
        title: "TVC",
        criticality: "MEDIUM",
        client: "Amaze Homes",
        progress: 65,
        deadline: "N/A",
        team: ["u1", "u5"]
      }
    ]
  },
  {
    id: "col-5",
    title: "POST PRODUCTION",
    count: 1,
    cards: [
      {
        id: "p-4",
        title: "Ai Video production",
        criticality: "HIGH",
        client: "Kumbaya Kombucha",
        progress: 85,
        deadline: "N/A",
        team: ["u2", "u3"]
      }
    ]
  },
  {
    id: "col-6",
    title: "RELEASE",
    count: 0,
    cards: []
  }
];

export default function BoardPage() {
  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">
            Board
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Visualize and manage your production pipeline.
          </p>
        </div>
        <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white text-slate-400 border-none shadow-sm opacity-50 cursor-not-allowed">
          + Quick Add
        </Button>
      </div>

      {/* Kanban Board Area */}
      <ScrollArea className="flex-1 w-full pb-6">
        <div className="flex gap-6 min-h-[700px]">
          {BOARD_DATA.map((column) => (
            <div key={column.id} className="w-[320px] shrink-0 flex flex-col space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    {column.title}
                  </h3>
                  <Badge className="bg-slate-100 text-slate-500 border-none h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px] font-bold">
                    {column.count}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Column Content */}
              <div className="flex-1 flex flex-col gap-4">
                {column.cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50 group hover:shadow-md transition-all cursor-pointer">
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold font-headline text-slate-900 leading-tight">
                        {card.title}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`border-none text-[8px] font-bold px-3 py-0.5 rounded-lg ${
                          card.criticality === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                        }`}>
                          {card.criticality}
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-500 border-none text-[8px] font-bold px-3 py-0.5 rounded-lg">
                          {card.client}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {card.progress}% COMPLETE
                        </p>
                        <Progress value={card.progress} className="h-1.5 bg-slate-50" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-red-400">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">{card.deadline}</span>
                        </div>
                        <div className="flex -space-x-2">
                          {card.team.map((u, i) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-white grayscale hover:grayscale-0 transition-all">
                              <AvatarImage src={`https://picsum.photos/seed/${u}/100/100`} />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Drop Area / Empty State Placeholder */}
                <div className="flex-1 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 group hover:border-primary/20 transition-colors">
                  <div className="h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-sm mb-4">
                    <Plus className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors">
                    Drop Here
                  </span>
                </div>

                {/* Column Footer Action */}
                <Button variant="ghost" className="h-14 w-full rounded-[2rem] border-none bg-slate-50/50 hover:bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest gap-2">
                  <Plus className="h-4 w-4" />
                  New Entry
                </Button>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
