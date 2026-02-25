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
import { Loader2, Upload, Instagram, User, IndianRupee, Globe, Sparkles, Zap, CheckCircle2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchInstagramVisuals } from "@/ai/flows/instagram-visuals-flow";

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
  const [isFetching, setIsFetching] = useState(false);
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

  const extractUsername = (url: string) => {
    if (!url) return "";
    try {
      const parts = url.replace(/\/$/, "").split("/");
      const lastPart = parts[parts.length - 1];
      return lastPart.replace('@', '') || "";
    } catch (e) {
      return "";
    }
  };

  const handleFetchInstagram = async () => {
    if (!formData.instagram_url) {
      toast({ variant: "destructive", title: "Identity Required", description: "Provide an Instagram URL to sync intelligence." });
      return;
    }

    setIsFetching(true);
    try {
      const result = await fetchInstagramVisuals({
        instagramUrl: formData.instagram_url,
        category: selectedCategories[0] || "Professional"
      });

      let followerNum = 0;
      const fStr = result.followers.toLowerCase();
      if (fStr.includes('k')) followerNum = Math.round(parseFloat(fStr) * 1000);
      else if (fStr.includes('m')) followerNum = Math.round(parseFloat(fStr) * 1000000);
      else followerNum = Math.round(parseFloat(fStr)) || 0;

      const engagementNum = parseFloat(result.engagementRate) || 0;

      setFormData(prev => ({
        ...prev,
        followers: followerNum.toString(),
        engagement_rate: engagementNum.toString(),
        profile_picture: result.profilePictureUrl
      }));

      toast({
        title: "Intelligence Synchronized",
        description: `Retrieved ${result.followers} followers and profile portrait.`
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Fetch Failed", description: "Could not retrieve Instagram metrics." });
    } finally {
      setIsFetching(false);
    }
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profile_picture: reader.result as string }));
      setLoading(false);
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
        category: selectedCategories,
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
          id: newDocRef.id,
          verified: false,
          featured: false,
          created_at: serverTimestamp()
        });
        toast({ title: "Talent Deployed", description: `${formData.name} added to the registry.` });
      }
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 p-10 max-h-[85vh] overflow-y-auto custom-scrollbar bg-white">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar className="h-40 w-40 rounded-[2.5rem] border-8 border-slate-50 shadow-2xl overflow-hidden bg-white group-hover:scale-[1.02] transition-transform duration-500">
            <AvatarImage src={formData.profile_picture} className="object-cover" />
            <AvatarFallback className="bg-slate-50 text-slate-300">
              {isFetching ? <Loader2 className="h-10 w-10 animate-spin" /> : <Upload className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] backdrop-blur-[2px]">
            <Upload className="h-6 w-6 text-white mb-1" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update Portrait</span>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Identity Picture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Full Identity Name</Label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Nair"
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Instagram Strategic URL</Label>
              <Button type="button" onClick={handleFetchInstagram} disabled={isFetching || !formData.instagram_url} variant="ghost" className="h-6 text-[9px] font-bold uppercase text-primary gap-1.5 hover:bg-primary/5">
                {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                Fetch Intel
              </Button>
            </div>
            <div className="relative group">
              <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input 
                value={formData.instagram_url}
                onChange={e => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/username"
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Followers Analytics (Auto-synced)</Label>
            <div className="relative">
              <Users className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                type="number"
                value={formData.followers}
                onChange={e => setFormData({ ...formData, followers: e.target.value })}
                placeholder="e.g. 15000"
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Location Hub (Kerala Districts)</Label>
            <Select value={formData.location} onValueChange={val => setFormData({ ...formData, location: val })}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-base shadow-inner px-6 focus:ring-primary/20">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-300" />
                  <SelectValue placeholder="Identify district..." />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
                {KERALA_DISTRICTS.map(district => (
                  <SelectItem key={district} value={district} className="font-bold text-slate-900">{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Estimated Strategic Cost (INR)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                type="number"
                value={formData.estimated_cost}
                onChange={e => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="e.g. 5000"
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Engagement Rate Benchmark (%)</Label>
            <div className="relative">
              <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                type="number" step="0.1"
                value={formData.engagement_rate}
                onChange={e => setFormData({ ...formData, engagement_rate: e.target.value })}
                placeholder="e.g. 4.2"
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-base px-6 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">
            Talent Verticals <span className="text-primary font-bold">(Max 3 Selection)</span>
          </Label>
          <Badge variant="outline" className="rounded-full border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {selectedCategories.length} / 3 Selected
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <Badge
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`cursor-pointer px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
                  isSelected 
                    ? "bg-primary text-white border-none shadow-xl shadow-primary/30 scale-105" 
                    : "bg-slate-50 border-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                {isSelected && <CheckCircle2 className="h-3 w-3 mr-2" />}
                {cat}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between group">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight leading-none">Collaboration Model</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Ready for immediate strategic partnerships</p>
          </div>
        </div>
        <Switch 
          checked={formData.ready_to_collab} 
          onCheckedChange={val => setFormData({ ...formData, ready_to_collab: val })}
          className="data-[state=checked]:bg-accent"
        />
      </div>

      <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onSuccess}
          className="h-14 px-8 rounded-2xl font-bold text-[10px] uppercase text-slate-400 hover:text-slate-900 tracking-widest"
        >
          Discard
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-14 px-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all active:scale-95 gap-3 tracking-widest uppercase text-xs"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          {existingTalent ? "Sync Changes" : "Deploy Talent"}
        </Button>
      </div>
    </form>
  );
}