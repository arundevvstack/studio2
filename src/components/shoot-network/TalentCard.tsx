
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Instagram, 
  ExternalLink, 
  Phone, 
  MessageSquare, 
  Mail,
  User,
  CheckCircle2,
  Trash2,
  Edit2
} from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export function TalentCard({ talent }: { talent: any }) {
  const db = useFirestore();

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    const talentRef = doc(db, "shoot_network", talent.id);
    updateDocumentNonBlocking(talentRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
    toast({
      title: "Talent Archived",
      description: `${talent.name} has been soft-deleted from the directory.`
    });
  };

  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-8 space-y-6">
        <div className="flex items-start justify-between">
          <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-md rounded-3xl group-hover:scale-105 transition-transform">
            <AvatarImage src={talent.thumbnail || `https://picsum.photos/seed/${talent.id}/200/200`} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
              {talent.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <Badge className={`border-none font-bold text-[8px] uppercase px-2 py-0.5 tracking-normal ${talent.paymentStage === 'Yes' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
              {talent.paymentStage === 'Yes' ? 'Verified' : 'Pending'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleArchive} className="h-8 w-8 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/5">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">{talent.name}</h3>
            {talent.paymentStage === 'Yes' && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
          </div>
          <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-normal">{talent.category}</p>
        </div>

        <div className="flex items-center gap-4 py-4 border-y border-slate-50">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-normal">{talent.district}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <User className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-normal">{talent.gender}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {talent.colabCategories?.slice(0, 3).map((tag: string, i: number) => (
            <Badge key={i} variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-bold uppercase px-2 tracking-normal">
              {tag}
            </Badge>
          ))}
          {talent.colabCategories?.length > 3 && (
            <span className="text-[8px] font-bold text-slate-300 uppercase pl-1">+{talent.colabCategories.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {talent.socialMediaContact && (
              <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary">
                <a href={talent.socialMediaContact} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {talent.portfolio && (
              <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary">
                <a href={talent.portfolio} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <Button asChild variant="outline" className="flex-1 h-10 rounded-xl border-slate-100 font-bold text-[10px] uppercase tracking-normal hover:bg-primary hover:text-white transition-all">
            <Link href={`/shoot-network/${talent.id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
