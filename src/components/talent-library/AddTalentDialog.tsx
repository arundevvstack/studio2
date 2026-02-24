
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Sparkles, User, Instagram, Youtube } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const TALENT_TYPES = ["Influencer", "Anchor", "Creator", "Model", "Virtual"];
const REACH_CATEGORIES = ["Nano", "Micro", "Mid", "Macro", "Mega"];
const COLLAB_TYPES = ["Paid", "Barter", "Free", "Agency Managed"];
const COST_TYPES = ["Per Post", "Per Reel", "Per Event", "Monthly"];

export function AddTalentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    youtubeUrl: "",
    youtubeSubscribers: "",
    portfolioLinks: "",
    status: "Active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "talents"), {
        ...formData,
        category: formData.category.split(',').map(c => c.trim()),
        languages: formData.languages.split(',').map(l => c.trim()),
        estimatedCost: Number(formData.estimatedCost) || 0,
        platforms: {
          instagram: {
            url: formData.instagramUrl,
            followers: Number(formData.instagramFollowers) || 0
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 px-1">Instagram URL</Label>
                <Input 
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="h-12 rounded-xl border-slate-100 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 px-1">Instagram Followers</Label>
                <Input 
                  type="number"
                  value={formData.instagramFollowers}
                  onChange={(e) => setFormData({ ...formData, instagramFollowers: e.target.value })}
                  placeholder="e.g. 15000"
                  className="h-12 rounded-xl border-slate-100 font-medium"
                />
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
