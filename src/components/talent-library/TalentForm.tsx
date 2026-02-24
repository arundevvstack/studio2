"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFirestore, initializeFirebase } from "@/firebase";
import { doc, collection, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import { Loader2, Upload, Instagram, User, IndianRupee, Globe, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CATEGORIES = [
  "Tech", "Lifestyle", "Fashion", "Beauty", "Travel", "Food", 
  "Fitness", "Education", "Entertainment", "Gaming", "Business"
];

interface TalentFormProps {
  existingTalent?: any;
  onSuccess: () => void;
}

export function TalentForm({ existingTalent, onSuccess }: TalentFormProps) {
  const db = useFirestore();
  const { storage } = initializeFirebase();
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    try {
      const storageRef = ref(storage, `talents/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, profile_picture: url }));
      toast({ title: "Visual Asset Uploaded", description: "Profile portrait synchronized." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.instagram_url || !formData.category) {
      toast({ variant: "destructive", title: "Gap in Intelligence", description: "Please populate all required fields." });
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
        toast({ title: "Registry Synchronized", description: `${formData.name}'s profile updated.` });
      } else {
        const newDocRef = doc(collection(db, "talents"));
        await setDoc(newDocRef, {
          ...data,
          verified: false,
          featured: false,
          created_at: serverTimestamp()
        });
        toast({ title: "Talent Deployed", description: `${formData.name} added to the library.` });
      }
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-2">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden bg-white">
            <AvatarImage src={formData.profile_picture} className="object-cover" />
            <AvatarFallback className="bg-slate-50 text-slate-300">
              <Upload className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem]">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update Portrait</span>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Full Identity Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Nair"
              className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Instagram Profile URL</Label>
          <div className="relative">
            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={formData.instagram_url}
              onChange={e => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/username"
              className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
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
            className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Talent Vertical</Label>
          <Select value={formData.category} onValueChange={val => setFormData({ ...formData, category: val })}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-inner px-4">
              <SelectValue placeholder="Identify category..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
              {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Location Hub</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Kochi, KL"
              className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
            />
          </div>
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
              className="pl-12 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
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
            className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 mt-2">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-slate-700">Ready to Collaborate</Label>
            <p className="text-[10px] text-slate-400 font-medium">Open for strategic partnerships.</p>
          </div>
          <Switch 
            checked={formData.ready_to_collab} 
            onCheckedChange={val => setFormData({ ...formData, ready_to_collab: val })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button 
          type="submit" 
          disabled={loading}
          className="h-12 px-10 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-2 tracking-normal"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {existingTalent ? "Sync Changes" : "Deploy Talent"}
        </Button>
      </div>
    </form>
  );
}
