"use client";

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { TalentCard } from "@/components/talent-library/TalentCard";
import { TalentForm } from "@/components/talent-library/TalentForm";
import { TalentFilters } from "@/components/talent-library/TalentFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Loader2, 
  Mic2, 
  Plus, 
  Sparkles,
  X,
  LayoutGrid,
  ChevronDown
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const FOLLOWER_RANGES = [
  { label: "1K – 10K", min: 1000, max: 10000 },
  { label: "10K – 50K", min: 10000, max: 50000 },
  { label: "50K – 100K", min: 50000, max: 100000 },
  { label: "100K+", min: 100000, max: 100000000 },
];

export default function TalentLibraryPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isAdding, setIsAdding] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState<any>({
    category: [],
    type: null,
    reachCategory: null,
    minFollowers: 0,
    maxCost: 100000,
    location: "",
    collabType: null,
    verifiedOnly: false,
    freeCollabOnly: false
  });

  const talentsQuery = useMemoFirebase(() => {
    return query(collection(db, "talents"), orderBy("created_at", "desc"));
  }, [db]);

  const { data: talents, isLoading } = useCollection(talentsQuery);

  const clearFilters = () => {
    setFilters({
      category: [],
      type: null,
      reachCategory: null,
      minFollowers: 0,
      maxCost: 100000,
      location: "",
      collabType: null,
      verifiedOnly: false,
      freeCollabOnly: false
    });
  };

  const filteredTalents = useMemo(() => {
    if (!talents) return [];
    
    return talents.filter((t: any) => {
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.instagram_username?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const talentCats = Array.isArray(t.category) ? t.category : [t.category].filter(Boolean);
      const matchesCategory = filters.category.length === 0 || filters.category.some((c: string) => talentCats.includes(c));
      
      const matchesType = !filters.type || t.type === filters.type;
      const matchesReach = !filters.reachCategory || t.reachCategory === filters.reachCategory;
      const matchesFollowers = (t.followers || 0) >= filters.minFollowers;
      const matchesLocation = !filters.location || t.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesBudget = (t.estimated_cost || 0) <= filters.maxCost;
      const matchesVerified = !filters.verifiedOnly || t.verified;
      const matchesCollab = !filters.freeCollabOnly || t.ready_to_collab;
      const matchesCollabType = !filters.collabType || t.collabType === filters.collabType;

      return matchesSearch && matchesCategory && matchesType && matchesReach && 
             matchesFollowers && matchesLocation && matchesBudget && 
             matchesVerified && matchesCollab && matchesCollabType;
    });
  }, [talents, searchQuery, filters]);

  // Sorting logic
  const sortedTalents = useMemo(() => {
    const list = [...filteredTalents];
    switch (sortBy) {
      case "followers": return list.sort((a, b) => (b.followers || 0) - (a.followers || 0));
      case "engagement": return list.sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0));
      case "cost": return list.sort((a, b) => (a.estimated_cost || 0) - (b.estimated_cost || 0));
      case "recent": return list.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      default: return list;
    }
  }, [filteredTalents, sortBy]);

  const activeFilterCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : (v !== null && v !== "" && v !== false && v !== 0 && v !== 100000)
  ).length;

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
              <Mic2 className="h-5 w-5 sm:h-7 sm:w-7 text-white fill-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-headline tracking-tight text-slate-900 leading-tight">Talent Marketplace</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal mt-2 sm:mt-3 px-1">Discover and deploy verified creative personnel for your production verticals.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 gap-3 tracking-widest transition-all active:scale-95 text-[10px] sm:text-xs uppercase">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Onboard Talent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[750px] rounded-[2.5rem] sm:rounded-[3.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 sm:p-10 pb-0"><DialogTitle className="text-xl sm:text-3xl font-bold font-headline tracking-tight">Onboard Influencer</DialogTitle></DialogHeader>
            <TalentForm onSuccess={() => setIsAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3">
          <TalentFilters filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search talent..." 
                className="pl-12 sm:pl-16 h-12 sm:h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-sm sm:text-base font-bold tracking-normal" 
              />
            </div>
            <div className="flex items-center bg-white p-1 rounded-full shadow-sm border border-slate-100 shrink-0 w-full md:w-auto overflow-hidden">
              {/* Mobile Filter Trigger */}
              <div className="lg:hidden flex-1 md:flex-none border-r border-slate-50 pr-1">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="w-full h-10 sm:h-11 rounded-full text-slate-500 font-bold text-[10px] uppercase tracking-widest gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      Refine {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-none sm:max-w-xs">
                    <SheetHeader className="p-6 pb-0">
                      <SheetTitle className="text-xl font-bold font-headline">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="h-full overflow-y-auto pt-4">
                      <TalentFilters filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 md:flex-none h-10 sm:h-11 md:w-[180px] rounded-full bg-transparent border-none font-bold text-[9px] sm:text-[10px] uppercase tracking-widest px-4 sm:px-6 shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  <SelectItem value="recent" className="text-[10px] font-bold uppercase tracking-widest">Recently Added</SelectItem>
                  <SelectItem value="followers" className="text-[10px] font-bold uppercase tracking-widest">Most Followers</SelectItem>
                  <SelectItem value="engagement" className="text-[10px] font-bold uppercase tracking-widest">Engagement %</SelectItem>
                  <SelectItem value="cost" className="text-[10px] font-bold uppercase tracking-widest">Lowest Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-24 sm:py-40 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Marketplace intelligence...</p>
            </div>
          ) : sortedTalents.length > 0 ? (
            <div className="grid gap-6 sm:gap-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {sortedTalents.map((talent: any) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="py-24 sm:py-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] sm:rounded-[4rem] bg-white/30 flex flex-col items-center justify-center text-center space-y-6 px-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
                <Mic2 className="h-8 w-8 sm:h-10 sm:w-10 text-slate-200" />
              </div>
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-bold text-slate-400 uppercase tracking-widest">No Intelligence Records Found</p>
                <p className="text-xs sm:text-sm text-slate-300 italic tracking-normal max-w-xs mx-auto">Adjust your strategic filters or onboard a new personnel asset.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
