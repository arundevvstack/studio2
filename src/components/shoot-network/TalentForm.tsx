
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
import { Loader2, Save, Mail, Phone, Upload, X, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TalentFormProps {
  existingTalent?: any;
}

export function TalentForm({ existingTalent }: TalentFormProps) {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  
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
    social: "",
    portfolio: "",
    rank: 5,
    projectCount: 0,
    suitableTypesText: "",
    thumbnail: "",
  });

  useEffect(() => {
    if (existingTalent) {
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
        social: existingTalent.socialMediaContact || "",
        portfolio: existingTalent.portfolio || "",
        rank: existingTalent.rank || 5,
        projectCount: existingTalent.projectCount || 0,
        suitableTypesText: existingTalent.suitableProjectTypes?.join(', ') || "",
        thumbnail: existingTalent.thumbnail || "",
      });
      if (existingTalent.thumbnail) setPreviewThumbnail(existingTalent.thumbnail);
    }
  }, [existingTalent]);

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewThumbnail(reader.result as string);
        setFormData(prev => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.district || !formData.category) {
      toast({ variant: "destructive", title: "Validation Error", description: "Identity, Location, and Creative Category are required fields." });
      return;
    }

    setIsSubmitting(true);
    
    const colabCategories = formData.colabText.split(',').map(s => s.trim()).filter(s => s);
    const suitableProjectTypes = formData.suitableTypesText.split(',').map(s => s.trim()).filter(s => s);

    const talentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
      district: formData.district,
      category: formData.category,
      gender: formData.gender,
      colabCategories,
      suitableProjectTypes,
      paymentStage: formData.paymentStage,
      referredBy: formData.referredBy,
      socialMediaContact: formData.social,
      portfolio: formData.portfolio,
      rank: Number(formData.rank),
      projectCount: Number(formData.projectCount),
      thumbnail: formData.thumbnail,
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
    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
      {/* Thumbnail Upload Area */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div 
          className="relative group cursor-pointer"
          onClick={handleThumbnailClick}
        >
          <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-xl rounded-[2.5rem] transition-all group-hover:opacity-80">
            <AvatarImage src={previewThumbnail || ""} />
            <AvatarFallback className="bg-slate-100">
              <Upload className="h-8 w-8 text-slate-300" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge className="bg-black/50 text-white border-none">Change Photo</Badge>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
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
          <Input 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="e.g. Models, DOP, Stylist"
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Communication Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold tracking-normal focus-visible:ring-primary/20"
              placeholder="name@agency.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Contact Hotline</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold tracking-normal focus-visible:ring-primary/20"
              placeholder="+91 0000 000 000"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Suitable Project Types (Comma Separated)</Label>
        <Input 
          value={formData.suitableTypesText} 
          onChange={(e) => setFormData({...formData, suitableTypesText: e.target.value})}
          placeholder="e.g. Commercial, Film, Fashion Show, Social Media"
          className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">District Hub</Label>
          <Input 
            value={formData.district} 
            onChange={(e) => setFormData({...formData, district: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="Kerala District"
          />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Age</Label>
          <Input 
            value={formData.age} 
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="Partner Age"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Verification Tier</Label>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Social Reach URL</Label>
          <Input 
            value={formData.social} 
            onChange={(e) => setFormData({...formData, social: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="Instagram / LinkedIn URL"
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
          placeholder="e.g. Commercial, Music Video, Fashion, Editorial"
          className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Source / Referral</Label>
        <Input 
          value={formData.referredBy} 
          onChange={(e) => setFormData({...formData, referredBy: e.target.value})}
          placeholder="Who introduced this partner?"
          className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
        />
      </div>

      <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between -mx-8 -mb-8">
        <DialogClose asChild>
          <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal hover:bg-slate-100">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-8 h-11 gap-2 tracking-normal shadow-lg shadow-primary/20">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sync Intelligence
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
