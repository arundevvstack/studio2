"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Instagram, 
  MapPin, 
  CheckCircle2, 
  Star, 
  IndianRupee, 
  Trash2, 
  Edit2, 
  Award,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TalentForm } from "./TalentForm";

export function TalentCard({ talent }: { talent: any }) {
  const db = useFirestore();

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleVerify = async () => {
    try {
      await updateDoc(doc(db, "talents", talent.id), {
        verified: !talent.verified,
        last_verified_date: serverTimestamp()
      });
      toast({ title: talent.verified ? "Verification Revoked" : "Identity Verified", description: talent.name });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await updateDoc(doc(db, "talents", talent.id), {
        featured: !talent.featured
      });
      toast({ title: talent.featured ? "Removed from Featured" : "Promoted to Featured", description: talent.name });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to purge this talent identity?")) return;
    try {
      await deleteDoc(doc(db, "talents", talent.id));
      toast({ variant: "destructive", title: "Entity Purged", description: talent.name });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed", description: e.message });
    }
  };

  return (
    <Card className={`overflow-hidden border-2 rounded-[3rem] bg-white group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col ${talent.featured ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-transparent shadow-sm'}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 p-3">
        <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-inner">
          <img 
            src={talent.profile_picture || `https://picsum.photos/seed/${talent.id}/400/500`}
            alt={talent.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
          {talent.featured && (
            <Badge className="bg-primary text-white border-none shadow-lg shadow-primary/20 px-4 py-1.5 rounded-full font-bold text-[8px] uppercase tracking-widest gap-2">
              <Award className="h-3 w-3" /> Featured
            </Badge>
          )}
          {talent.verified && (
            <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-none shadow-lg px-4 py-1.5 rounded-full font-bold text-[8px] uppercase tracking-widest gap-2">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </Badge>
          )}
          {talent.ready_to_collab && (
            <Badge className="bg-green-500/90 backdrop-blur-md text-white border-none shadow-lg px-4 py-1.5 rounded-full font-bold text-[8px] uppercase tracking-widest">
              Ready to Collab
            </Badge>
          )}
        </div>

        <div className="absolute top-6 left-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl bg-white/80 backdrop-blur-md border-none shadow-lg hover:bg-white transition-all">
                <MoreHorizontal className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-[1.5rem] w-56 p-2 shadow-2xl border-slate-100">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Strategic Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleVerify} className="rounded-xl p-3 cursor-pointer gap-3">
                <CheckCircle2 className={`h-4 w-4 ${talent.verified ? 'text-slate-400' : 'text-blue-500'}`} />
                <span className="font-bold text-xs">{talent.verified ? 'Revoke Verification' : 'Verify Identity'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleFeatured} className="rounded-xl p-3 cursor-pointer gap-3">
                <Award className={`h-4 w-4 ${talent.featured ? 'text-slate-400' : 'text-primary'}`} />
                <span className="font-bold text-xs">{talent.featured ? 'Remove Featured' : 'Promote to Featured'}</span>
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()} className="rounded-xl p-3 cursor-pointer gap-3">
                    <Edit2 className="h-4 w-4 text-slate-600" />
                    <span className="font-bold text-xs">Update Intelligence</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="p-10 pb-0"><DialogTitle className="text-3xl font-bold font-headline tracking-tight">Edit Talent Intel</DialogTitle></DialogHeader>
                  <TalentForm existingTalent={talent} onSuccess={() => window.location.reload()} />
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

      <div className="p-8 pt-4 flex-grow space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{talent.name}</h3>
            <Badge variant="outline" className="border-slate-100 text-[10px] font-bold uppercase text-slate-400 rounded-lg">{talent.category}</Badge>
          </div>
          <p className="text-sm font-bold text-primary tracking-normal flex items-center gap-1">
            <Instagram className="h-3.5 w-3.5" /> @{talent.instagram_username || 'talent'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-50">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reach Index</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{formatFollowers(talent.followers || 0)}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strategic Quote</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums flex items-center gap-0.5">
              <IndianRupee className="h-4 w-4 text-slate-300" />
              {talent.estimated_cost?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{talent.location}</span>
          </div>
          <Button variant="ghost" className="rounded-full h-10 px-6 bg-slate-50 hover:bg-slate-900 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest border-none">
            Details +
          </Button>
        </div>
      </div>
    </Card>
  );
}
