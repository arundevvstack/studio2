"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Filter, Search, MapPin, Users, IndianRupee, Globe } from "lucide-react";

interface TalentFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

const CATEGORIES = [
  "Tech", "Lifestyle", "Fashion", "Beauty", "Travel", "Food", 
  "Fitness", "Education", "Entertainment", "Gaming", "Business"
];

const TALENT_TYPES = ["Influencer", "Anchor", "Creator", "Model", "Virtual"];

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

export function TalentFilters({ filters, setFilters, clearFilters }: TalentFiltersProps) {
  const toggleCategory = (cat: string) => {
    const current = filters.category || [];
    const updated = current.includes(cat)
      ? current.filter((c: string) => c !== cat)
      : [...current, cat];
    setFilters({ ...filters, category: updated });
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white h-full overflow-hidden">
      <CardHeader className="px-8 py-8 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Refine Intel
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest"
        >
          Reset
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-10">
        {/* Type Filter */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Talent Vertical</Label>
          <Select 
            value={filters.type || "all"} 
            onValueChange={(val) => setFilters({ ...filters, type: val === "all" ? null : val })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-xs px-4">
              <SelectValue placeholder="All Verticals" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
              <SelectItem value="all" className="text-xs font-bold uppercase">All Verticals</SelectItem>
              {TALENT_TYPES.map(type => (
                <SelectItem key={type} value={type} className="text-xs font-bold uppercase">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories Multi-select */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Niches</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = (filters.category || []).includes(cat);
              return (
                <Badge
                  key={cat}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                    isSelected ? "bg-primary border-none text-white shadow-lg shadow-primary/20" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Follower Range */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="h-3 w-3" /> Reach Min
            </Label>
            <span className="text-[10px] font-bold text-primary">{(filters.minFollowers || 0) / 1000}K+</span>
          </div>
          <Slider 
            value={[filters.minFollowers || 0]} 
            onValueChange={(val) => setFilters({ ...filters, minFollowers: val[0] })}
            max={1000000} 
            step={10000} 
            className="[&_.bg-primary]:bg-primary"
          />
        </div>

        {/* Cost Range */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <IndianRupee className="h-3 w-3" /> Max Quote
            </Label>
            <span className="text-[10px] font-bold text-primary">₹{(filters.maxCost || 100000).toLocaleString()}</span>
          </div>
          <Slider 
            value={[filters.maxCost || 100000]} 
            onValueChange={(val) => setFilters({ ...filters, maxCost: val[0] })}
            max={500000} 
            step={5000} 
            className="[&_.bg-primary]:bg-primary"
          />
        </div>

        {/* Location Hub */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="h-3 w-3" /> Regional Hub
          </Label>
          <Select 
            value={filters.location || "all"} 
            onValueChange={(val) => setFilters({ ...filters, location: val === "all" ? "" : val })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-xs px-4">
              <SelectValue placeholder="All Kerala Districts" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl max-h-[300px]">
              <SelectItem value="all" className="text-xs font-bold uppercase">All Kerala Districts</SelectItem>
              {KERALA_DISTRICTS.map(d => (
                <SelectItem key={d} value={d} className="text-xs font-bold uppercase">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="pt-6 space-y-5 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="verified">Verified Hub</Label>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Only approved pros</p>
            </div>
            <Switch 
              id="verified" 
              checked={!!filters.verifiedOnly} 
              onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="free-collab">Collab Ready</Label>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strategic availability</p>
            </div>
            <Switch 
              id="free-collab" 
              checked={!!filters.freeCollabOnly} 
              onCheckedChange={(checked) => setFilters({ ...filters, freeCollabOnly: checked })}
              className="data-[state=checked]:bg-accent"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}