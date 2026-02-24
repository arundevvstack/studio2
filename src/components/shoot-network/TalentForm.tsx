
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
  Save, 
  Mail, 
  Phone, 
  Upload, 
  X, 
  Star, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Tag, 
  MapPin, 
  Grid,
  Share2,
  MessageSquare,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  "Social Media", 
  "Corporate Branding",
  "Instagram Reels",
  "TikTok / Shorts",
  "UGC Production",
  "Influencer Collab",
  "Product Story",
  "Documentary",
  "VFX / Animation",
  "AI Generated Content"
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
    projectCount: 0,
    thumbnail: "",
    freeCollab: "No",
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
        projectCount: existingTalent.projectCount || 0,
        thumbnail: existingTalent.thumbnail || "",
        freeCollab: existingTalent.freeCollab || "No",
      });
      setGallery(existingTalent.gallery || []);
      setSelectedTags(existingTalent.suitableProjectTypes || []);
      
      const legacySocial = existingTalent.socialMediaContact ? [{ platform: "Instagram", url: existingTalent.socialMediaContact }] : [];
      setSocialLinks(existingTalent.socialLinks || legacySocial);
      
      setIsInitialized(true);
    }
  }, [existingTalent, isInitialized]);

  const handleThumbnailClick = () => {
    thumbInputRef.current?.click();
  };

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
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!formData.name || !formData.district || !formData.category) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Identity, Location, and Creative Category are required fields." 
      });
      return;
    }

    setIsSubmitting(true);
    
    const colabCategories = formData.colabText.split(',').map(s => s.trim()).filter(s => s);

    const talentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
      district: formData.district,
      category: formData.category,
      gender: formData.gender,
      colabCategories,
      suitableProjectTypes: selectedTags,
      paymentStage: formData.paymentStage,
      referredBy: formData.referredBy,
      socialLinks: socialLinks,
      socialMediaContact: socialLinks.find(l => l.platform === 'Instagram')?.url || "",
      portfolio: formData.portfolio,
      rank: Number(formData.rank),
      projectCount: Number(formData.projectCount),
      thumbnail: formData.thumbnail,
      gallery: gallery,
      freeCollab: formData.freeCollab,
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
        isArchived: false,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "Profile Initialized", description: `${formData.name} added to the repository.` });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
      {/* Photo Identification */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div 
          className="relative group cursor-pointer"
          onClick={handleThumbnailClick}
        >
          <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-xl rounded-[2.5rem] transition-all group-hover:opacity-80">
            <AvatarImage src={formData.thumbnail || ""} className="object-cover" />
            <AvatarFallback className="bg-slate-100">
              <Upload className="h-8 w-8 text-slate-300" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge className="bg-black/50 text-white border-none rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-normal">Change Photo</Badge>
          </div>
          <input 
            type="file" 
            ref={thumbInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e, 'thumbnail')}
          />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Primary Identity Thumbnail</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Full Identity Name</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="Legal or Brand Name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Creative Vertical</Label>
          <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold tracking-normal focus:ring-primary/20">
              <SelectValue placeholder="Identify vertical..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">District</Label>
          <Select value={formData.district} onValueChange={(val) => setFormData({...formData, district: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold tracking-normal focus:ring-primary/20">
              <SelectValue placeholder="Select Kerala district..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
              {KERALA_DISTRICTS.map(district => (
                <SelectItem key={district} value={district} className="font-medium">{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Gender Identity</Label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold tracking-normal focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="Male" className="tracking-normal font-medium">Male</SelectItem>
              <SelectItem value="Female" className="tracking-normal font-medium">Female</SelectItem>
              <SelectItem value="Other" className="tracking-normal font-medium">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
          <Tag className="h-3 w-3" /> Project Verticals (Tags)
        </Label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TAGS.map(tag => (
            <Badge 
              key={tag} 
              onClick={() => toggleTag(tag)}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-normal transition-all ${
                selectedTags.includes(tag) ? "bg-primary border-none text-white shadow-md shadow-primary/20" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
              }`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Verification</Label>
          <Select value={formData.paymentStage} onValueChange={(val) => setFormData({...formData, paymentStage: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold tracking-normal focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="Yes" className="tracking-normal font-medium">Verified (Paid)</SelectItem>
              <SelectItem value="No" className="tracking-normal font-medium">Pending Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Willing to Free Collab?</Label>
          <RadioGroup 
            value={formData.freeCollab} 
            onValueChange={(val) => setFormData({...formData, freeCollab: val})}
            className="flex items-center gap-6 h-12"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="collab-yes" />
              <Label htmlFor="collab-yes" className="text-xs font-bold text-slate-600">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="collab-no" />
              <Label htmlFor="collab-no" className="text-xs font-bold text-slate-600">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
          <Share2 className="h-3 w-3" /> Social Media
        </Label>
        <div className="flex gap-2">
          <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
            <SelectTrigger className="h-12 w-40 rounded-xl bg-slate-50 border-none font-bold tracking-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {SOCIAL_PLATFORMS.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            value={newSocialUrl}
            onChange={(e) => setNewSocialUrl(e.target.value)}
            placeholder="Profile Link or Handle"
            className="rounded-xl bg-slate-50 border-none h-12 flex-1 font-bold tracking-normal focus-visible:ring-primary/20"
          />
          <Button onClick={handleAddSocial} type="button" className="h-12 w-12 rounded-xl bg-slate-900 text-white shadow-lg transition-transform active:scale-95">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {socialLinks.map((link, idx) => {
            const PlatformIcon = SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.icon || Share2;
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 group animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-3">
                  <PlatformIcon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{link.platform}:</span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[250px]">{link.url}</span>
                </div>
                <Button onClick={() => handleRemoveSocial(idx)} type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
          <ImageIcon className="h-3 w-3" /> Professional Gallery Manager
        </Label>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-2">
            <Input 
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              placeholder="Asset URL (Image or Video)"
              className="rounded-xl bg-slate-50 border-none h-12 flex-1 font-bold tracking-normal focus-visible:ring-primary/20"
            />
            <Select value={newItemType} onValueChange={(val: any) => setNewItemType(val)}>
              <SelectTrigger className="h-12 w-32 rounded-xl bg-slate-50 border-none font-bold tracking-normal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddGalleryUrl} type="button" className="h-12 w-12 rounded-xl bg-slate-900 text-white shadow-lg transition-transform active:scale-95">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              ref={galleryInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'gallery')}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl border-dashed border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-400 font-bold text-xs uppercase gap-2"
              onClick={() => galleryInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Local Image Asset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gallery.map((item, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden group border border-slate-200">
              <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Talent Asset" />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Video className="h-6 w-6 text-white" />
                </div>
              )}
              <Button 
                onClick={() => handleRemoveGalleryItem(idx)} 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-destructive opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {gallery.length === 0 && (
            <div className="col-span-full py-6 text-center">
              <p className="text-[10px] text-slate-300 italic">No assets added to the portfolio gallery.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Performance Rank (1-5)</Label>
          <div className="relative">
            <Star className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              type="number"
              min="1"
              max="5"
              value={formData.rank} 
              onChange={(e) => setFormData({...formData, rank: Number(e.target.value)})}
              className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold tracking-normal"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Associated Projects</Label>
          <Input 
            type="number"
            value={formData.projectCount} 
            onChange={(e) => setFormData({...formData, projectCount: Number(e.target.value)})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Partner Age</Label>
          <Input 
            value={formData.age} 
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="e.g. 24"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Portfolio Repository</Label>
          <Input 
            value={formData.portfolio} 
            onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="Showreel / Website URL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Collab Taxonomy (Comma Separated)</Label>
        <Input 
          value={formData.colabText} 
          onChange={(e) => setFormData({...formData, colabText: e.target.value})}
          placeholder="e.g. Cinematic, High Contrast, Kerala Culture"
          className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
        />
      </div>

      <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between -mx-8 -mb-8 mt-4">
        <DialogClose asChild>
          <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal hover:bg-slate-100">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-8 h-11 gap-2 tracking-normal shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Add to Network
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
