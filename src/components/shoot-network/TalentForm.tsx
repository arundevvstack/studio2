
"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";

export function TalentForm() {
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    district: "",
    category: "",
    gender: "Male",
    colabText: "",
    paymentStage: "No",
    referredBy: "",
    social: "",
    portfolio: "",
  });

  const handleSave = () => {
    if (!formData.name || !formData.district || !formData.category) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name, District, and Category are required." });
      return;
    }

    setIsSubmitting(true);
    const talentRef = collection(db, "shoot_network");
    const newDocRef = doc(talentRef);
    
    const colabCategories = formData.colabText.split(',').map(s => s.trim()).filter(s => s);

    const talentData = {
      id: newDocRef.id,
      name: formData.name,
      age: formData.age,
      district: formData.district,
      category: formData.category,
      gender: formData.gender,
      colabCategories,
      paymentStage: formData.paymentStage,
      referredBy: formData.referredBy,
      socialMediaContact: formData.social,
      portfolio: formData.portfolio,
      isArchived: false,
      thumbnail: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(newDocRef, talentData, { merge: true });
    
    toast({ title: "Profile Initialized", description: `${formData.name} has been added to the repository.` });
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase">Category</Label>
          <Input 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="e.g. Models, DOP"
            className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase">District</Label>
          <Input 
            value={formData.district} 
            onChange={(e) => setFormData({...formData, district: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase">Gender</Label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none tracking-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase">Social Media URL</Label>
          <Input 
            value={formData.social} 
            onChange={(e) => setFormData({...formData, social: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase">Portfolio URL</Label>
          <Input 
            value={formData.portfolio} 
            onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase">Collab Categories (comma separated)</Label>
        <Input 
          value={formData.colabText} 
          onChange={(e) => setFormData({...formData, colabText: e.target.value})}
          placeholder="e.g. Commercial, Music Video, Fashion"
          className="rounded-xl bg-slate-50 border-none h-12 tracking-normal"
        />
      </div>

      <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between -mx-8 -mb-8">
        <DialogClose asChild>
          <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-8 h-11 gap-2 tracking-normal">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Partner
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
