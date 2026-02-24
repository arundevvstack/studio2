
"use client";

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { TalentCard } from "@/components/talent-library/TalentCard";
import { TalentFilters } from "@/components/talent-library/TalentFilters";
import { AddTalentDialog } from "@/components/talent-library/AddTalentDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Loader2, 
  Mic2, 
  LayoutGrid, 
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Talent Library Main Registry.
 * High-fidelity personnel database with advanced strategic filtering.
 */

export default function TalentLibraryPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: [],
    type: null,
    reachCategory: null,
    minFollowers: 0,
    maxCost: 500000,
    location: "",
    collabType: null,
    verifiedOnly: false,
    freeCollabOnly: false,
  });

  const talentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "talents"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: talents, isLoading } = useCollection(talentsQuery);

  const filteredTalents = useMemo(() => {
    if (!talents) return [];
    
    let result = talents.filter((t: any) => {
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          t.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.platforms?.instagram?.url?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filters.type || t.type === filters.type;
      const matchesReach = !filters.reachCategory || t.reachCategory === filters.reachCategory;
      const matchesCollab = !filters.collabType || t.collabType === filters.collabType;
      const matchesVerified = !filters.verifiedOnly || t.verified;
      const matchesFree = !filters.freeCollabOnly || t.availableForFreeCollab;
      const matchesLocation = !filters.location || t.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      const totalFollowers = Math.max(
        t.platforms?.instagram?.followers || 0,
        t.platforms?.youtube?.subscribers || 0
      );
      const matchesFollowers = totalFollowers >= filters.minFollowers;
      const matchesCost = (t.estimatedCost || 0) <= filters.maxCost;
      
      const matchesCategory = filters.category.length === 0 || 
                             filters.category.some((cat: string) => t.category?.includes(cat));

      return matchesSearch && matchesType && matchesReach && matchesCollab && 
             matchesVerified && matchesFree && matchesLocation && 
             matchesFollowers && matchesCost && matchesCategory;
    });

    // Strategic Sorting
    switch (sortBy) {
      case "followers":
        result.sort((a, b) => {
          const fa = Math.max(a.platforms?.instagram?.followers || 0, a.platforms?.youtube?.subscribers || 0);
          const fb = Math.max(b.platforms?.instagram?.followers || 0, b.platforms?.youtube?.subscribers || 0);
          return fb - fa;
        });
        break;
      case "engagement":
        result.sort((a, b) => (b.platforms?.instagram?.engagementRate || 0) - (a.platforms?.instagram?.engagementRate || 0));
        break;
      case "cost":
        result.sort((a, b) => (a.estimatedCost || 0) - (b.estimatedCost || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "recent":
      default:
        break;
    }

    return result;
  }, [talents, searchQuery, filters, sortBy]);

  const clearFilters = () => setFilters({
    category: [],
    type: null,
    reachCategory: null,
    minFollowers: 0,
    maxCost: 500000,
    location: "",
    collabType: null,
    verifiedOnly: false,
    freeCollabOnly: false,
  });

  return (
    <div className="flex min-h-screen gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      <aside className={`w-80 shrink-0 hidden lg:block`}>
        <TalentFilters 
          filters={filters} 
          setFilters={setFilters} 
          clearFilters={clearFilters} 
        />
      </aside>

      <main className="flex-1 space-y-8 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight flex items-center gap-3 leading-none">
              <Mic2 className="h-8 w-8 text-primary" />
              Talent Library
            </h1>
            <p className="text-slate-500 font-medium tracking-normal mt-2">Centralized database of creators, anchors, and media personnel.</p>
          </div>
          <AddTalentDialog />
        </div>

        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by identity, handle or platform..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 bg-slate-50 border-none shadow-inner rounded-2xl text-base font-bold tracking-normal"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-14 w-full md:w-[200px] rounded-2xl border-slate-100 font-bold text-slate-600 tracking-widest text-xs uppercase">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="engagement">Highest Engagement</SelectItem>
                <SelectItem value="cost">Lowest Cost</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={`h-14 px-6 rounded-2xl lg:hidden ${showFilters ? 'bg-slate-100' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Strategic Filters Summary */}
        {(filters.category.length > 0 || filters.type) && (
          <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
            {filters.type && (
              <Badge key="type-badge" className="bg-primary text-white border-none px-4 py-1.5 rounded-xl uppercase text-[10px] font-bold tracking-widest">
                Type: {filters.type}
              </Badge>
            )}
            {filters.category.map((cat: string) => (
              <Badge key={`cat-${cat}`} className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-xl uppercase text-[10px] font-bold tracking-widest">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Talent Intelligence...</p>
          </div>
        ) : filteredTalents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredTalents.map((talent: any) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
              <Search className="h-10 w-10 text-slate-200" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">No Talent Identified</h3>
              <p className="text-slate-500 font-medium tracking-normal">Adjust your strategic filters or add a new record to the library.</p>
            </div>
            <Button onClick={clearFilters} variant="link" className="font-bold text-primary tracking-widest uppercase text-xs">Clear all filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
