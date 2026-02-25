
"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { 
  Loader2, 
  Upload, 
  X, 
  Plus, 
  Zap,
  Instagram,
  ShieldCheck,
  CheckCircle2,
  Tag,
  MapPin,
  User,
  Globe,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchInstagramVisuals } from "@/ai/flows/instagram-visuals-flow";

interface TalentFormProps {
  existingTalent?: any;
}

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
  "Commercial", 
  "Feature Film", 
  "Music Video", 
  "Fashion", 
  "Wedding Narrative", 
  "Instagram Reels",
  "UGC Production",
  "Digital Ad Films",
  "Product Story",
  "VFX Production"
];

export function TalentForm({ existingTalent }: TalentFormProps) {
  const db = useFirestore();
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    district: "",
    category: "",
    gender: "Male",
    paymentStage: "No",
    followers: 0,
    rank: 5,
    thumbnail: "",
    instagramUrl: "",
    freeCollab: "No"
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (existingTalent && !isInitialized) {
      setFormData({
        name: existingTalent.name || "",
        email: existingTalent.email || "",
        phone: existingTalent.phone || "",
        age: existingTalent.age || "",
        district: existingTalent.district || "",
        category: existingTalent.category || "",
        gender: existingTalent.gender || "Male",
        paymentStage: existingTalent.paymentStage || "No",
        followers: existingTalent.followers || 0,
        rank: existingTalent.rank || 5,
        thumbnail: existingTalent.thumbnail || "",
        instagramUrl: existingTalent.socialMediaContact || "",
        freeCollab: existingTalent.freeCollab || "No"
      });
      setSelectedTags(existingTalent.suitableProjectTypes || []);
      setIsInitialized(true);
    }
  }, [existingTalent, isInitialized]);

  const handleFetchInstagram = async () => {
    if (!formData.instagramUrl) return;
    setIsFetching(true);
    try {
      const result = await fetchInstagramVisuals({
        instagramUrl: formData.instagramUrl,
        category: formData.category || "Professional"
      });

      let followerNum = 0;
      const fStr = result.followers.toLowerCase();
      if (fStr.includes('k')) followerNum = Math.round(parseFloat(fStr) * 1000);
      else if (fStr.includes('m')) followerNum = Math.round(parseFloat(fStr) * 1000000);
      else followerNum = Math.round(parseFloat(fStr)) || 0;

      setFormData(prev => ({
        ...prev,
        followers: followerNum,
        thumbnail: result.profilePictureUrl
      }));

      toast({ title: "Intel Synchronized", description: `Extracted ${result.followers} followers and portrait.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Fetch Failed", description: "Could not sync Instagram intelligence." });
    } finally {
      setIsFetching(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        toast({ variant: "destructive", title: "Limit Reached", description: "Maximum 3 verticals allowed." });
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.district || !formData.category) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Name, District, and Category are required." });
      return;
    }

    setIsSubmitting(true);
    const talentData = {
      ...formData,
      suitableProjectTypes: selectedTags,
      isArchived: false,
      updatedAt: serverTimestamp(),
    };

    if (existingTalent) {
      updateDocumentNonBlocking(doc(db, "shoot_network", existingTalent.id), talentData);
      toast({ title: "Registry Updated", description: `${formData.name} profile synchronized.` });
    } else {
      const newRef = doc(collection(db, "shoot_network"));
      setDocumentNonBlocking(newRef, { ...talentData, id: newRef.id, createdAt: serverTimestamp() }, { merge: true });
      toast({ title: "Personnel Onboarded", description: `${formData.name} added to the network.` });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-10 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={() => thumbInputRef.current?.click()}>
          <Avatar className="h-40 w-40 border-8 border-slate-50 shadow-2xl rounded-[3rem] transition-all group-hover:scale-[1.02]">
            <AvatarImage src={formData.thumbnail} className="object-cover" />
            <AvatarFallback className="bg-slate-100"><Upload className="h-10 w-10 text-slate-300" /></AvatarFallback>
          </Avatar>
          <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setFormData(prev => ({ ...prev, thumbnail: reader.result as string }));
              reader.readAsDataURL(file);
            }
          }} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portrait Asset</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Name</Label>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-14 pl-14 font-bold text-lg" placeholder="Full Name" />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Primary Vertical</Label>
          <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner px-6"><SelectValue placeholder="Identify vertical..." /></SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6 border-t border-slate-50 pt-10">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase text-slate-900 tracking-widest flex items-center gap-2">
            <Instagram className="h-4 w-4 text-primary" /> Instagram Sync
          </h4>
        </div>
        <div className="flex gap-4">
          <Input 
            value={formData.instagramUrl} 
            onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})} 
            placeholder="Instagram @handle or URL" 
            className="rounded-2xl bg-slate-50 border-none h-14 font-bold shadow-inner px-6 flex-1" 
          />
          <Button onClick={handleFetchInstagram} disabled={isFetching || !formData.instagramUrl} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold gap-3 shadow-xl">
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Location Hub</Label>
          <Select value={formData.district} onValueChange={(val) => setFormData({...formData, district: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-inner px-6"><SelectValue placeholder="Select District..." /></SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
              {KERALA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Followers Count</Label>
          <Input type="number" value={formData.followers} onChange={(e) => setFormData({...formData, followers: parseInt(e.target.value) || 0})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-inner px-6" />
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Project Verticals (Max 3)</Label>
          <Badge variant="outline" className="rounded-full border-slate-100 text-[9px] font-bold text-slate-400 px-3">{selectedTags.length}/3 Selected</Badge>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {PROJECT_TAGS.map(tag => (
            <Badge key={tag} onClick={() => toggleTag(tag)} variant={selectedTags.includes(tag) ? "default" : "outline"} className={`cursor-pointer px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${selectedTags.includes(tag) ? "bg-primary border-none text-white shadow-xl shadow-primary/30" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"}`}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <DialogFooter className="bg-slate-50 p-10 flex justify-between items-center -mx-10 -mb-10 mt-10 rounded-b-[3.5rem]">
        <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-widest">Discard</Button></DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-12 h-14 gap-3 shadow-2xl transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            Deploy to Network
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
