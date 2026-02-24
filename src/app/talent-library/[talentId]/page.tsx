
"use client";

import React from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  CheckCircle2, 
  MapPin, 
  Globe, 
  Instagram, 
  Youtube, 
  ExternalLink,
  Star,
  IndianRupee,
  Users,
  BarChart3,
  Image as ImageIcon,
  FileText,
  Share2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TalentDetailPage({ params }: { params: Promise<{ talentId: string }> }) {
  const { talentId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();

  const talentRef = useMemoFirebase(() => doc(db, "talents", talentId), [db, talentId]);
  const { data: talent, isLoading } = useDoc(talentRef);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Award className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Talent Intelligence...</p>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-bold">Talent Not Found</h2>
        <Button onClick={() => router.push("/talent-library")}>Return to Library</Button>
      </div>
    );
  }

  const primaryPlatform = talent.platforms?.instagram?.followers > (talent.platforms?.youtube?.subscribers || 0) 
    ? { name: 'Instagram', stats: talent.platforms.instagram } 
    : { name: 'YouTube', stats: talent.platforms?.youtube };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="h-12 w-12 rounded-2xl bg-white border-slate-100 shadow-sm"
        >
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{talent.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-primary text-white border-none text-[10px] font-bold uppercase px-3 py-1">
              {talent.type}
            </Badge>
            <span className="text-slate-300">•</span>
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {talent.location}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Profile Overview */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden text-center">
            <div className="p-10 space-y-6">
              <div className="relative inline-block group">
                <Avatar className="h-48 w-48 border-8 border-slate-50 shadow-2xl rounded-[3.5rem]">
                  <AvatarImage src={talent.profileImage} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">{talent.name[0]}</AvatarFallback>
                </Avatar>
                {talent.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-2 shadow-lg ring-4 ring-slate-50">
                    <CheckCircle2 className="h-8 w-8 text-blue-500" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">{talent.name}</h2>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < (talent.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {talent.category?.map((cat: string) => (
                  <Badge key={cat} className="bg-slate-50 text-slate-500 border-none font-bold text-[10px] uppercase px-4 py-1.5 rounded-xl">
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4 border-t border-slate-50">
                <div className="text-center p-4 rounded-3xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Languages</p>
                  <p className="text-sm font-bold text-slate-900">{talent.languages?.join(', ') || 'English'}</p>
                </div>
                <div className="text-center p-4 rounded-3xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <Badge className="bg-green-50 text-green-600 border-none text-[10px] font-bold px-3">{talent.status || 'Active'}</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] -mr-24 -mt-24 rounded-full" />
            <div className="space-y-4 relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Pricing Architecture
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Rate</p>
                    <p className="text-4xl font-bold font-headline">₹{talent.estimatedCost?.toLocaleString()}</p>
                  </div>
                  <Badge className="bg-white/10 text-white border-none font-bold text-[10px] px-3 mb-1">
                    {talent.costType}
                  </Badge>
                </div>
                <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 font-medium">Collab Model</span>
                    <span className="text-sm font-bold text-primary">{talent.collabType}</span>
                  </div>
                  {talent.availableForFreeCollab && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <Sparkles className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-bold text-green-400 uppercase">Strategy: Ready for Free Collab</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Details & Tabs */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="bg-white border border-slate-100 p-2 h-auto rounded-[2rem] shadow-sm gap-2 mb-8 flex items-center justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="stats" className="rounded-2xl px-8 py-4 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <BarChart3 className="h-4 w-4" />
                Social Metrics
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="rounded-2xl px-8 py-4 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ImageIcon className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-2xl px-8 py-4 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <FileText className="h-4 w-4" />
                Intelligence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="m-0 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Instagram Stats */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                      <Instagram className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-slate-50">
                      <a href={talent.platforms?.instagram?.url} target="_blank" rel="noopener noreferrer">
                        Visit Feed <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
                        <p className="text-3xl font-bold text-slate-900">{(talent.platforms?.instagram?.followers || 0).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement</p>
                        <p className="text-3xl font-bold text-primary">{talent.platforms?.instagram?.engagementRate || 0}%</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Engagement Index</p>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min((talent.platforms?.instagram?.engagementRate || 0) * 10, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* YouTube Stats */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                      <Youtube className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-slate-50">
                      <a href={talent.platforms?.youtube?.url} target="_blank" rel="noopener noreferrer">
                        Visit Channel <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscribers</p>
                        <p className="text-3xl font-bold text-slate-900">{(talent.platforms?.youtube?.subscribers || 0).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Videos</p>
                        <p className="text-3xl font-bold text-slate-900">--</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <Badge className="bg-slate-100 text-slate-500 border-none font-bold uppercase text-[9px] px-3">Growth Verified</Badge>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">Reach Strategy</h4>
                    <p className="text-sm text-slate-500 font-medium">Categorized as a <span className="text-primary font-bold">{talent.reachCategory} Talent</span> in your network.</p>
                  </div>
                </div>
                <Button className="h-14 px-10 rounded-2xl font-bold bg-slate-900 text-white shadow-xl shadow-slate-200">
                  Initiate Campaign
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Showcase Gallery</h3>
                    <Button variant="ghost" className="text-primary font-bold text-xs uppercase gap-2">
                      <Plus className="h-4 w-4" /> Add Assets
                    </Button>
                  </div>
                  {talent.portfolioLinks && talent.portfolioLinks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {talent.portfolioLinks.map((link: string, i: number) => (
                        <div key={i} className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                              <ExternalLink className="h-5 w-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Strategic Asset {i + 1}</p>
                              <p className="text-sm font-bold text-slate-900 truncate">{link}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-primary transition-all">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-slate-200">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <div className="max-w-xs space-y-1">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Portfolio Assets</p>
                        <p className="text-xs text-slate-300 italic font-medium">Link professional reels, campaign stills, and creative showcases.</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Internal Intelligence</h3>
                      <p className="text-sm text-slate-500 font-medium">Restricted executive-level production notes.</p>
                    </div>
                  </div>
                  
                  <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative">
                    <p className="text-lg font-medium leading-relaxed italic text-slate-600 whitespace-pre-wrap">
                      {talent.internalNotes || "No internal production notes recorded for this talent. Provide strategic briefing, campaign history, or performance feedback here."}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" className="rounded-xl h-12 px-8 font-bold text-slate-600 border-slate-100 gap-2">
                      <FileText className="h-4 w-4" /> Edit Intelligence
                    </Button>
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
