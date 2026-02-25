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
import { Loader2, Upload, Instagram, User, IndianRupee, Globe, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchInstagramVisuals } from "@/ai/flows/instagram-visuals-flow";

const CATEGORIES = ["Tech", "Lifestyle", "Fashion", "Beauty", "Travel", "Food", "Fitness", "Education", "Entertainment", "Gaming", "Business"];

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
    category: "",
    location: "",
    estimated_cost: "",
    engagement_rate: "",
    ready_to_collab: false,
    profile_picture: ""
  });

  useEffect(() => {
    if (existingTalent) {
      setFormData({
        name: existingTalent.name || "",
        instagram_url: existingTalent.instagram_url || "",
        followers: existingTalent.followers?.toString() || "",
        category: existingTalent.category || "",
        location: existingTalent.location || "",
        estimated_cost: existingTalent.estimated_cost?.toString() || "",
        engagement_rate: existingTalent.engagement_rate?.toString() || "",
        ready_to_collab: existingTalent.ready_to_collab || false,
        profile_picture: existingTalent.profile_picture || ""
      });
    }
  }, [existingTalent]);

  const extractUsername = (url: string) => {
    if (!url) return "";
    try {
      const parts = url.replace(/\/$/, "").split("/");
      return parts[parts.length - 1].replace('@', '') || "";
    } catch (e) {
      return "";
    }
  };

  const handleFetchInstagram = async () => {
    if (!formData.instagram_url) return;
    setIsFetching(true);
    try {
      const result = await fetchInstagramVisuals({
        instagramUrl: formData.instagram_url,
        category: formData.category || "Professional"
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

      toast({ title: "Intel Synchronized", description: `Retrieved ${result.followers} followers and portrait.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Fetch Failed", description: "Could not retrieve Instagram metrics." });
    } finally {
      setIsFetching(false);
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
    if (!formData.name || !formData.instagram_url) {
      toast({ variant: "destructive", title: "Incomplete Intel", description: "Identify name and Instagram URL." });
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
        category: formData.category,
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
        toast({ title: "Personnel Onboarded", description: `${formData.name} added to the registry.` });
      }
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-8 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar className="h-32 w-32 rounded-3xl border-4 border-slate-50 shadow-xl overflow-hidden bg-white group-hover:scale-105 transition-transform">
            <AvatarImage src={formData.profile_picture} className="object-cover" />
            <AvatarFallback className="bg-slate-50 text-slate-300">
              {isFetching ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-3xl backdrop-blur-[2px]">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update Portrait</span>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Identity Picture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Full Identity Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Rahul Nair" className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Instagram URL</Label>
            <Button type="button" onClick={handleFetchInstagram} disabled={isFetching || !formData.instagram_url} variant="ghost" className="h-6 text-[9px] font-bold uppercase text-primary gap-1.5 hover:bg-primary/5">
              {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              Sync Intel
            </Button>
          </div>
          <div className="relative">
            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.instagram_url} onChange={e => setFormData({ ...formData, instagram_url: e.target.value })} placeholder="https://instagram.com/..." className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Niche Vertical</Label>
          <Select value={formData.category} onValueChange={val => setFormData({ ...formData, category: val })}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-inner px-4"><SelectValue placeholder="Identify niche..." /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
              {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Location Hub</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Kochi, KL" className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Followers Count</Label>
          <Input type="number" value={formData.followers} onChange={e => setFormData({ ...formData, followers: e.target.value })} placeholder="15000" className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Estimated Cost (INR)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input type="number" value={formData.estimated_cost} onChange={e => setFormData({ ...formData, estimated_cost: e.target.value })} placeholder="5000" className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Collaboration Model</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for immediate strategic partnerships</p>
          </div>
        </div>
        <Switch checked={formData.ready_to_collab} onCheckedChange={val => setFormData({ ...formData, ready_to_collab: val })} />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onSuccess} className="h-12 px-6 rounded-xl font-bold text-[10px] uppercase text-slate-400 hover:text-slate-900">Discard</Button>
        <Button type="submit" disabled={loading} className="h-12 px-10 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2 tracking-widest">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {existingTalent ? "Sync Changes" : "Deploy Talent"}
        </Button>
      </div>
    </form>
  );
}