
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
  Image as ImageIcon, 
  Video, 
  Tag, 
  Share2,
  MessageSquare,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  ShieldCheck,
  CheckCircle2,
  Zap
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
  "TikTok / Shorts",
  "UGC Production",
  "Influencer Collab",
  "Product Story",
  "VFX / Animation",
  "AI Generated Content",
  "Performance Marketing",
  "Digital Ad Films"
];

const SOCIAL_PLATFORMS = [
  { id: "Instagram", icon: Instagram },
  { id: "WhatsApp", icon: MessageSquare },
  { id: "YouTube", icon: Youtube },
  { id: "LinkedIn", icon: Linkedin },
  { id: "X / Twitter", icon: Twitter },
  { id: "Facebook", icon: Facebook },
  { id: "Portfolio", icon: Globe },
  { id: "Other", icon: Share2 },
];

export function TalentForm({ existingTalent }: TalentFormProps) {
  const db = useFirestore();
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
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
    colabText: "",
    paymentStage: "No",
    referredBy: "",
    portfolio: "",
    rank: 5,
    followers: 0,
    engagementRate: 0,
    projectCount: 0,
    thumbnail: "",
    freeCollab: "No",
    instagramUrl: ""
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState("Instagram");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const [gallery, setGallery] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemType, setNewItemType] = useState<'image' | 'video'>('image');

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
        colabText: existingTalent.colabCategories?.join(', ') || "",
        paymentStage: existingTalent.paymentStage || "No",
        referredBy: existingTalent.referredBy || "",
        portfolio: existingTalent.portfolio || "",
        rank: existingTalent.rank || 5,
        followers: existingTalent.followers || 0,
        engagementRate: existingTalent.engagementRate || 0,
        projectCount: existingTalent.projectCount || 0,
        thumbnail: existingTalent.thumbnail || "",
        freeCollab: existingTalent.freeCollab || "No",
        instagramUrl: existingTalent.socialMediaContact || ""
      });
      setGallery(existingTalent.gallery || []);
      setSelectedTags(existingTalent.suitableProjectTypes || []);
      setSocialLinks(existingTalent.socialLinks || []);
      setIsInitialized(true);
    }
  }, [existingTalent, isInitialized]);

  const handleFetchInstagram = async () => {
    if (!formData.instagramUrl) {
      toast({ variant: "destructive", title: "Missing URL", description: "Provide an Instagram URL or handle to sync intelligence." });
      return;
    }

    setIsFetching(true);
    try {
      const result = await fetchInstagramVisuals({
        instagramUrl: formData.instagramUrl,
        category: formData.category || "Professional"
      });

      // Parse human-readable followers (e.g. 12.4k) to numerical
      let followerNum = 0;
      const fStr = result.followers.toLowerCase();
      if (fStr.includes('k')) followerNum = Math.round(parseFloat(fStr) * 1000);
      else if (fStr.includes('m')) followerNum = Math.round(parseFloat(fStr) * 1000000);
      else followerNum = Math.round(parseFloat(fStr)) || 0;

      setFormData(prev => ({
        ...prev,
        followers: followerNum,
        engagementRate: parseFloat(result.engagementRate) || 0,
        thumbnail: result.profilePictureUrl
      }));

      toast({
        title: "Intelligence Synchronized",
        description: `Retrieved ${result.followers} followers and portrait from Instagram.`
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Fetch Failed", description: "Could not extract Instagram visuals." });
    } finally {
      setIsFetching(false);
    }
  };

  const handleThumbnailClick = () => thumbInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnail' | 'gallery') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (target === 'thumbnail') {
          setFormData(prev => ({ ...prev, thumbnail: base64String }));
        } else {
          setGallery(prev => [...prev, { url: base64String, type: 'image' }]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleAddSocial = () => {
    if (!newSocialUrl) return;
    setSocialLinks([...socialLinks, { platform: newSocialPlatform, url: newSocialUrl }]);
    setNewSocialUrl("");
  };

  const handleRemoveSocial = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleAddGalleryUrl = () => {
    if (!newItemUrl) return;
    setGallery([...gallery, { url: newItemUrl, type: newItemType }]);
    setNewItemUrl("");
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        toast({ 
          variant: "destructive", 
          title: "Selection Limit", 
          description: "A maximum of 3 strategic verticals can be assigned per professional." 
        });
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.district || !formData.category) {
      toast({ 
        variant: "destructive", 
        title: "Information Missing", 
        description: "Identify name, district, and creative vertical to proceed." 
      });
      return;
    }

    setIsSubmitting(true);
    
    const talentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
      district: formData.district,
      category: formData.category,
      gender: formData.gender,
      colabCategories: formData.colabText.split(',').map(s => s.trim()).filter(s => s),
      suitableProjectTypes: selectedTags,
      paymentStage: formData.paymentStage,
      referredBy: formData.referredBy,
      socialLinks: socialLinks,
      socialMediaContact: formData.instagramUrl,
      portfolio: formData.portfolio,
      rank: Number(formData.rank),
      followers: Number(formData.followers),
      engagementRate: Number(formData.engagementRate),
      projectCount: Number(formData.projectCount),
      thumbnail: formData.thumbnail,
      gallery: gallery,
      freeCollab: formData.freeCollab,
      isArchived: false,
      updatedAt: serverTimestamp(),
    };

    if (existingTalent) {
      const talentRef = doc(db, "shoot_network", existingTalent.id);
      updateDocumentNonBlocking(talentRef, talentData);
      toast({ title: "Intelligence Synchronized", description: `${formData.name} profile has been updated.` });
    } else {
      const talentRef = collection(db, "shoot_network");
      const newDocRef = doc(talentRef);
      setDocumentNonBlocking(newDocRef, {
        ...talentData,
        id: newDocRef.id,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "Profile Initialized", description: `${formData.name} added to the network.` });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-10 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={handleThumbnailClick}>
          <Avatar className="h-40 w-40 border-8 border-slate-50 shadow-2xl rounded-[3rem] transition-all group-hover:scale-[1.02]">
            <AvatarImage src={formData.thumbnail || ""} className="object-cover" />
            <AvatarFallback className="bg-slate-100">
              <Upload className="h-10 w-10 text-slate-300" />
            </AvatarFallback>
          </Avatar>
          {(isFetching || isSubmitting) && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center rounded-[3rem]">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge className="bg-black/60 backdrop-blur-md text-white border-none rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">Update Portrait</Badge>
          </div>
          <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity Portrait</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Identity Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-14 font-bold tracking-tight text-lg shadow-inner px-6 focus-visible:ring-primary/20" placeholder="Legal or Brand Name" />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Primary Category</Label>
          <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg tracking-tight shadow-inner px-6 focus:ring-primary/20">
              <SelectValue placeholder="Identify primary vertical..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6 border-t border-slate-50 pt-10">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase text-slate-900 tracking-widest flex items-center gap-2">
            <Instagram className="h-4 w-4 text-primary" />
            Instagram Intel Extraction
          </h4>
          {isFetching && <Badge className="bg-primary/10 text-primary border-none animate-pulse">Syncing Visuals...</Badge>}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            <Input 
              value={formData.instagramUrl} 
              onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})} 
              placeholder="Instagram URL or @handle" 
              className="rounded-2xl bg-slate-50 border-none h-14 font-bold shadow-inner px-6" 
            />
          </div>
          <Button 
            onClick={handleFetchInstagram} 
            disabled={isFetching || !formData.instagramUrl}
            className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-3 transition-all active:scale-95 shadow-xl"
          >
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            Fetch Intel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Location Hub (Kerala)</Label>
          <Select value={formData.district} onValueChange={(val) => setFormData({...formData, district: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg tracking-tight shadow-inner px-6 focus:ring-primary/20">
              <SelectValue placeholder="Select District..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
              {KERALA_DISTRICTS.map(district => (
                <SelectItem key={district} value={district} className="font-medium">{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Gender Identity</Label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg tracking-tight shadow-inner px-6 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5" /> Additional Project Verticals (Max 3)
          </Label>
          <Badge variant="outline" className="rounded-full border-slate-100 text-[9px] font-bold text-slate-400 uppercase px-3">
            {selectedTags.length} / 3 Selected
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {PROJECT_TAGS.map(tag => (
            <Badge 
              key={tag} 
              onClick={() => toggleTag(tag)} 
              variant={selectedTags.includes(tag) ? "default" : "outline"} 
              className={`cursor-pointer px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                selectedTags.includes(tag) 
                  ? "bg-primary border-none text-white shadow-xl shadow-primary/30 scale-105" 
                  : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              {selectedTags.includes(tag) && <CheckCircle2 className="h-3 w-3 mr-2" />}
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-slate-50">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Verification Status</Label>
          <Select value={formData.paymentStage} onValueChange={(val) => setFormData({...formData, paymentStage: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold tracking-tight shadow-inner px-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              <SelectItem value="Yes" className="text-green-600 font-bold">Verified Professional</SelectItem>
              <SelectItem value="No">Awaiting Validation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Free Collab Readiness?</Label>
          <RadioGroup value={formData.freeCollab} onValueChange={(val) => setFormData({...formData, freeCollab: val})} className="flex items-center gap-10 h-14">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Yes" id="collab-yes" className="h-5 w-5 border-primary text-primary" />
              <Label htmlFor="collab-yes" className="text-sm font-bold text-slate-600 cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="No" id="collab-no" className="h-5 w-5 border-slate-300" />
              <Label htmlFor="collab-no" className="text-sm font-bold text-slate-600 cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><Share2 className="h-3.5 w-3.5" /> Social Media Sync</Label>
        <div className="flex gap-3">
          <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
            <SelectTrigger className="h-14 w-48 rounded-2xl bg-slate-50 border-none font-bold tracking-widest text-[10px] uppercase shadow-inner"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {SOCIAL_PLATFORMS.map(p => <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase">{p.id}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} placeholder="Username or direct URL link..." className="rounded-2xl bg-slate-50 border-none h-14 flex-1 font-bold tracking-tight shadow-inner px-6" />
          <Button onClick={handleAddSocial} type="button" className="h-14 w-14 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all"><Plus className="h-6 w-6" /></Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {socialLinks.map((link, idx) => {
            const PlatformIcon = SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.icon || Globe;
            return (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary"><PlatformIcon className="h-4 w-4" /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{link.platform}:</span>
                  <span className="text-sm font-bold text-slate-900 truncate max-w-[300px]">{link.url}</span>
                </div>
                <Button onClick={() => handleRemoveSocial(idx)} type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/5"><X className="h-5 w-5" /></Button>
              </div>
            );
          })}
        </div>
      </div>

      <DialogFooter className="bg-slate-50 p-10 flex justify-between items-center -mx-10 -mb-10 mt-10 rounded-b-[3.5rem]">
        <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-transparent">Discard</Button></DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-12 h-14 gap-3 tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            {existingTalent ? "Sync Intelligence" : "Add to Network"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
