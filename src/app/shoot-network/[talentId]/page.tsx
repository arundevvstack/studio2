"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  MapPin, 
  Instagram, 
  ExternalLink, 
  User, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Edit2, 
  Archive, 
  Mail, 
  Phone, 
  Tag, 
  Users, 
  History,
  Save,
  Loader2,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  MessageSquare,
  Star,
  Briefcase,
  Play,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { TalentForm } from "@/components/shoot-network/TalentForm";

/**
 * @fileOverview Talent Profile Page.
 * Enhanced with professional metrics, project count, rank, and media gallery.
 */

export default function TalentProfilePage({ params }: { params: Promise<{ talentId: string }> }) {
  const { talentId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const talentRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "shoot_network", talentId);
  }, [db, talentId, user]);

  const { data: talent, isLoading: isTalentLoading } = useDoc(talentRef);

  const handleArchive = () => {
    if (!talentRef) return;
    updateDocumentNonBlocking(talentRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
    toast({
      title: "Operation Successful",
      description: `${talent?.name} has been archived.`
    });
    router.push("/shoot-network");
  };

  const handleDelete = () => {
    if (!talentRef) return;
    deleteDocumentNonBlocking(talentRef);
    toast({
      variant: "destructive",
      title: "Entity Purged",
      description: "Profile removed from the creative engine."
    });
    router.push("/shoot-network");
  };

  if (isUserLoading || isTalentLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Syncing Partner Intelligence...</p>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline tracking-normal">Intelligence Entry Not Found</h2>
        <Button onClick={() => router.push("/shoot-network")} className="font-bold tracking-normal">Return to Repository</Button>
      </div>
    );
  }

  const displayThumbnail = talent.thumbnail || `https://picsum.photos/seed/${talent.id}/400/400`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="h-10 px-4 rounded-xl bg-white border-slate-200 shadow-sm text-slate-600 font-bold text-xs uppercase gap-2 hover:bg-slate-50 transition-all tracking-normal"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Network
        </Button>

        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 px-4 rounded-xl bg-white border-slate-200 shadow-sm text-slate-600 font-bold text-xs uppercase gap-2 hover:bg-slate-50 transition-all tracking-normal">
                <Edit2 className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Partner Profile</DialogTitle>
              </DialogHeader>
              <TalentForm existingTalent={talent} />
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={handleArchive}
            className="h-10 px-4 rounded-xl bg-white border-slate-200 shadow-sm text-slate-600 font-bold text-xs uppercase gap-2 hover:bg-slate-50 transition-all tracking-normal"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="h-10 px-4 rounded-xl text-destructive font-bold text-xs uppercase gap-2 hover:bg-destructive/5 transition-all tracking-normal">
                <Trash2 className="h-3.5 w-3.5" />
                Purge
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="font-headline tracking-normal">Confirm Permanent Deletion</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Are you sure you want to permanently delete <span className="font-bold text-slate-900">{talent.name}</span>? This action cannot be undone and will remove all associated intelligence logs.
                </p>
              </div>
              <DialogFooter className="gap-3">
                <DialogClose asChild><Button variant="ghost" className="font-bold text-xs uppercase tracking-normal">Cancel</Button></DialogClose>
                <Button onClick={handleDelete} variant="destructive" className="rounded-xl font-bold px-6 tracking-normal">Confirm Purge</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
            <div className="p-10 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-8 border-slate-50 shadow-2xl rounded-[3rem] transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage src={displayThumbnail} />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">{talent.name?.[0]}</AvatarFallback>
                </Avatar>
                {talent.paymentStage === 'Yes' && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-2 shadow-lg ring-4 ring-slate-50">
                    <ShieldCheck className="h-6 w-6 text-blue-500" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold font-headline text-slate-900 leading-none tracking-normal">{talent.name}</h1>
                <p className="text-[10px] font-bold text-primary uppercase mt-3 tracking-normal tracking-widest">{talent.category}</p>
              </div>

              <div className="flex items-center gap-1 justify-center py-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < (talent.rank || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Badge className={`border-none font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl tracking-normal ${talent.paymentStage === 'Yes' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {talent.paymentStage === 'Yes' ? 'Verified Elite' : 'Verification Pending'}
                </Badge>
                <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl tracking-normal">
                  {talent.gender}
                </Badge>
              </div>
            </div>

            <div className="px-10 pb-10 space-y-6 pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Hub Location</p>
                    <p className="text-sm font-bold text-slate-900 tracking-normal">{talent.district}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Total Engagements</p>
                    <p className="text-sm font-bold text-slate-900 tracking-normal">{talent.projectCount || 0} Successful Projects</p>
                  </div>
                </div>
              </div>

              {talent.socialMediaContact && (
                <a href={talent.socialMediaContact} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Social Grid</p>
                      <p className="text-sm font-bold text-slate-900 tracking-normal">@{talent.socialMediaContact.split('/').filter(Boolean).pop() || 'Profile'}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-white p-8 space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Communication Hub</h4>
            <div className="space-y-4">
              {talent.email && (
                <a href={`mailto:${talent.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Email Channel</p>
                    <p className="text-sm font-bold text-slate-900 truncate tracking-normal">{talent.email}</p>
                  </div>
                </a>
              )}
              {talent.phone && (
                <a href={`tel:${talent.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-accent/5 hover:border-accent/20 transition-all group">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:text-accent">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Direct Hotline</p>
                    <p className="text-sm font-bold text-slate-900 tracking-normal">{talent.phone}</p>
                  </div>
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Intelligence */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  Professional Matrix
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium tracking-normal">Assessment of skill depth and project compatibility.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Deployment Suitability</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.suitableProjectTypes && talent.suitableProjectTypes.length > 0 ? (
                        talent.suitableProjectTypes.map((type: string, i: number) => (
                          <Badge key={i} className="bg-primary/5 text-primary border-none font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl tracking-normal">
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic font-medium tracking-normal">No specific project verticals recorded.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Collaboration Tier</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.colabCategories && talent.colabCategories.length > 0 ? (
                        talent.colabCategories.map((cat: string, i: number) => (
                          <Badge key={i} className="bg-slate-900 text-white border-none font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl tracking-normal">
                            {cat}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic font-medium tracking-normal">General Collab.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Demographics</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Age</p>
                        <p className="text-xl font-bold text-slate-900 mt-1 tracking-normal">{talent.age || "—"}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Status</p>
                        <p className="text-xl font-bold text-slate-900 mt-1 tracking-normal">Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Professional Gallery
                </h3>
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase gap-2 tracking-normal">
                  <Plus className="h-4 w-4" /> Manage Assets
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {talent.gallery && talent.gallery.length > 0 ? (
                  talent.gallery.map((asset: any, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl bg-slate-100 overflow-hidden relative group">
                      <img src={asset.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Talent Asset" />
                      {asset.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-[2rem] text-center space-y-4">
                    <ImageIcon className="h-12 w-12 text-slate-200" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No assets uploaded</p>
                      <p className="text-xs text-slate-300 italic tracking-normal">Showcase professional stills and video reels here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <div className="space-y-8">
              <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal flex items-center gap-3">
                <History className="h-5 w-5 text-primary" />
                Partner Audit Trail
              </h3>
              <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Registered</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">
                    {talent.createdAt ? new Date(talent.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Engagement Score</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">High Mobility</p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Status</p>
                  <Badge className={`border-none font-bold text-[10px] uppercase px-3 tracking-normal mt-1 ${talent.isArchived ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {talent.isArchived ? 'ARCHIVED' : 'ACTIVE'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
