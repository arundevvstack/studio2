
"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Loader2, 
  Users, 
  CheckCircle2, 
  Database,
  Grid,
  LayoutGrid,
  List,
  MapPin,
  Briefcase,
  Star,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
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
 * Enhanced with Grid and List view modes for high-density intelligence management.
 */

export default function ShootNetworkPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<any>({
    category: [],
    district: "All",
    gender: "All",
    paymentStage: "All",
  });

  const talentQuery = useMemoFirebase(() => {
    if (!user) return null;
    let q = query(collection(db, "shoot_network"), where("isArchived", "==", false));
    return q;
  }, [db, user]);

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

      return matchesSearch && matchesCategory && matchesDistrict && matchesGender && matchesPayment;
    });
  }, [talent, searchQuery, filters]);

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-500">
      {/* Sidebar Filter */}
      <aside className="w-80 shrink-0 hidden lg:block">
        <TalentFilterSidebar 
          filters={filters} 
          setFilters={setFilters} 
          totalCount={filteredTalent.length} 
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8 overflow-auto pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">
                Shoot Network Repository
              </h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                <Database className="h-3 w-3 mr-1" />
                Verified Database
              </Badge>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-normal">
              Manage, discover, and deploy verified creative professionals across Kerala.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <BulkImportButton />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-12 flex-1 md:flex-none px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
                  <Plus className="h-4 w-4" />
                  Add Talent
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

        {/* Action Bar: Search + View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400 tracking-normal" 
              placeholder="Search by name, skill, or creative category..." 
            />
          </div>
          <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={`h-11 w-11 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={`h-11 w-11 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Grid Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Syncing Talent Grid...</p>
          </div>
        ) : filteredTalent.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTalent.map((t: any) => (
                <TalentCard key={t.id} talent={t} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal">Professional Identity</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal text-center">Category</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal">Hub</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal text-center">Experience</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal text-center">Rank</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTalent.map((t: any) => (
                      <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm rounded-xl shrink-0">
                              <AvatarImage src={t.thumbnail || `https://picsum.photos/seed/${t.id}/100/100`} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{t.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 tracking-normal leading-none">{t.name}</p>
                                {t.paymentStage === 'Yes' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-normal">{t.gender}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase px-3 tracking-normal">
                            {t.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-slate-300" />
                            <span className="text-xs font-bold tracking-normal">{t.district}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-slate-900 tracking-normal">{t.projectCount || 0}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-normal">Projects</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < (t.rank || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-100'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-primary hover:text-white transition-all">
                            <Link href={`/shoot-network/${t.id}`}>
                              Profile
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
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
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 text-center space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center">
              <Users className="h-8 w-8 text-slate-200" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No talent matching these criteria</p>
              <Button variant="link" onClick={() => setFilters({ category: [], district: "All", gender: "All", paymentStage: "All" })} className="text-primary font-bold text-xs tracking-normal p-0">Clear all filters</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
