
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Instagram, 
  ExternalLink, 
  CheckCircle2,
  ArrowRight,
  Star,
  Briefcase,
  Users
} from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview High-fidelity Talent Card matching the reference design.
 * Features ultra-rounded corners [3rem], large imagery, and minimalist stats.
 */

export function TalentCard({ talent }: { talent: any }) {
  const db = useFirestore();
  
  const displayThumbnail = talent.thumbnail || `https://picsum.photos/seed/${talent.id}/400/400`;

  return (
    <Link href={`/shoot-network/${talent.id}`} className="block group">
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
        <div className="p-4 flex-grow">
          {/* Main Visual Asset */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] shadow-sm">
            <img 
              src={displayThumbnail} 
              alt={talent.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold text-[8px] uppercase px-3 py-1 rounded-full shadow-sm">
                {talent.category}
              </Badge>
            </div>
          </div>

          <div className="px-4 py-6 space-y-4">
            {/* Identity Block */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-headline text-slate-900 tracking-tight">{talent.name}</h3>
                {talent.paymentStage === 'Yes' && <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-50" />}
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                Verified {talent.category} professional specializing in {talent.suitableProjectTypes?.[0] || 'media production'} in {talent.district}.
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-bold text-slate-600">{talent.projectCount || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-slate-600">{talent.rank || 5}.0</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-normal">{talent.district.substring(0, 3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="px-8 pb-8">
          <Button className="w-full rounded-full h-12 bg-slate-50 hover:bg-primary hover:text-white text-slate-900 font-bold text-xs uppercase transition-all shadow-none border-none gap-2">
            View Profile +
          </Button>
        </div>
      </Card>
    </Link>
  );
}
