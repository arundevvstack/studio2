"use client";

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import { TalentCard } from "@/components/talent-library/TalentCard";
import { TalentForm } from "@/components/talent-library/TalentForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Loader2, 
  Mic2, 
  Plus, 
  Sparkles,
  X,
  Zap,
  LayoutGrid,
  CheckCircle2,
  Award
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const CATEGORIES = [
  "Tech", "Lifestyle", "Fashion", "Beauty", "Travel", "Food", 
  "Fitness", "Education", "Entertainment", "Gaming", "Business"
];

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
  const [filters, setFilters] = useState({
    category: "All",
    followerRange: "All",
    location: "",
    budget: 500000,
    verifiedOnly: false,
    collabOnly: false
  });

  const talentsQuery = useMemoFirebase(() => {
    return query(collection(db, "talents"), orderBy("created_at", "desc"));
  }, [db]);

  const { data: talents, isLoading } = useCollection(talentsQuery);

  const filteredTalents = useMemo(() => {
    if (!talents) return [];
    
    return talents.filter((t: any) => {
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.instagram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === "All" || t.category === filters.category;
      
      const range = FOLLOWER_RANGES.find(r => r.label === filters.followerRange);
      const matchesFollowers = !range || (t.followers >= range.min && t.followers <= range.max);
      
      const matchesLocation = !filters.location || t.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesBudget = (t.estimated_cost || 0) <= filters.budget;
      const matchesVerified = !filters.verifiedOnly || t.verified;
      const matchesCollab = !filters.collabOnly || t.ready_to_collab;

      return matchesSearch && matchesCategory && matchesFollowers && 
             matchesLocation && matchesBudget && matchesVerified && matchesCollab;
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

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
              <Mic2 className="h-7 w-7 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900 leading-none">Talent Marketplace</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal mt-3 px-1">Discover and deploy verified creative personnel for your production verticals.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="h-14 px-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 gap-3 tracking-widest transition-all active:scale-95 text-xs uppercase">
              <Plus className="h-5 w-5" /> Onboard Talent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[750px] rounded-[3.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-10 pb-0"><DialogTitle className="text-3xl font-bold font-headline tracking-tight">Onboard Influencer</DialogTitle></DialogHeader>
            <TalentForm onSuccess={() => setIsAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-headline tracking-tight flex items-center gap-3">
                <Filter className="h-5 w-5 text-primary" /> Refine Registry
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setFilters({ category: "All", followerRange: "All", location: "", budget: 500000, verifiedOnly: false, collabOnly: false })} className="text-[10px] font-bold text-slate-400 uppercase hover:text-primary">Reset</Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vertical Category</Label>
                <Select value={filters.category} onValueChange={val => setFilters({ ...filters, category: val })}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                    <SelectItem value="All">All Verticals</SelectItem>
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follower Tier</Label>
                <Select value={filters.followerRange} onValueChange={val => setFilters({ ...filters, followerRange: val })}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                    <SelectItem value="All">Any Reach</SelectItem>
                    {FOLLOWER_RANGES.map(r => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hub (Location)</Label>
                <Input 
                  value={filters.location} 
                  onChange={e => setFilters({ ...filters, location: e.target.value })}
                  placeholder="Filter by city..."
                  className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="vOnly">Verified Hub Only</Label>
                  <Switch id="vOnly" checked={filters.verifiedOnly} onCheckedChange={val => setFilters({ ...filters, verifiedOnly: val })} className="data-[state=checked]:bg-blue-500" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="cOnly">Collab Readiness</Label>
                  <Switch id="cOnly" checked={filters.collabOnly} onCheckedChange={val => setFilters({ ...filters, collabOnly: val })} className="data-[state=checked]:bg-green-500" />
                </div>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-primary/10 rounded-[3rem] bg-slate-900 text-white p-10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 space-y-4">
              <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-widest">System Intel</Badge>
              <h4 className="text-xl font-bold font-headline tracking-tight">Curation Engine</h4>
              <p className="text-xs font-medium leading-relaxed text-slate-400">Total of <span className="text-primary font-bold">{sortedTalents.length}</span> personnel identified in the current deployment.</p>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Identify talent by name, @username, or strategic vertical..." 
                className="pl-16 h-16 bg-white border-none shadow-xl shadow-slate-200/30 rounded-full text-base font-bold tracking-normal" 
              />
            </div>
            <div className="flex items-center bg-white p-1.5 rounded-full shadow-sm border border-slate-100 shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 w-[180px] rounded-full bg-slate-50 border-none font-bold text-[10px] uppercase tracking-widest px-6 shadow-none">
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
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Marketplace intelligence...</p>
            </div>
          ) : sortedTalents.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {sortedTalents.map((talent: any) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="py-40 border-2 border-dashed border-slate-100 rounded-[4rem] bg-white/30 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
                <Mic2 className="h-10 w-10 text-slate-200" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">No Intelligence Records Found</p>
                <p className="text-sm text-slate-300 italic tracking-normal max-w-sm mx-auto">Adjust your strategic filters or onboard a new personnel asset.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
