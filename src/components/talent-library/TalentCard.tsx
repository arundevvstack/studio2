
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
  MoreHorizontal,
  ShieldCheck,
  Users
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
import Link from "next/link";

export function TalentCard({ talent }: { talent: any }) {
  const db = useFirestore();

  const formatFollowers = (count: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleVerify = async () => {
    try {
      const isVerified = talent.verified === true;
      await updateDoc(doc(db, "talents", talent.id), {
        verified: !isVerified,
        last_verified_date: serverTimestamp()
      });
      toast({ title: isVerified ? "Verification Revoked" : "Identity Verified", description: talent.name });
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
    if (!confirm(`Confirm permanent delete of talent record: ${talent.name}?`)) return;
    try {
      await deleteDoc(doc(db, "talents", talent.id));
      toast({ variant: "destructive", title: "Entity Deleted", description: talent.name });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: e.message });
    }
  };

  return (
    <Card className={`overflow-hidden border-none shadow-sm rounded-[2rem] bg-white group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col ${talent.featured ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img 
          src={talent.profile_picture || `https://picsum.photos/seed/${talent.id}/400/500`}
          alt={talent.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {talent.featured && (
            <Badge className="bg-primary text-white border-none shadow-lg px-3 py-1 rounded-full font-bold text-[8px] uppercase tracking-widest">
              <Award className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
          {talent.verified && (
            <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-none shadow-lg px-3 py-1 rounded-full font-bold text-[8px] uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3 mr-1" /> Verified
            </Badge>
          )}
        </div>

        {/* Bottom Place Tag */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-black/40 backdrop-blur-md text-white border-none shadow-lg px-3 py-1 rounded-full font-bold text-[8px] uppercase tracking-widest gap-1.5 flex items-center">
            <MapPin className="h-3 w-3" />
            {talent.location}
          </Badge>
        </div>

        {/* Admin Quick Actions */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur-md border-none shadow-lg">
                <MoreHorizontal className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl w-52 p-2 shadow-2xl">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Registry Control</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleVerify} className="rounded-lg p-2.5 cursor-pointer gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-xs">{talent.verified ? 'Revoke Verification' : 'Verify Identity'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleFeatured} className="rounded-lg p-2.5 cursor-pointer gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-bold text-xs">{talent.featured ? 'Remove Featured' : 'Promote to Featured'}</span>
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()} className="rounded-lg p-2.5 cursor-pointer gap-2">
                    <Edit2 className="h-4 w-4 text-slate-600" />
                    <span className="font-bold text-xs">Update Details</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="p-8 pb-0"><DialogTitle className="text-2xl font-bold font-headline">Edit Talent Intel</DialogTitle></DialogHeader>
                  <TalentForm existingTalent={talent} onSuccess={() => {}} />
                </DialogContent>
              </Dialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="rounded-lg p-2.5 cursor-pointer gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="font-bold text-xs">Delete Record</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-6 flex-grow space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="overflow-hidden">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">{talent.name}</h3>
            <p className="text-xs font-bold text-primary tracking-normal">@{talent.instagram_username || 'talent'}</p>
          </div>
          <Badge className="bg-slate-50 text-slate-500 border-none font-bold text-[8px] uppercase px-3 py-1 shrink-0">
            {Array.isArray(talent.category) ? talent.category[0] : talent.category}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reach</p>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-sm font-bold text-slate-900">{formatFollowers(talent.followers || 0)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Cost</p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-0.5 justify-end">
              <IndianRupee className="h-3 w-3 text-slate-300" />
              {talent.estimated_cost?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < (talent.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
            ))}
          </div>
          {talent.ready_to_collab && (
            <Badge className="bg-green-50 text-green-600 border-none font-bold text-[8px] uppercase px-3 py-1">
              Collab Ready
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
