"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Loader2, 
  Users,
  LayoutGrid,
  List,
  Filter,
  X,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { TalentCard } from "@/components/talent-library/TalentCard";
import { TalentFilters } from "@/components/talent-library/TalentFilters";
import { AddTalentDialog } from "@/components/talent-library/AddTalentDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * @fileOverview Talent Library Master Registry.
 * Consolidated source of truth for influencers and media personnel.
 */

export default function TalentLibraryPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [filters, setFilters] = useState<any>({
    type: null,
    category: [],
    minFollowers: 0,
    maxCost: 500000,
    location: "",
    verifiedOnly: false,
    freeCollabOnly: false,
    reachCategory: null,
    collabType: null
  });

  const talentQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "talents"), orderBy("created_at", "desc"));
  }, [db, user]);

  const { data: talents, isLoading: isDataLoading } = useCollection(talentQuery);

  const filteredTalent = useMemo(() => {
    if (!talents) return [];
    return talents.filter((t: any) => {
      const matchesSearch = 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.instagram_username?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filters.type || t.type === filters.type;
      const matchesCategory = filters.category.length === 0 || 
        (Array.isArray(t.category) ? t.category.some((c: string) => filters.category.includes(c)) : filters.category.includes(t.category));
      
      const matchesFollowers = (t.followers || 0) >= filters.minFollowers;
      const matchesCost = (t.estimated_cost || 0) <= filters.maxCost;
      const matchesLocation = !filters.location || t.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesVerified = !filters.verifiedOnly || t.verified === true;
      const matchesFree = !filters.freeCollabOnly || t.ready_to_collab === true;

      return matchesSearch && matchesType && matchesCategory && matchesFollowers && 
             matchesCost && matchesLocation && matchesVerified && matchesFree;
    });
  }, [talents, searchQuery, filters]);

  const hasActiveFilters = 
    filters.type || 
    filters.category.length > 0 || 
    filters.minFollowers > 0 || 
    filters.maxCost < 500000 || 
    filters.location || 
    filters.verifiedOnly || 
    filters.freeCollabOnly;

  const clearFilters = () => setFilters({
    type: null,
    category: [],
    minFollowers: 0,
    maxCost: 500000,
    location: "",
    verifiedOnly: false,
    freeCollabOnly: false,
    reachCategory: null,
    collabType: null
  });

  const isLoading = isUserLoading || isDataLoading;

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-500">
      <aside className="w-80 shrink-0 hidden lg:block">
        <TalentFilters filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      </aside>

      <main className="flex-1 space-y-8 overflow-auto pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight">Talent Library</h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-widest shrink-0">
                <Database className="h-3 w-3 mr-1" /> Master Registry
              </Badge>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-normal mt-3">Curated marketplace for influencers and media personnel.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <AddTalentDialog />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base tracking-normal placeholder:text-slate-400 font-bold" 
                placeholder="Search by name or @handle..." 
              />
            </div>
            <div className="flex items-center bg-white p-1 rounded-full shadow-sm border border-slate-100 shrink-0">
              <div className="lg:hidden px-2 border-r border-slate-100">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="h-11 rounded-full text-slate-500 font-bold text-[10px] uppercase tracking-widest gap-2">
                      <Filter className="h-4 w-4" />
                      Refine
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-none sm:max-w-xs">
                    <SheetHeader className="p-6 pb-0">
                      <SheetTitle className="text-xl font-bold font-headline">Registry Filters</SheetTitle>
                    </SheetHeader>
                    <TalentFilters filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
                  </SheetContent>
                </Sheet>
              </div>
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className={`h-11 w-11 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutGrid className="h-5 w-5" /></Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className={`h-11 w-11 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><List className="h-5 w-5" /></Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 p-6 bg-white/50 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Strategic Filters:</span>
              
              {filters.location && (
                <Badge className="bg-white text-slate-600 border border-slate-100 font-bold text-[9px] rounded-full px-4 py-1.5 gap-2 shadow-sm">
                  {filters.location}
                  <X className="h-3 w-3 text-slate-300 cursor-pointer" onClick={() => setFilters({...filters, location: ""})} />
                </Badge>
              )}

              {filters.category.map((cat: string) => (
                <Badge key={cat} className="bg-white text-primary border border-primary/10 font-bold text-[9px] rounded-full px-4 py-1.5 gap-2 shadow-sm">
                  {cat}
                  <X className="h-3 w-3 text-primary/30 cursor-pointer" onClick={() => setFilters({...filters, category: filters.category.filter((c: string) => c !== cat)})} />
                </Badge>
              ))}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="text-[10px] font-bold text-primary uppercase hover:bg-primary/5 h-8 px-4 rounded-full tracking-widest ml-auto"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Synchronizing Registry...</p>
          </div>
        ) : filteredTalent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredTalent.map((t: any) => <TalentCard key={t.id} talent={t} />)}
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-white/30 text-center space-y-8 px-6">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
              <Users className="h-12 w-12 text-slate-200" />
            </div>
            <div className="space-y-3">
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">No Intelligence Matching Criteria</p>
              <p className="text-sm text-slate-300 italic tracking-normal max-w-xs mx-auto">Adjust your strategic filters or initiate a new professional onboarding process.</p>
              <Button onClick={clearFilters} variant="link" className="mt-4 text-primary font-bold text-xs uppercase tracking-widest p-0">Reset global filters</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
