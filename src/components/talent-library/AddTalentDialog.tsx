"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Sparkles, User, Instagram, Youtube, Zap, CheckCircle2, Upload } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { fetchInstagramVisuals } from "@/ai/flows/instagram-visuals-flow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TALENT_TYPES = ["Influencer", "Anchor", "Creator", "Model", "Virtual"];
const REACH_CATEGORIES = ["Nano", "Micro", "Mid", "Macro", "Mega"];
const COLLAB_TYPES = ["Paid", "Barter", "Free", "Agency Managed"];
const COST_TYPES = ["Per Post", "Per Reel", "Per Event", "Monthly"];

export function AddTalentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const db = useFirestore();

  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
    type: "Influencer",
    category: "",
    location: "",
    languages: "English",
    reachCategory: "Micro",
    estimatedCost: "",
    costType: "Per Post",
    collabType: "Paid",
    availableForFreeCollab: false,
    verified: false,
    instagramUrl: "",
    instagramFollowers: "",
    instagramEngagement: 0,
    youtubeUrl: "",
    youtubeSubscribers: "",
    portfolioLinks: "",
    status: "Active"
  });

  const handleFetchInstagram = async () => {
    if (!formData.instagramUrl) {
      toast({ variant: "destructive", title: "Missing URL", description: "Provide an Instagram URL to fetch intelligence." });
      return;
    }

    setIsFetching(true);
    try {
      const result = await fetchInstagramVisuals({
        instagramUrl: formData.instagramUrl,
        category: formData.type || "Influencer"
      });

      // Parse followers string (e.g. "12.4k") to number
      let followerNum = 0;
      const fStr = result.followers.toLowerCase();
      if (fStr.includes('k')) followerNum = parseFloat(fStr) * 1000;
      else if (fStr.includes('m')) followerNum = parseFloat(fStr) * 1000000;
      else followerNum = parseFloat(fStr) || 0;

      const engagementNum = parseFloat(result.engagementRate) || 0;

      setFormData(prev => ({
        ...prev,
        instagramFollowers: followerNum.toString(),
        instagramEngagement: engagementNum,
        profileImage: result.profilePictureUrl
      }));

      toast({
        title: "Intelligence Synced",
        description: `Retrieved ${result.followers} followers and ${result.engagementRate} engagement. Profile portrait updated.`
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Fetch Failed", description: "Could not retrieve Instagram metrics." });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "talents"), {
        ...formData,
        category: formData.category.split(',').map(c => c.trim()),
        languages: formData.languages.split(',').map(l => l.trim()),
        estimatedCost: Number(formData.estimatedCost) || 0,
        platforms: {
          instagram: {
            url: formData.instagramUrl,
            followers: Number(formData.instagramFollowers) || 0,
            engagementRate: formData.instagramEngagement
          },
          youtube: {
            url: formData.youtubeUrl,
            subscribers: Number(formData.youtubeSubscribers) || 0
          }
        },
        portfolioLinks: formData.portfolioLinks.split(',').map(p => p.trim()).filter(Boolean),
        rating: 5,
        createdAt: serverTimestamp()
      });
      toast({ title: "Success", description: "Talent added to library." });
      setOpen(false);
      setFormData({
        name: "",
        profileImage: "",
        type: "Influencer",
        category: "",
        location: "",
        languages: "English",
        reachCategory: "Micro",
        estimatedCost: "",
        costType: "Per Post",
        collabType: "Paid",
        availableForFreeCollab: false,
        verified: false,
        instagramUrl: "",
        instagramFollowers: "",
        instagramEngagement: 0,
        youtubeUrl: "",
        youtubeSubscribers: "",
        portfolioLinks: "",
        status: "Active"
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 gap-2">
          <Plus className="h-4 w-4" />
          Add Talent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            Add New Talent
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative group">
              <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden bg-white">
                {formData.profileImage ? (
                  <AvatarImage src={formData.profileImage} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                    {formData.name?.[0] || 'T'}
                  </AvatarFallback>
                )}
              </Avatar>
              {isFetching && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {formData.profileImage ? "Instagram Portrait Synced" : "Talent Portrait"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 px-1">Full Name</Label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Nair"
                className="h-12 rounded-xl border-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 px-1">Talent Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="h-12 rounded-xl border-slate-100 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TALENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 px-1">Categories (Comma separated)</Label>
              <Input 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Tech, Lifestyle"
                className="h-12 rounded-xl border-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 px-1">Location</Label>
              <Input 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Kochi, Kerala"
                className="h-12 rounded-xl border-slate-100 font-medium"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-50 pt-6">
            <h4 className="text-xs font-bold uppercase text-slate-900 flex items-center gap-2">
              <Instagram className="h-4 w-4 text-primary" />
              Social Media Presence
            </h4>
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Instagram URL</Label>
                  <Input 
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/profile"
                    className="h-12 rounded-xl border-slate-100 font-medium"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <Button 
                    type="button" 
                    onClick={handleFetchInstagram} 
                    disabled={isFetching || !formData.instagramUrl}
                    variant="secondary"
                    className="h-12 rounded-xl font-bold gap-2 px-6 shadow-sm border-none bg-primary/5 text-primary hover:bg-primary/10"
                  >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Fetch Intel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Followers</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      value={formData.instagramFollowers}
                      onChange={(e) => setFormData({ ...formData, instagramFollowers: e.target.value })}
                      placeholder="e.g. 15000"
                      className="h-12 rounded-xl border-slate-100 font-bold pr-12"
                    />
                    {formData.instagramFollowers && !isFetching && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 px-1">Engagement %</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={formData.instagramEngagement}
                    onChange={(e) => setFormData({ ...formData, instagramEngagement: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 4.2"
                    className="h-12 rounded-xl border-slate-100 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 px-1">Estimated Cost (INR)</Label>
              <Input 
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="e.g. 5000"
                className="h-12 rounded-xl border-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 px-1">Cost Type</Label>
              <Select value={formData.costType} onValueChange={(val) => setFormData({ ...formData, costType: val })}>
                <SelectTrigger className="h-12 rounded-xl border-slate-100 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {COST_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-center pt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Checkbox 
                id="isFree" 
                checked={formData.availableForFreeCollab} 
                onCheckedChange={(checked) => setFormData({ ...formData, availableForFreeCollab: !!checked })}
                className="rounded-md"
              />
              <Label htmlFor="isFree" className="text-sm font-bold text-slate-700 cursor-pointer">Available for Free Collab</Label>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Checkbox 
                id="isVerified" 
                checked={formData.verified} 
                onCheckedChange={(checked) => setFormData({ ...formData, verified: !!checked })}
                className="rounded-md"
              />
              <Label htmlFor="isVerified" className="text-sm font-bold text-slate-700 cursor-pointer">Verified Talent</Label>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-8 -mx-8 -mb-8 mt-8">
            <DialogClose asChild>
              <Button variant="ghost" className="font-bold text-slate-400 uppercase">Cancel</Button>
            </DialogClose>
            <Button disabled={loading} type="submit" className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy to Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
