
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
import { Plus, Loader2, Sparkles, Instagram, Zap, CheckCircle2, Upload } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { fetchInstagramVisuals } from "@/ai/flows/instagram-visuals-flow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TALENT_TYPES = ["Influencer", "Anchor", "Creator", "Model", "Virtual"];
const COLLAB_TYPES = ["Paid", "Barter", "Free", "Agency Managed"];
const COST_TYPES = ["Per Post", "Per Reel", "Per Event", "Monthly"];

/**
 * @fileOverview Talent Onboarding Portal.
 * Features automated Instagram intelligence fetching for profile synchronization.
 */

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
      toast({ variant: "destructive", title: "Missing URL", description: "Provide an Instagram URL to sync intelligence." });
      return;
    }

    setIsFetching(true);
    try {
      const result = await fetchInstagramVisuals({
        instagramUrl: formData.instagramUrl,
        category: formData.type || "Influencer"
      });

      // Transform followers string (e.g. "12.4k") into numerical data for sorting
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
        title: "Intelligence Synchronized",
        description: `Retrieved ${result.followers} followers. Portrait updated.`
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
        category: formData.category.split(',').map(c => c.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
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
      
      toast({ title: "Success", description: "Talent deployed to library." });
      setOpen(false);
      setFormData({
        name: "", profileImage: "", type: "Influencer", category: "", location: "",
        languages: "English", reachCategory: "Micro", estimatedCost: "",
        costType: "Per Post", collabType: "Paid", availableForFreeCollab: false,
        verified: false, instagramUrl: "", instagramFollowers: "",
        instagramEngagement: 0, youtubeUrl: "", youtubeSubscribers: "",
        portfolioLinks: "", status: "Active"
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
        <Button className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
          <Plus className="h-4 w-4" />
          Add Talent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-10 pb-0">
          <DialogTitle className="text-3xl font-bold font-headline flex items-center gap-3 tracking-tight">
            <Sparkles className="h-7 w-7 text-primary" />
            Provision New Talent
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white">
          
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative group">
              <Avatar className="h-40 w-40 rounded-[3rem] border-8 border-slate-50 shadow-2xl overflow-hidden bg-white">
                {formData.profileImage ? (
                  <AvatarImage src={formData.profileImage} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-slate-50 text-slate-200">
                    <Upload className="h-10 w-10" />
                  </AvatarFallback>
                )}
              </Avatar>
              {isFetching && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center rounded-[3rem]">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {formData.profileImage ? "Social Portrait Linked" : "Talent Identity Portrait"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Full Identity Name</Label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Nair"
                className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg px-6"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Talent Vertical</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  {TALENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-50 pt-10">
            <h4 className="text-[10px] font-bold uppercase text-slate-900 tracking-widest flex items-center gap-2">
              <Instagram className="h-4 w-4 text-primary" />
              Instagram Strategic Sync
            </h4>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Instagram URL</Label>
                  <Input 
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/profile"
                    className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-medium px-6"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <Button 
                    type="button" 
                    onClick={handleFetchInstagram} 
                    disabled={isFetching || !formData.instagramUrl}
                    className="h-14 rounded-2xl font-bold gap-3 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95"
                  >
                    {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                    Sync Intel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Followers (Auto-Synced)</Label>
                  <div className="relative">
                    <Input 
                      readOnly
                      value={formData.instagramFollowers}
                      placeholder="Fetch to populate..."
                      className="h-14 rounded-2xl bg-slate-100 border-none font-bold text-lg px-6 text-slate-500"
                    />
                    {formData.instagramFollowers && !isFetching && (
                      <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Engagement %</Label>
                  <Input 
                    readOnly
                    value={formData.instagramEngagement ? `${formData.instagramEngagement}%` : ""}
                    placeholder="Fetch to populate..."
                    className="h-14 rounded-2xl bg-slate-100 border-none font-bold text-lg px-6 text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Estimated Cost (INR)</Label>
              <Input 
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="e.g. 5000"
                className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg px-6"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">Location Hub</Label>
              <Input 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Kochi, KL"
                className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg px-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 items-center pt-4">
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
              <Checkbox 
                id="isFree" 
                checked={formData.availableForFreeCollab} 
                onCheckedChange={(checked) => setFormData({ ...formData, availableForFreeCollab: !!checked })}
                className="h-6 w-6 rounded-lg border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="isFree" className="text-sm font-bold text-slate-700 cursor-pointer tracking-tight">Free Collab Ready</Label>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
              <Checkbox 
                id="isVerified" 
                checked={formData.verified} 
                onCheckedChange={(checked) => setFormData({ ...formData, verified: !!checked })}
                className="h-6 w-6 rounded-lg border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="isVerified" className="text-sm font-bold text-slate-700 cursor-pointer tracking-tight">Verified Talent</Label>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-10 -mx-10 -mb-10 mt-10 rounded-b-[3rem]">
            <DialogClose asChild>
              <Button variant="ghost" className="font-bold text-slate-400 uppercase tracking-widest hover:bg-transparent">Discard</Button>
            </DialogClose>
            <Button 
              disabled={loading || !formData.name} 
              type="submit" 
              className="h-14 px-12 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all active:scale-95 tracking-widest uppercase text-xs"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy to Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
