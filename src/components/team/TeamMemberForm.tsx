
"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2, Save, Mail, Phone, Briefcase, User } from "lucide-react";

interface TeamMemberFormProps {
  existingMember?: any;
}

const TEAM_ROLES = [
  "Director",
  "Writer",
  "Producer",
  "DOP",
  "Video Editor (Chief)",
  "Video Editor (Senior)",
  "Video Editor (Junior)",
  "Grading Artist",
  "Production Controller",
  "Production Manager",
  "Creative Director",
  "Art Director",
  "Sound Engineer",
  "Lighting Technician",
  "Production Assistant"
];

const MEMBER_TYPES = ["In-house", "Freelancer"];

export function TeamMemberForm({ existingMember }: TeamMemberFormProps) {
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    type: "In-house",
  });

  useEffect(() => {
    if (existingMember) {
      setFormData({
        firstName: existingMember.firstName || "",
        lastName: existingMember.lastName || "",
        email: existingMember.email || "",
        phone: existingMember.phone || "",
        roleId: existingMember.roleId || "",
        type: existingMember.type || "In-house",
      });
    }
  }, [existingMember]);

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roleId) {
      toast({ 
        variant: "destructive", 
        title: "Information Required", 
        description: "Please complete all mandatory fields to provision the member." 
      });
      return;
    }

    setIsSubmitting(true);
    
    const memberData = {
      ...formData,
      status: "Active",
      updatedAt: serverTimestamp(),
    };

    if (existingMember) {
      const memberRef = doc(db, "teamMembers", existingMember.id);
      updateDocumentNonBlocking(memberRef, memberData);
      toast({ title: "Intelligence Synchronized", description: `${formData.firstName}'s profile has been updated.` });
    } else {
      const teamRef = collection(db, "teamMembers");
      const newDocRef = doc(teamRef);
      setDocumentNonBlocking(newDocRef, {
        ...memberData,
        id: newDocRef.id,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "Member Provisioned", description: `${formData.firstName} has been added to the organization.` });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">First Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold tracking-normal focus-visible:ring-primary/20"
              placeholder="First Name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Last Name</Label>
          <Input 
            value={formData.lastName} 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="rounded-xl bg-slate-50 border-none h-12 font-bold tracking-normal focus-visible:ring-primary/20"
            placeholder="Last Name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              type="email"
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
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Role</Label>
          <Select value={formData.roleId} onValueChange={(val) => setFormData({...formData, roleId: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold tracking-normal focus:ring-primary/20">
              <SelectValue placeholder="Identify role..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
              {TEAM_ROLES.map(role => (
                <SelectItem key={role} value={role} className="font-medium tracking-normal">{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Member Type</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold tracking-normal focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {MEMBER_TYPES.map(t => (
                <SelectItem key={t} value={t} className="font-medium tracking-normal">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between -mx-8 -mb-8 mt-4">
        <DialogClose asChild>
          <Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-normal hover:bg-slate-100">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-8 h-11 gap-2 tracking-normal shadow-lg shadow-primary/20">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sync Member
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
