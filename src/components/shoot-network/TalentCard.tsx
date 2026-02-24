
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
  Briefcase
} from "lucide-react";
import Link from "next/link";

/**
 * @fileOverview High-fidelity Talent Card matching the reference design.
 * Features ultra-rounded corners [3rem], large imagery [aspect-4/5], and verified identifiers.
 */

export function TalentCard({ talent }: { talent: any }) {
  const displayThumbnail = talent.thumbnail || `https://picsum.photos/seed/${talent.id}/400/500`;

  return (
    <Link href={`/shoot-network/${talent.id}`} className="block group">
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
        <div className="p-4 flex-grow">
          {/* High-Fidelity Visual Asset */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] shadow-sm">
            <img 
              src={displayThumbnail} 
              alt={talent.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute top-5 right-5">
              <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold text-[8px] uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                {talent.category}
              </Badge>
            </div>
          </div>

          <div className="px-6 py-8 space-y-5">
            {/* Professional Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-tight leading-none">{talent.name}</h3>
                {talent.paymentStage === 'Yes' && (
                  <div className="h-5 w-5 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2 uppercase tracking-widest opacity-80">
                Kerala District Registry • {talent.district}
              </p>
            </div>

            {/* Strategic Metrics Row */}
            <div className="flex items-center gap-8 pt-2">
              <div className="flex items-center gap-2.5 text-slate-400">
                <Briefcase className="h-4 w-4 text-primary opacity-40" />
                <span className="text-xs font-bold text-slate-600 tabular-nums">{talent.projectCount || 0} Projects</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-slate-600 tabular-nums">{talent.rank || 5}.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Pill Footer */}
        <div className="px-10 pb-10">
          <Button className="w-full rounded-full h-12 bg-slate-50 hover:bg-primary hover:text-white text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-all shadow-none border-none gap-2">
            Open Brief +
          </Button>
        </div>
      </Card>
    </Link>
  );
}
