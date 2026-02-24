"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFirestore } from "@/firebase";
import { doc, collection, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, Instagram, User, IndianRupee, Globe, Sparkles, X, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "Tech", "Lifestyle", "Fashion", "Beauty", "Travel", "Food", 
  "Fitness", "Education", "Entertainment", "Gaming", "Business",
  "Parenting", "Art", "Music", "Photography", "Automobile"
];

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

interface TalentFormProps {
  existingTalent?: any;
  onSuccess: () => void;
}

export function TalentForm({ existingTalent, onSuccess }: TalentFormProps) {
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    instagram_url: "",
    followers: "",
    location: "",
    estimated_cost: "",
    engagement_rate: "",
    ready_to_collab: false,
    profile_picture: ""
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (existingTalent) {
      setFormData({
        name: existingTalent.name || "",
        instagram_url: existingTalent.instagram_url || "",
        followers: existingTalent.followers?.toString() || "",
        location: existingTalent.location || "",
        estimated_cost: existingTalent.estimated_cost?.toString() || "",
        engagement_rate: existingTalent.engagement_rate?.toString() || "",
        ready_to_collab: existingTalent.ready_to_collab || false,
        profile_picture: existingTalent.profile_picture || ""
      });
      setSelectedCategories(Array.isArray(existingTalent.category) ? existingTalent.category : [existingTalent.category].filter(Boolean));
    }
  }, [existingTalent]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      if (selectedCategories.length >= 3) {
        toast({ 
          variant: "destructive", 
          title: "Selection Limit", 
          description: "A maximum of 3 strategic verticals can be assigned per talent." 
        });
        return;
      }
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const extractUsername = (url: string) => {
    try {
      const parts = url.replace(/\/$/, "").split("/");
      return parts[parts.length - 1];
    } catch (e) {
      return "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app we'd use Firebase Storage, here we use FileReader for immediate UI feedback in prototype
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profile_picture: reader.result as string }));
      setLoading(false);
      toast({ title: "Visual Asset Ready", description: "Portrait captured for synchronization." });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.instagram_url || selectedCategories.length === 0 || !formData.location) {
      toast({ variant: "destructive", title: "Incomplete Intel", description: "Identify name, Instagram, location, and at least one vertical." });
      return;
    }

    setLoading(true);
    try {
      const username = extractUsername(formData.instagram_url);
      const data = {
        name: formData.name,
        instagram_url: formData.instagram_url,
        instagram_username: username,
        followers: Number(formData.followers) || 0,
        category: selectedCategories, // Stored as array for multi-tag support
        location: formData.location,
        estimated_cost: Number(formData.estimated_cost) || 0,
        engagement_rate: Number(formData.engagement_rate) || 0,
        ready_to_collab: formData.ready_to_collab,
        profile_picture: formData.profile_picture,
        updated_at: serverTimestamp()
      };

      if (existingTalent) {
        await updateDoc(doc(db, "talents", existingTalent.id), data);
        toast({ title: "Intelligence Synchronized", description: `${formData.name}'s profile updated.` });
      } else {
        const newDocRef = doc(collection(db, "talents"));
        await setDoc(newDocRef, {
          ...data,
          verified: false,
          featured: false,
          created_at: serverTimestamp()
        });
        toast({ title: "Talent Deployed", description: `${formData.name} added to the marketplace.` });
      }
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      {/* Visual Identity Section */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden bg-white">
            <AvatarImage src={formData.profile_picture} className="object-cover" />
            <AvatarFallback className="bg-slate-50 text-slate-300">
              <Upload className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] backdrop-blur-[2px]">
            <Upload className="h-6 w-6 text-white mb-1" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Capture Portrait</span>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Identifier Photo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Identity */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Full Identity Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Nair"
                className="pl-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Instagram Profile URL</Label>
            <div className="relative group">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input 
                value={formData.instagram_url}
                onChange={e => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/username"
                className="pl-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Followers Count</Label>
            <Input 
              type="number"
              value={formData.followers}
              onChange={e => setFormData({ ...formData, followers: e.target.value })}
              placeholder="e.g. 15000"
              className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Professional Metrics */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Location Hub (Kerala)</Label>
            <Select value={formData.location} onValueChange={val => setFormData({ ...formData, location: val })}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-base shadow-inner px-6 focus:ring-primary/20">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-300" />
                  <SelectValue placeholder="Identify district..." />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
                {KERALA_DISTRICTS.map(district => (
                  <SelectItem key={district} value={district} className="font-medium">{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Estimated Cost (INR)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                type="number"
                value={formData.estimated_cost}
                onChange={e => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="e.g. 5000"
                className="pl-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Engagement Rate (%)</Label>
            <Input 
              type="number" step="0.1"
              value={formData.engagement_rate}
              onChange={e => setFormData({ ...formData, engagement_rate: e.target.value })}
              placeholder="e.g. 4.2"
              className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Talent Vertical Multi-Select Section */}
      <div className="space-y-4 pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">
            Talent Verticals <span className="text-primary font-bold">(Max 3)</span>
          </Label>
          <Badge variant="outline" className="rounded-full border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
            {selectedCategories.length} / 3 Selected
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <Badge
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`cursor-pointer px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                  isSelected 
                    ? "bg-primary text-white border-none shadow-lg shadow-primary/20 scale-105" 
                    : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                {isSelected && <CheckCircle2 className="h-3 w-3 mr-2" />}
                {cat}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Strategic Toggles */}
      <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Collaboration Policy</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for strategic partnerships</p>
          </div>
        </div>
        <Switch 
          checked={formData.ready_to_collab} 
          onCheckedChange={val => setFormData({ ...formData, ready_to_collab: val })}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-4 pt-8 border-t border-slate-50">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onSuccess}
          className="rounded-xl font-bold text-[10px] uppercase text-slate-400 hover:text-slate-900"
        >
          Discard
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-14 px-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all active:scale-95 gap-3 tracking-widest uppercase text-xs"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {existingTalent ? "Sync Changes" : "Deploy Talent"}
        </Button>
      </div>
    </form>
  );
}
