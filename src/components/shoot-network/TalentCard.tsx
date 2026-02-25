"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  CheckCircle2,
  Star,
  Briefcase,
  Zap
} from "lucide-react";
import Link from "next/link";

/**
 * @fileOverview High-fidelity Talent Card (Consolidated).
 * Features ultra-rounded corners [3rem], large imagery [aspect-4/5], and verified identifiers.
 * Displays up to 3 category tags from the merged registry.
 */

export function TalentCard({ talent }: { talent: any }) {
  const displayThumbnail = talent.thumbnail || `https://picsum.photos/seed/${talent.id}/400/500`;

  return (
    <Link href={`/shoot-network/${talent.id}`} className="block group h-full">
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
        <div className="p-4 flex-grow">
          {/* High-Fidelity Visual Asset */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] shadow-sm">
            <img 
              src={displayThumbnail} 
              alt={talent.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
              <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold text-[8px] uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                {talent.category}
              </Badge>
              {talent.freeCollab === 'Yes' && (
                <Badge className="bg-primary text-white border-none font-bold text-[7px] uppercase px-3 py-1 rounded-full shadow-lg tracking-widest">
                  Ready to Collab
                </Badge>
              )}
            </div>
          </div>

          <div className="px-6 py-8 space-y-5">
            {/* Professional Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-tight leading-none truncate max-w-[200px]">{talent.name}</h3>
                {talent.paymentStage === 'Yes' && (
                  <div className="h-5 w-5 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {talent.suitableProjectTypes?.slice(0, 2).map((tag: string) => (
                  <Badge key={tag} className="bg-slate-50 text-slate-400 border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider">
                    {tag}
                  </Badge>
                ))}
                {talent.suitableProjectTypes?.length > 2 && (
                  <Badge className="bg-slate-50 text-slate-300 border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-md">
                    +{talent.suitableProjectTypes.length - 2}
                  </Badge>
                )}
              </div>

              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="h-3 w-3 opacity-60" /> {talent.district} Registry
              </p>
            </div>

            {/* Strategic Metrics Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Briefcase className="h-3.5 w-3.5 text-primary opacity-40" />
                <span className="text-[10px] font-bold text-slate-600 tabular-nums">{talent.projectCount || 0} Projects</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold text-slate-600 tabular-nums">{talent.rank || 5}.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Pill Footer */}
        <div className="px-8 pb-8 mt-auto">
          <Button className="w-full rounded-full h-11 bg-slate-50 hover:bg-primary hover:text-white text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-all shadow-none border-none gap-2">
            Open brief +
          </Button>
        </div>
      </Card>
    </Link>
  );
}
