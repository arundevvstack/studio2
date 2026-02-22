
"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Loader2, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
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

export default function ShootNetworkPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Total Partners</p>
              <h3 className="text-2xl font-bold font-headline tracking-normal">{talent?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Verified Elite</p>
              <h3 className="text-2xl font-bold font-headline tracking-normal">
                {talent?.filter((t: any) => t.paymentStage === 'Yes').length || 0}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Grid className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Active Sectors</p>
              <h3 className="text-2xl font-bold font-headline tracking-normal">
                {new Set(talent?.map((t: any) => t.category)).size}
              </h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400 tracking-normal" 
            placeholder="Search by name, skill, or creative category..." 
          />
        </div>

        {/* Grid Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-normal">Syncing Talent Grid...</p>
          </div>
        ) : filteredTalent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTalent.map((t: any) => (
              <TalentCard key={t.id} talent={t} />
            ))}
          </div>
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
