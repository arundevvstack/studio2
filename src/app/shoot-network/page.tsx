
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
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
import Link from "next/link";

/**
 * @fileOverview Shoot Network Repository.
 * Displays creative professionals in a high-density grid.
 * Decoupled from user session for Testing Mode stability.
 */

export default function ShootNetworkPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<any>({
    category: [],
    district: "All",
    gender: "All",
    paymentStage: "All",
    tags: []
  });

  // Decoupled query: Always fetch data in testing mode regardless of user state
  const talentQuery = useMemoFirebase(() => {
    return query(
      collection(db, "shoot_network"), 
      where("isArchived", "==", false),
      orderBy("updatedAt", "desc")
    );
  }, [db]);

  const { data: talent, isLoading } = useCollection(talentQuery);

  const filteredTalent = useMemo(() => {
    if (!talent) return [];
    return talent.filter((t: any) => {
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category.length === 0 || filters.category.includes(t.category);
      const matchesDistrict = filters.district === "All" || t.district === filters.district;
      const matchesGender = filters.gender === "All" || t.gender === filters.gender;
      const matchesPayment = filters.paymentStage === "All" || t.paymentStage === filters.paymentStage;
      const matchesTags = filters.tags.length === 0 || 
                         (t.suitableProjectTypes && filters.tags.every((tag: string) => t.suitableProjectTypes.includes(tag)));

      return matchesSearch && matchesCategory && matchesDistrict && matchesGender && matchesPayment && matchesTags;
    });
  }, [talent, searchQuery, filters]);

  const removeFilter = (key: string, value?: string) => {
    if (key === 'district') setFilters({ ...filters, district: 'All' });
    if (key === 'gender') setFilters({ ...filters, gender: 'All' });
    if (key === 'paymentStage') setFilters({ ...filters, paymentStage: 'All' });
    if (key === 'category' && value) setFilters({ ...filters, category: filters.category.filter((c: string) => c !== value) });
    if (key === 'tags' && value) setFilters({ ...filters, tags: filters.tags.filter((t: string) => t !== value) });
  };

  const hasActiveFilters = filters.category.length > 0 || 
                          filters.district !== "All" || 
                          filters.gender !== "All" || 
                          filters.paymentStage !== "All" ||
                          filters.tags.length > 0;

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-500">
      <aside className="w-80 shrink-0 hidden lg:block">
        <TalentFilterSidebar filters={filters} setFilters={setFilters} totalCount={filteredTalent.length} />
      </aside>

      <main className="flex-1 space-y-8 overflow-auto pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">Shoot Network Repository</h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                <Database className="h-3 w-3 mr-1" /> Verified Database
              </Badge>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-normal">Manage and deploy verified creative professionals across Kerala.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <BulkImportButton />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
                  <Plus className="h-4 w-4" /> Add Talent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-0">
                  <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Add Creative Professional</DialogTitle>
                </DialogHeader>
                <TalentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400 tracking-normal font-bold" 
                placeholder="Search by name, skill, or vertical..." 
              />
            </div>
            <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className={`h-11 w-11 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><LayoutGrid className="h-5 w-5" /></Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className={`h-11 w-11 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><List className="h-5 w-5" /></Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 animate-in fade-in duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-2 ml-1">Active Filters:</span>
              {filters.district !== "All" && (
                <Badge className="bg-white text-slate-600 border border-slate-100 font-bold text-[10px] rounded-lg pl-3 pr-1 py-1 gap-1">
                  {filters.district}
                  <Button variant="ghost" size="icon" onClick={() => removeFilter('district')} className="h-4 w-4 p-0"><X className="h-2 w-2" /></Button>
                </Badge>
              )}
              {filters.category.map((cat: string) => (
                <Badge key={cat} className="bg-white text-primary border border-primary/10 font-bold text-[10px] rounded-lg pl-3 pr-1 py-1 gap-1">
                  {cat}
                  <Button variant="ghost" size="icon" onClick={() => removeFilter('category', cat)} className="h-4 w-4 p-0"><X className="h-2 w-2" /></Button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => setFilters({ category: [], district: "All", gender: "All", paymentStage: "All", tags: [] })} className="text-[10px] font-bold text-primary uppercase hover:bg-primary/5 h-7 px-3 rounded-lg">Clear All</Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Syncing Talent Grid...</p>
          </div>
        ) : filteredTalent.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTalent.map((t: any) => <TalentCard key={t.id} talent={t} />)}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400">Professional Identity</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 text-center">Category</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400">Hub</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 text-center">Experience</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTalent.map((t: any) => (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-xl shrink-0">
                            <AvatarImage src={t.thumbnail || `https://picsum.photos/seed/${t.id}/100/100`} />
                            <AvatarFallback>{t.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-slate-900 tracking-normal">{t.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center"><Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase px-3">{t.category}</Badge></td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600"><MapPin className="h-3.5 w-3.5 inline mr-1 text-slate-300" /> {t.district}</td>
                      <td className="px-6 py-5 text-center font-bold text-slate-900 text-sm">{t.projectCount || 0} Projects</td>
                      <td className="px-8 py-5 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-primary hover:text-white">
                          <Link href={`/shoot-network/${t.id}`}>Profile <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 text-center space-y-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No talent matching these criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
