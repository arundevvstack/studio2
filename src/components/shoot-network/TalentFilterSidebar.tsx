
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter, MapPin, Grid, User, CreditCard, Tag } from "lucide-react";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

const CATEGORIES = [
  "Models", "Make-up Artist", "Stylist", "Costume Partner", "DOP",
  "Editor", "Drone Operator", "Set Designer", "Photographer", "Influencer"
];

const PROJECT_TAGS = [
  "Commercial", "Film", "Music Video", "Fashion", "Editorial", "Wedding", "Social Media", "Corporate"
];

export function TalentFilterSidebar({ filters, setFilters, totalCount }: any) {
  const toggleCategory = (cat: string) => {
    setFilters((prev: any) => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter((c: string) => c !== cat)
        : [...prev.category, cat]
    }));
  };

  const toggleTag = (tag: string) => {
    setFilters((prev: any) => ({
      ...prev,
      tags: (prev.tags || []).includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-white h-full sticky top-8">
      <CardHeader className="px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold font-headline tracking-normal flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" /> Refine Search
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{totalCount} Results</span>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8 space-y-10">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
            <MapPin className="h-3 w-3" /> District Hub
          </Label>
          <Select 
            value={filters.district} 
            onValueChange={(val) => setFilters({...filters, district: val})}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner tracking-normal font-bold">
              <SelectValue placeholder="All Kerala" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="All">All Kerala</SelectItem>
              {KERALA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
            <Grid className="h-3 w-3" /> Creative Verticals
          </Label>
          <div className="grid grid-cols-1 gap-2.5">
            {CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center gap-3">
                <Checkbox 
                  id={`cat-${cat}`} 
                  checked={filters.category.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                  className="rounded-md border-slate-200" 
                />
                <label htmlFor={`cat-${cat}`} className="text-xs font-bold text-slate-600 cursor-pointer">{cat}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
            <Tag className="h-3 w-3" /> Project Verticals
          </Label>
          <div className="grid grid-cols-1 gap-2.5">
            {PROJECT_TAGS.map(tag => (
              <div key={tag} className="flex items-center gap-3">
                <Checkbox 
                  id={`tag-${tag}`} 
                  checked={(filters.tags || []).includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                  className="rounded-md border-slate-200" 
                />
                <label htmlFor={`tag-${tag}`} className="text-xs font-bold text-slate-600 cursor-pointer">{tag}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
            <User className="h-3 w-3" /> Gender
          </Label>
          <Select 
            value={filters.gender} 
            onValueChange={(val) => setFilters({...filters, gender: val})}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner tracking-normal font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="All">Any Gender</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
            <CreditCard className="h-3 w-3" /> Payment Status
          </Label>
          <Select 
            value={filters.paymentStage} 
            onValueChange={(val) => setFilters({...filters, paymentStage: val})}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner tracking-normal font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="All">All Tiers</SelectItem>
              <SelectItem value="Yes">Verified (Paid)</SelectItem>
              <SelectItem value="No">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
