
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
  Users,
  Instagram,
  MoreHorizontal,
  ShieldCheck,
  Award,
  Trash2,
  Edit2
} from "lucide-react";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { TalentForm } from "./TalentForm";

/**
 * @fileOverview Strategic Talent Identity Card.
 * Displays REACH (K/M) and RANK identifiers with integrated Admin controls.
 */

export function TalentCard({ talent }: { talent: any }) {
  const db = useFirestore();
  const displayThumbnail = talent.thumbnail || `https://picsum.photos/seed/${talent.id}/400/500`;

  const formatFollowers = (count: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleVerify = () => {
    const isVerified = talent.paymentStage === 'Yes';
    updateDocumentNonBlocking(doc(db, "shoot_network", talent.id), {
      paymentStage: isVerified ? 'No' : 'Yes',
      last_verified_date: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    toast({ title: isVerified ? "Verification Revoked" : "Identity Verified", description: talent.name });
  };

  const handleToggleFeatured = () => {
    updateDocumentNonBlocking(doc(db, "shoot_network", talent.id), {
      featured: !talent.featured,
      updatedAt: serverTimestamp()
    });
    toast({ title: talent.featured ? "Removed from Featured" : "Promoted to Featured", description: talent.name });
  };

  const handleDelete = () => {
    deleteDocumentNonBlocking(doc(db, "shoot_network", talent.id));
    toast({ variant: "destructive", title: "Entity Purged", description: talent.name });
  };

  return (
    <div className="relative group h-full">
      <Link href={`/shoot-network/${talent.id}`} className="block h-full">
        <Card className={`border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col ${talent.featured ? 'ring-2 ring-primary/20' : ''}`}>
          <div className="p-4 flex-grow">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] shadow-sm bg-slate-100">
              <img 
                src={displayThumbnail} 
                alt={talent.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold text-[8px] uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                  {talent.category}
                </Badge>
                {talent.featured && (
                  <Badge className="bg-primary text-white border-none font-bold text-[7px] uppercase px-3 py-1 rounded-full shadow-lg tracking-widest">
                    <Award className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>
            </div>

            <div className="px-6 py-8 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-tight leading-none truncate">{talent.name}</h3>
                  {talent.paymentStage === 'Yes' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {talent.suitableProjectTypes?.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} className="bg-slate-50 text-slate-400 border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-md">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 opacity-60" /> {talent.district} Hub
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reach Index</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-primary" />
                    <span className="text-xs font-bold text-slate-900 tabular-nums">{formatFollowers(talent.followers)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Strategic Rank</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-slate-900">{talent.rank || 5}.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 mt-auto">
            <Button className="w-full rounded-full h-11 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-all shadow-none border-none">
              Open full brief +
            </Button>
          </div>
        </Card>
      </Link>

      {/* Admin Quick Actions */}
      <div className="absolute top-8 left-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl bg-white/80 backdrop-blur-md border-none shadow-lg hover:bg-white transition-all">
              <MoreHorizontal className="h-5 w-5 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-2xl w-56 p-2 shadow-2xl border-slate-100">
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Administrative Control</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleVerify} className="rounded-xl p-3 cursor-pointer gap-3">
              <ShieldCheck className={`h-4 w-4 ${talent.paymentStage === 'Yes' ? 'text-slate-400' : 'text-blue-500'}`} />
              <span className="font-bold text-xs">{talent.paymentStage === 'Yes' ? 'Revoke Verification' : 'Verify Identity'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleFeatured} className="rounded-xl p-3 cursor-pointer gap-3">
              <Award className={`h-4 w-4 ${talent.featured ? 'text-slate-400' : 'text-primary'}`} />
              <span className="font-bold text-xs">{talent.featured ? 'Remove Featured' : 'Promote to Featured'}</span>
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={e => e.preventDefault()} className="rounded-xl p-3 cursor-pointer gap-3">
                  <Edit2 className="h-4 w-4 text-slate-600" />
                  <span className="font-bold text-xs">Update Intel</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[750px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-0"><DialogTitle className="text-2xl font-bold font-headline">Edit Talent Intel</DialogTitle></DialogHeader>
                <TalentForm existingTalent={talent} />
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="rounded-xl p-3 cursor-pointer gap-3 text-destructive focus:text-destructive focus:bg-destructive/5">
              <Trash2 className="h-4 w-4" />
              <span className="font-bold text-xs">Purge Record</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
