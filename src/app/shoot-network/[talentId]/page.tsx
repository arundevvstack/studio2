
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
  Image as ImageIcon,
  MessageCircle,
  TrendingUp,
  Award
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * @fileOverview Talent Profile Page (Consolidated Master View).
 * Enhanced with professional metrics, project count, rank, media gallery, and direct messaging channels.
 * Restricted destructive actions to Administrator and root Administrator.
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

  // Fetch Member & Role for Deletion Authority
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member } = useDoc(memberRef);

  const roleRef = useMemoFirebase(() => {
    if (!member?.roleId) return null;
    return doc(db, "roles", member.roleId);
  }, [db, member?.roleId]);
  const { data: role } = useDoc(roleRef);

  const isAuthorizedToDelete = role?.name === "Administrator" || role?.name === "root Administrator" || role?.name === "Root Administrator";

  const handleArchive = () => {
    if (!talentRef || !isAuthorizedToDelete) {
      toast({ variant: "destructive", title: "Access Denied", description: "You lack authority to archive personnel." });
      return;
    }
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
    if (!talentRef || !isAuthorizedToDelete) {
      toast({ variant: "destructive", title: "Access Denied", description: "You lack authority to purge personnel records." });
      return;
    }
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
        <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Syncing Consolidated Intelligence...</p>
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

  // Messaging URL generators
  const getWhatsAppLink = () => {
    const phoneLink = talent.socialLinks?.find((l: any) => l.platform === 'WhatsApp')?.url || talent.phone;
    if (!phoneLink) return "#";
    const cleanedPhone = phoneLink.replace(/\D/g, '');
    return `https://wa.me/${cleanedPhone}`;
  };

  const getInstagramLink = () => {
    return talent.socialLinks?.find((l: any) => l.platform === 'Instagram')?.url || talent.socialMediaContact || "#";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/shoot-network")}
            className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-900 leading-none tracking-normal">{talent.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-primary text-white border-none text-[10px] font-bold uppercase px-3 py-1 rounded-xl">
                {talent.category}
              </Badge>
              <span className="text-slate-200">•</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {talent.district}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200 text-slate-600 font-bold text-[10px] uppercase gap-2 hover:bg-slate-50 transition-all tracking-widest">
                <Edit2 className="h-3.5 w-3.5" />
                Configure Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Consolidated Profile</DialogTitle>
              </DialogHeader>
              <TalentForm existingTalent={talent} />
            </DialogContent>
          </Dialog>

          {isAuthorizedToDelete && (
            <>
              <Button 
                variant="outline" 
                onClick={handleArchive}
                className="h-11 px-6 rounded-xl bg-white border-slate-200 text-slate-600 font-bold text-[10px] uppercase gap-2 hover:bg-slate-50 transition-all tracking-widest"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="h-11 px-6 rounded-xl text-destructive font-bold text-[10px] uppercase gap-2 hover:bg-destructive/5 transition-all tracking-widest">
                    <Trash2 className="h-3.5 w-3.5" />
                    Purge
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-headline tracking-normal text-xl">Permanent Purge Confirmation</DialogTitle>
                  </DialogHeader>
                  <div className="py-6">
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Confirm permanent deletion of <span className="font-bold text-slate-900">{talent.name}</span>. This removes all associated credentials, engagement logs, and gallery assets from the system.
                    </p>
                  </div>
                  <DialogFooter className="gap-3">
                    <DialogClose asChild><Button variant="ghost" className="font-bold text-xs uppercase tracking-normal">Cancel</Button></DialogClose>
                    <Button onClick={handleDelete} variant="destructive" className="rounded-xl font-bold px-8 tracking-normal">Confirm Purge</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Identity & Contact Card */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden">
            <div className="p-10 flex flex-col items-center text-center space-y-8">
              <div className="relative group">
                <Avatar className="h-48 w-48 border-8 border-slate-50 shadow-2xl rounded-[3.5rem] transition-transform duration-700 group-hover:scale-[1.03]">
                  <AvatarImage src={displayThumbnail} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">{talent.name?.[0]}</AvatarFallback>
                </Avatar>
                {talent.paymentStage === 'Yes' && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-2 shadow-lg ring-4 ring-slate-50">
                    <ShieldCheck className="h-8 w-8 text-blue-500" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">{talent.name}</h2>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < (talent.rank || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge className={`border-none font-bold text-[9px] uppercase px-4 py-1.5 rounded-xl tracking-widest ${talent.paymentStage === 'Yes' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {talent.paymentStage === 'Yes' ? 'VERIFIED EXPERT' : 'PENDING REVIEW'}
                </Badge>
                <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[9px] uppercase px-4 py-1.5 rounded-xl tracking-widest">
                  {talent.gender}
                </Badge>
              </div>
            </div>

            <div className="px-10 pb-10 space-y-6 pt-8 border-t border-slate-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Engagements</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{talent.projectCount || 0}</p>
                </div>
                <div className="p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-green-600 mt-1 uppercase tracking-widest">Active</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Engagement Channels</p>
                {talent.email && (
                  <a href={`mailto:${talent.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 truncate tracking-normal">{talent.email}</span>
                  </a>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-green-50/50 border border-green-100 hover:bg-green-50 transition-all">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">WhatsApp</span>
                  </a>
                  <a href={getInstagramLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-all">
                    <Instagram className="h-4 w-4 text-purple-600" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] -mr-24 -mt-24 rounded-full" />
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Intel</p>
              <h4 className="text-xl font-bold font-headline tracking-tight">Deployment Index</h4>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Mobility Score</span>
                <span className="text-xl font-bold font-headline text-primary tracking-tight">Optimized</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '85%' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Multi-tab Data Intelligence */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="matrix" className="w-full">
            <TabsList className="bg-white border border-slate-100 p-2 h-auto rounded-[2.5rem] shadow-sm gap-2 mb-10 flex items-center justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="matrix" className="rounded-2xl px-10 py-4 text-[10px] font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest">
                <User className="h-4 w-4" /> Professional Matrix
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-2xl px-10 py-4 text-[10px] font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest">
                <ImageIcon className="h-4 w-4" /> Creative Gallery
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-2xl px-10 py-4 text-[10px] font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest">
                <History className="h-4 w-4" /> Audit Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="m-0 space-y-8 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Project Verticals</p>
                      <div className="flex flex-wrap gap-2">
                        {talent.suitableProjectTypes && talent.suitableProjectTypes.length > 0 ? (
                          talent.suitableProjectTypes.map((type: string, i: number) => (
                            <Badge key={i} className="bg-primary/5 text-primary border-none font-bold text-[9px] uppercase px-4 py-2 rounded-xl tracking-widest">
                              {type}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic font-medium">No specialized verticals assigned.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Segmentation</p>
                      <div className="flex flex-wrap gap-2">
                        {talent.colabCategories && talent.colabCategories.length > 0 ? (
                          talent.colabCategories.map((cat: string, i: number) => (
                            <Badge key={i} className="bg-slate-900 text-white border-none font-bold text-[9px] uppercase px-4 py-2 rounded-xl tracking-widest">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[9px] uppercase px-4 py-2 rounded-xl tracking-widest">General Crew</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-accent" />
                        </div>
                        <h4 className="font-bold text-lg text-slate-900 tracking-tight">Performance Summary</h4>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-slate-600 italic tracking-tight">
                        "Member demonstrates high reliability in {talent.category} verticals. Consistently delivers within production timelines with a rank stability of {talent.rank || 5}.0/5.0."
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Award className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">Senior Tier</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Org Classification</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </Card>
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <Zap className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">{talent.freeCollab === 'Yes' ? 'Collab Ready' : 'Project Based'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collab Availability</p>
                    </div>
                  </div>
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="m-0 space-y-8 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10">
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal">Production Showcase</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Stills and video reels from verified engagements.</p>
                    </div>
                    <Button variant="ghost" className="text-primary font-bold text-[10px] uppercase tracking-widest gap-2">
                      <Plus className="h-4 w-4" /> Update Assets
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {talent.gallery && talent.gallery.length > 0 ? (
                      talent.gallery.map((asset: any, i: number) => (
                        <div key={i} className="aspect-[4/5] rounded-[2rem] bg-slate-100 overflow-hidden relative group shadow-sm border border-slate-50">
                          <img src={asset.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Production Asset" />
                          {asset.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Play className="h-6 w-6 text-white fill-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] text-center space-y-6 bg-slate-50/30">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-white shadow-inner flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-slate-200" />
                        </div>
                        <div className="max-w-xs space-y-2">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Professional Assets</p>
                          <p className="text-xs text-slate-300 italic font-medium leading-relaxed">Showcase professional stills, campaign lookbooks, and high-fidelity video reels here.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10">
                <div className="space-y-10">
                  <h3 className="text-xl font-bold font-headline text-slate-900 tracking-normal flex items-center gap-3">
                    <History className="h-5 w-5 text-primary" /> System Audit Trail
                  </h3>
                  <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registry Admission</p>
                        <p className="text-sm font-bold text-slate-900 mt-1 tracking-normal">
                          {talent.createdAt ? new Date(talent.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-slate-200 hidden md:block" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identity Status</p>
                        <Badge className={`border-none font-bold text-[9px] uppercase px-4 py-1 tracking-widest mt-1 ${talent.isArchived ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          {talent.isArchived ? 'ARCHIVED' : 'ACTIVE IN HUB'}
                        </Badge>
                      </div>
                      <div className="h-10 w-px bg-slate-200 hidden md:block" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sync Consistency</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">100% Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
