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
import { Filter, Search, MapPin } from "lucide-react";

interface TalentFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

const CATEGORIES = ["Tech", "Lifestyle", "Fashion", "Beauty", "Travel", "Food", "Fitness", "Education", "Entertainment", "Gaming", "Business"];

export function TalentFilters({ filters, setFilters, clearFilters }: TalentFiltersProps) {
  const toggleCategory = (cat: string) => {
    const current = filters.category || [];
    const updated = current.includes(cat)
      ? current.filter((c: string) => c !== cat)
      : [...current, cat];
    setFilters({ ...filters, category: updated });
  };

  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-white h-full overflow-hidden">
      <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Registry Filters
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase">Reset</Button>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Niche Market</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = (filters.category || []).includes(cat);
              return (
                <Badge
                  key={cat}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                    isSelected ? "bg-primary text-white border-none" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers (Min)</Label>
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

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Budget</Label>
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

        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="h-3 w-3" /> Location Hub
          </Label>
          <Input 
            value={filters.location} 
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="e.g. Kerala" 
            className="h-12 rounded-xl bg-slate-50 border-none shadow-inner text-xs font-bold"
          />
        </div>

        <div className="pt-4 space-y-4 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="verified">Verified Identity</Label>
            <Switch 
              id="verified" 
              checked={!!filters.verifiedOnly} 
              onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="free-collab">Ready to Collab</Label>
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