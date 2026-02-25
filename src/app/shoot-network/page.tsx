"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Loader2, 
  Database,
  LayoutGrid,
  List,
  MapPin,
  Star,
  ArrowRight,
  X,
  Filter,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { TalentCard } from "@/components/shoot-network/TalentCard";
import { TalentFilterSidebar } from "@/components/shoot-network/TalentFilterSidebar";
import { BulkImportButton } from "@/components/shoot-network/BulkImportButton";
import { TalentForm } from "@/components/shoot-network/TalentForm";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

/**
 * @fileOverview Shoot Network Registry (Merged Master Module).
 * High-density repository [4 items in line] optimized for creative personnel deployment.
 * Consolidated from Talent Library and previous Shoot Network files.
 */

export default function ShootNetworkPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<any>({
    category: [],
    district: "All",
    gender: "All",
    paymentStage: "All",
    tags: []
  });

  const talentQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "shoot_network"), 
      where("isArchived", "==", false),
      orderBy("updatedAt", "desc")
    );
  }, [db, user]);

  const { data: talent, isLoading: isDataLoading } = useCollection(talentQuery);

  const filteredTalent = useMemo(() => {
    if (!talent) return [];
    return talent.filter((t: any) => {
      const matchesSearch = (t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.category?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filters.category.length === 0 || filters.category.includes(t.category);
      const matchesDistrict = filters.district === "All" || t.district === filters.district;
      const matchesGender = filters.gender === "All" || t.gender === filters.gender;
      const matchesPayment = filters.paymentStage === "All" || t.paymentStage === filters.paymentStage;
      
      // Filter by Tags (Project Verticals)
      const matchesTags = filters.tags.length === 0 || 
                         (t.suitableProjectTypes && filters.tags.every((tag: string) => t.suitableProjectTypes.includes(tag)));

      return matchesSearch && matchesCategory && matchesDistrict && matchesGender && matchesPayment && matchesTags;
    });
  }, [talent, searchQuery, filters]);

  const removeFilter = (key: string, value?: string) => {
    const updated = { ...filters };
    if (key === 'district') updated.district = 'All';
    if (key === 'gender') updated.gender = 'All';
    if (key === 'paymentStage') updated.paymentStage = 'All';
    if (key === 'category' && value) updated.category = filters.category.filter((c: string) => c !== value);
    if (key === 'tags' && value) updated.tags = (filters.tags || []).filter((t: string) => t !== value);
    setFilters(updated);
  };

  const hasActiveFilters = filters.category.length > 0 || 
                          filters.district !== "All" || 
                          filters.gender !== "All" || 
                          filters.paymentStage !== "All" ||
                          (filters.tags && filters.tags.length > 0);

  const isLoading = isUserLoading || isDataLoading;

  return (
    <div className="flex h-full gap-6 sm:gap-8 animate-in fade-in duration-500">
      {/* Desktop Filter Sidebar */}
      <aside className="w-80 shrink-0 hidden lg:block">
        <TalentFilterSidebar filters={filters} setFilters={setFilters} totalCount={filteredTalent.length} />
      </aside>

      <main className="flex-1 space-y-6 sm:space-y-8 overflow-auto pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-bold font-headline text-slate-900 tracking-tight leading-tight">Shoot Network</h1>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] sm:text-[10px] font-bold px-3 py-1 uppercase tracking-widest shrink-0">
                <Database className="h-3 w-3 mr-1" /> Master Registry
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal mt-2 sm:mt-3">Consolidated intelligence for media anchors, influencers, and creative crew.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex-1 sm:flex-none">
              <BulkImportButton />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-12 sm:h-14 flex-1 sm:flex-none px-8 sm:px-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 gap-2 tracking-widest transition-all active:scale-95 text-[10px] sm:text-xs uppercase">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Onboard Talent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[750px] rounded-[2.5rem] sm:rounded-[3.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 sm:p-10 pb-0">
                  <DialogTitle className="text-xl sm:text-3xl font-bold font-headline tracking-tight">Onboard Professional</DialogTitle>
                </DialogHeader>
                <TalentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-12 sm:pl-16 h-12 sm:h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-sm sm:text-base tracking-normal placeholder:text-slate-400 font-bold" 
                placeholder="Search by name, vertical, or handle..." 
              />
            </div>
            <div className="flex items-center bg-white p-1 rounded-full shadow-sm border border-slate-100 shrink-0 w-full md:w-auto overflow-hidden">
              {/* Mobile Filter Trigger */}
              <div className="lg:hidden flex-1 md:flex-none border-r border-slate-50 pr-1">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="w-full h-10 sm:h-11 rounded-full text-slate-500 font-bold text-[10px] uppercase tracking-widest gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      Refine
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-none sm:max-w-xs">
                    <SheetHeader className="p-6 pb-0">
                      <SheetTitle className="text-xl font-bold font-headline">Registry Filters</SheetTitle>
                    </SheetHeader>
                    <div className="h-full overflow-y-auto pt-4">
                      <TalentFilterSidebar filters={filters} setFilters={setFilters} totalCount={filteredTalent.length} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center px-2">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><LayoutGrid className="h-4 w-4" /></Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><List className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-white/50 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-300">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Active Strategic Filters:</span>
              
              {filters.district !== "All" && (
                <Badge className="bg-white text-slate-600 border border-slate-100 font-bold text-[9px] sm:text-[10px] rounded-full px-3 sm:px-4 py-1.5 gap-2 shadow-sm">
                  {filters.district}
                  <X className="h-3 w-3 text-slate-300 cursor-pointer" onClick={() => removeFilter('district')} />
                </Badge>
              )}

              {filters.category.map((cat: string) => (
                <Badge key={cat} className="bg-white text-primary border border-primary/10 font-bold text-[9px] sm:text-[10px] rounded-full px-3 sm:px-4 py-1.5 gap-2 shadow-sm">
                  {cat}
                  <X className="h-3 w-3 text-primary/30 cursor-pointer" onClick={() => removeFilter('category', cat)} />
                </Badge>
              ))}

              {filters.tags.map((tag: string) => (
                <Badge key={tag} className="bg-slate-900 text-white border-none font-bold text-[9px] sm:text-[10px] rounded-full px-3 sm:px-4 py-1.5 gap-2 shadow-sm">
                  {tag}
                  <X className="h-3 w-3 text-slate-400 cursor-pointer" onClick={() => removeFilter('tags', tag)} />
                </Badge>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({ category: [], district: "All", gender: "All", paymentStage: "All", tags: [] })} 
                className="text-[9px] sm:text-[10px] font-bold text-primary uppercase hover:bg-primary/5 h-8 px-4 rounded-full tracking-widest ml-auto"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 sm:py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Synchronizing Creative Database...</p>
          </div>
        ) : talent && filteredTalent.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredTalent.map((t: any) => <TalentCard key={t.id} talent={t} />)}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 sm:px-10 py-5 sm:py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional Identity</th>
                      <th className="px-6 py-5 sm:py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Verification</th>
                      <th className="px-6 py-5 sm:py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hub Location</th>
                      <th className="px-6 py-5 sm:py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Engagement Load</th>
                      <th className="px-6 sm:px-10 py-5 sm:py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTalent.map((t: any) => (
                      <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 sm:px-10 py-5 sm:py-6">
                          <div className="flex items-center gap-4 sm:gap-5">
                            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-4 border-slate-50 shadow-md shrink-0">
                              <AvatarImage src={t.thumbnail || `https://picsum.photos/seed/${t.id}/100/100`} />
                              <AvatarFallback className="bg-primary/5 text-primary font-bold">{t.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">{t.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge className="bg-primary/5 text-primary border-none font-bold text-[8px] uppercase px-2">{t.category}</Badge>
                                {t.suitableProjectTypes?.slice(0, 1).map((tag: string) => (
                                  <Badge key={tag} className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] uppercase px-2">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 sm:py-6 text-center">
                          <Badge className={`border-none font-bold text-[8px] sm:text-[9px] uppercase px-3 sm:px-4 py-1 rounded-full tracking-widest ${t.paymentStage === 'Yes' ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                            {t.paymentStage === 'Yes' ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 sm:py-6 text-[10px] sm:text-xs font-bold text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-300" /> 
                            {t.district}
                          </div>
                        </td>
                        <td className="px-6 py-5 sm:py-6 text-center">
                          <span className="font-bold text-slate-900 text-sm tracking-tight">{t.projectCount || 0} Projects</span>
                        </td>
                        <td className="px-6 sm:px-10 py-5 sm:py-6 text-right">
                          <Button asChild variant="ghost" size="sm" className="h-9 sm:h-10 rounded-full px-4 sm:px-6 font-bold text-[9px] sm:text-[10px] uppercase gap-2 hover:bg-primary hover:text-white transition-all">
                            <Link href={`/shoot-network/${t.id}`}>Open Brief <ArrowRight className="h-3.5 w-3.5" /></Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="py-24 sm:py-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] sm:rounded-[4rem] bg-white/30 text-center space-y-6 sm:space-y-8 px-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-slate-200" />
            </div>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-bold text-slate-400 uppercase tracking-widest">No Intelligence Matching Criteria</p>
              <p className="text-xs sm:text-sm text-slate-300 italic tracking-normal max-w-xs mx-auto">Adjust your strategic filters or initiate a new professional onboarding process.</p>
              <Button onClick={() => setFilters({ category: [], district: "All", gender: "All", paymentStage: "All", tags: [] })} variant="link" className="mt-4 text-primary font-bold text-xs uppercase tracking-widest p-0">Reset global filters</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
