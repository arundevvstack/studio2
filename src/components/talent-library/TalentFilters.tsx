
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Filter, X, Search } from "lucide-react";

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
const REACH_CATEGORIES = ["Nano", "Micro", "Mid", "Macro", "Mega"];
const COLLAB_TYPES = ["Paid", "Barter", "Free", "Agency Managed"];

export function TalentFilters({ filters, setFilters, clearFilters }: TalentFiltersProps) {
  const toggleCategory = (cat: string) => {
    const current = filters.category || [];
    const updated = current.includes(cat)
      ? current.filter((c: string) => c !== cat)
      : [...current, cat];
    setFilters({ ...filters, category: updated });
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white h-full overflow-hidden sticky top-8">
      <CardHeader className="px-6 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Advanced Filters
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="text-xs font-bold text-slate-400 hover:text-primary uppercase"
        >
          Reset
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {/* Type Filter */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Talent Type</Label>
          <Select 
            value={filters.type || "all"} 
            onValueChange={(val) => setFilters({ ...filters, type: val === "all" ? null : val })}
          >
            <SelectTrigger className="rounded-xl border-slate-100 font-medium">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              {TALENT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories Multi-select */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categories</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = (filters.category || []).includes(cat);
              return (
                <Badge
                  key={cat}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    isSelected ? "bg-primary text-white" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Reach Category */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reach Category</Label>
          <Select 
            value={filters.reachCategory || "all"} 
            onValueChange={(val) => setFilters({ ...filters, reachCategory: val === "all" ? null : val })}
          >
            <SelectTrigger className="rounded-xl border-slate-100 font-medium">
              <SelectValue placeholder="All Reach" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Reach</SelectItem>
              {REACH_CATEGORIES.map(reach => (
                <SelectItem key={reach} value={reach}>{reach}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Follower Range */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers (Min)</Label>
            <span className="text-xs font-bold text-slate-900">{(filters.minFollowers || 0) / 1000}K+</span>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Est. Cost (INR)</Label>
            <span className="text-xs font-bold text-slate-900">₹{(filters.maxCost || 100000).toLocaleString()}</span>
          </div>
          <Slider 
            value={[filters.maxCost || 100000]} 
            onValueChange={(val) => setFilters({ ...filters, maxCost: val[0] })}
            max={500000} 
            step={5000} 
            className="[&_.bg-primary]:bg-primary"
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Filter by city..." 
              value={filters.location || ""}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="pl-9 rounded-xl border-slate-100 text-sm font-medium"
            />
          </div>
        </div>

        {/* Collaboration Type */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collaboration Type</Label>
          <Select 
            value={filters.collabType || "all"} 
            onValueChange={(val) => setFilters({ ...filters, collabType: val === "all" ? null : val })}
          >
            <SelectTrigger className="rounded-xl border-slate-100 font-medium">
              <SelectValue placeholder="All Collabs" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Collabs</SelectItem>
              {COLLAB_TYPES.map(collab => (
                <SelectItem key={collab} value={collab}>{collab}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="pt-4 space-y-4 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="verified">Verified Only</Label>
            <Switch 
              id="verified" 
              checked={!!filters.verifiedOnly} 
              onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="free-collab">Free Collaboration</Label>
            <Switch 
              id="free-collab" 
              checked={!!filters.freeCollabOnly} 
              onCheckedChange={(checked) => setFilters({ ...filters, freeCollabOnly: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
