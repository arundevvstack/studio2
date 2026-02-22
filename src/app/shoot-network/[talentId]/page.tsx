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
  Activity
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
 * Streamlined to focus on core partner metadata and creative taxonomy.
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

              <div className="flex flex-wrap justify-center gap-2 pt-4">
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

              {talent.portfolio && (
                <a href={talent.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Talent Portfolio</p>
                      <p className="text-sm font-bold text-slate-900 tracking-normal">View Showreel</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">System Guidance</p>
              <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal">
                "Profile optimized for {talent.category} deployments in {talent.district}."
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 relative z-10">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-normal">
                 <span>Partner Vitality</span>
                 <span className="text-primary">Nominal</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-primary" style={{ width: '92%' }} />
               </div>
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
                  Professional Profile
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium tracking-normal">Detailed partner demographics and creative taxonomy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Identity Meta</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Partner Age</p>
                        <p className="text-xl font-bold text-slate-900 mt-1 tracking-normal">{talent.age || "—"}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Gender</p>
                        <p className="text-xl font-bold text-slate-900 mt-1 tracking-normal">{talent.gender}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Collab Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.colabCategories && talent.colabCategories.length > 0 ? (
                        talent.colabCategories.map((cat: string, i: number) => (
                          <Badge key={i} className="bg-slate-900 text-white border-none font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl tracking-normal">
                            {cat}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic font-medium tracking-normal">No specific collab tiers recorded.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Deployment Metrics</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-bold text-slate-600 tracking-normal uppercase text-[10px]">Payment Stage</span>
                        </div>
                        <Badge className={`border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal ${talent.paymentStage === 'Yes' ? 'bg-green-50 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                          {talent.paymentStage === 'Yes' ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-bold text-slate-600 tracking-normal uppercase text-[10px]">Referred By</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 tracking-normal">{talent.referredBy || "Organic Entry"}</span>
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
                  <History className="h-5 w-5 text-primary" />
                  Audit Trail
                </h3>
              </div>
              <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Created On</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">
                    {talent.createdAt ? new Date(talent.createdAt.seconds * 1000).toLocaleString('en-GB', { dateStyle: 'long' }) : '—'}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Last Update</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">
                    {talent.updatedAt ? new Date(talent.updatedAt.seconds * 1000).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }) : '—'}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Status</p>
                  <Badge className={`border-none font-bold text-[10px] uppercase px-3 tracking-normal mt-1 ${talent.isArchived ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {talent.isArchived ? 'ARCHIVED' : 'ACTIVE IN ENGINE'}
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
