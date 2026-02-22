
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
  User,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Star,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

/**
 * @fileOverview High-fidelity Talent Card for the Shoot Network Repository.
 * Updated with Rank and Project Count indicators.
 */

export function TalentCard({ talent }: { talent: any }) {
  const db = useFirestore();
  
  const displayThumbnail = talent.thumbnail || `https://picsum.photos/seed/${talent.id}/200/200`;

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const talentRef = doc(db, "shoot_network", talent.id);
    updateDocumentNonBlocking(talentRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
    toast({
      title: "Strategy Logged",
      description: `${talent.name} has been soft-deleted from the directory.`
    });
  };

  return (
    <Link href={`/shoot-network/${talent.id}`} className="block group">
      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full">
        <div className="p-8 space-y-6 flex flex-col h-full">
          <div className="flex items-start justify-between">
            <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-md rounded-[2rem] group-hover:scale-105 transition-transform duration-500">
              <AvatarImage src={displayThumbnail} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
                {talent.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-lg tracking-normal ${talent.paymentStage === 'Yes' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                {talent.paymentStage === 'Yes' ? 'Verified' : 'Pending'}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-bold text-slate-600">{talent.rank || 5}.0</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal leading-none">{talent.name}</h3>
              {talent.paymentStage === 'Yes' && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
            </div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-normal tracking-widest">{talent.category}</p>
          </div>

          <div className="flex items-center gap-4 py-4 border-y border-slate-50">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-normal">{talent.district}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-normal">{talent.projectCount || 0} Projects</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[40px] flex-grow">
            {talent.suitableProjectTypes?.slice(0, 3).map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded-lg tracking-normal">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              {talent.socialMediaContact && (
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                  <Instagram className="h-4 w-4" />
                </div>
              )}
              {talent.portfolio && (
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                  <ExternalLink className="h-4 w-4" />
                </div>
              )}
            </div>
            <Button variant="outline" className="flex-1 h-10 rounded-xl border-slate-100 font-bold text-[10px] uppercase tracking-normal hover:bg-slate-900 hover:text-white transition-all gap-2">
              View Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
