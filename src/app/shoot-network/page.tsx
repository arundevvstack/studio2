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
  Filter
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

/**
 * @fileOverview Shoot Network Registry.
 * High-density repository [4 items in line] optimized for creative personnel deployment.
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
      const matchesTags = !filters.tags || filters.tags.length === 0 || 
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
    <div className="flex h-full gap-8 animate-in fade-in duration-500">
      <aside className="w-80 shrink-0 hidden lg:block">
        <TalentFilterSidebar filters={filters} setFilters={setFilters} totalCount={filteredTalent.length} />
      </aside>

      <main className="flex-1 space-y-8 overflow-auto pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">Shoot Network Registry</h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                <Database className="h-3 w-3 mr-1" /> Repository Live
              </Badge>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-normal mt-2">Manage and deploy verified creative professionals across Kerala districts.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <BulkImportButton />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-14 flex-1 md:flex-none px-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 gap-2 tracking-widest transition-all active:scale-95">
                  <Plus className="h-5 w-5" /> Add Talent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[750px] rounded-[3.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-10 pb-0">
                  <DialogTitle className="text-3xl font-bold font-headline tracking-tight">Onboard Creative Professional</DialogTitle>
                </DialogHeader>
                <TalentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base tracking-normal placeholder:text-slate-400 font-bold" 
                placeholder="Identify talent by name, vertical, or specific expertise..." 
              />
            </div>
            <div className="flex items-center bg-white p-1.5 rounded-full shadow-sm border border-slate-100 shrink-0">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className={`h-11 w-11 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><LayoutGrid className="h-5 w-5" /></Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className={`h-11 w-11 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><List className="h-5 w-5" /></Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 p-6 bg-white/50 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Active Strategic Filters:</span>
              
              {filters.district !== "All" && (
                <Badge className="bg-white text-slate-600 border border-slate-100 font-bold text-[10px] rounded-full px-4 py-1.5 gap-2 shadow-sm">
                  {filters.district}
                  <Button variant="ghost" size="icon" onClick={() => removeFilter('district')} className="h-4 w-4 p-0 hover:bg-transparent">
                    <X className="h-3 w-3 text-slate-300" />
                  </Button>
                </Badge>
              )}

              {filters.category.map((cat: string) => (
                <Badge key={cat} className="bg-white text-primary border border-primary/10 font-bold text-[10px] rounded-full px-4 py-1.5 gap-2 shadow-sm">
                  {cat}
                  <Button variant="ghost" size="icon" onClick={() => removeFilter('category', cat)} className="h-4 w-4 p-0 hover:bg-transparent">
                    <X className="h-3 w-3 text-primary/30" />
                  </Button>
                </Badge>
              ))}

              {filters.tags?.map((tag: string) => (
                <Badge key={tag} className="bg-white text-accent border border-accent/10 font-bold text-[10px] rounded-full px-4 py-1.5 gap-2 shadow-sm">
                  {tag}
                  <Button variant="ghost" size="icon" onClick={() => removeFilter('tags', tag)} className="h-4 w-4 p-0 hover:bg-transparent">
                    <X className="h-3 w-3 text-accent/30" />
                  </Button>
                </Badge>
              ))}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({ category: [], district: "All", gender: "All", paymentStage: "All", tags: [] })} 
                className="text-[10px] font-bold text-primary uppercase hover:bg-primary/5 h-8 px-4 rounded-full tracking-widest ml-auto"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Creative Database...</p>
          </div>
        ) : talent && filteredTalent.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredTalent.map((t: any) => <TalentCard key={t.id} talent={t} />)}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional Identity</th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Creative Tier</th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hub</th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Exp.</th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTalent.map((t: any) => (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <Avatar className="h-14 w-14 rounded-2xl border-4 border-slate-50 shadow-md shrink-0">
                            <AvatarImage src={t.thumbnail || `https://picsum.photos/seed/${t.id}/100/100`} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">{t.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight text-lg">{t.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <Badge className={`border-none font-bold text-[9px] uppercase px-4 py-1 rounded-full tracking-widest ${t.paymentStage === 'Yes' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {t.paymentStage === 'Yes' ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-300" /> 
                          {t.district}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="font-bold text-slate-900 text-sm tracking-tight">{t.projectCount || 0}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-10 rounded-full px-6 font-bold text-[10px] uppercase gap-2 hover:bg-primary hover:text-white transition-all">
                          <Link href={`/shoot-network/${t.id}`}>Full Brief <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-white/30 text-center space-y-8">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
              <Plus className="h-12 w-12 text-slate-200" />
            </div>
            <div className="space-y-3">
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">No Professionals Identified</p>
              <p className="text-xs text-slate-300 italic tracking-normal max-w-sm mx-auto">Adjust your filters or initiate a new talent onboarding process.</p>
              <Button onClick={() => setFilters({ category: [], district: "All", gender: "All", paymentStage: "All", tags: [] })} variant="link" className="mt-4 text-primary font-bold text-xs uppercase tracking-widest p-0">Clear all strategic filters</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}