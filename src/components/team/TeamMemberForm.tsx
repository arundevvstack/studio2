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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save, Mail, Phone, Briefcase, User, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamMemberFormProps {
  existingMember?: any;
}

const MEMBER_TYPES = ["In-house", "Freelancer"];

export function TeamMemberForm({ existingMember }: TeamMemberFormProps) {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    type: "In-house",
    thumbnail: "",
  });

  // Dynamic Roles
  const rolesQuery = useMemoFirebase(() => query(collection(db, "roles"), orderBy("name", "asc")), [db]);
  const { data: roles } = useCollection(rolesQuery);

  useEffect(() => {
    if (existingMember && !isInitialized) {
      setFormData({
        firstName: existingMember.firstName || "",
        lastName: existingMember.lastName || "",
        email: existingMember.email || "",
        phone: existingMember.phone || "",
        roleId: existingMember.roleId || "",
        type: existingMember.type || "In-house",
        thumbnail: existingMember.thumbnail || "",
      });
      setIsInitialized(true);
    }
  }, [existingMember, isInitialized]);

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, thumbnail: base64String }));
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      toast({ title: "Intelligence Synchronized", description: `${formData.firstName}'s profile updated.` });
    } else {
      const teamRef = collection(db, "teamMembers");
      const newDocRef = doc(teamRef);
      setDocumentNonBlocking(newDocRef, {
        ...memberData,
        id: newDocRef.id,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "Member Provisioned", description: `${formData.firstName} added to organization.` });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={handleThumbnailClick}>
          <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-xl rounded-[2.5rem] transition-all group-hover:opacity-80">
            <AvatarImage src={formData.thumbnail || ""} className="object-cover" />
            <AvatarFallback className="bg-slate-100"><Upload className="h-8 w-8 text-slate-300" /></AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge className="bg-black/50 text-white border-none rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-normal">Change Photo</Badge>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Member Portrait</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">First Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold focus-visible:ring-primary/20" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Last Name</Label>
          <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 font-bold focus-visible:ring-primary/20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Executive Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold focus-visible:ring-primary/20" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Contact Hotline</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 pl-12 font-bold focus-visible:ring-primary/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Strategic Role</Label>
          <Select value={formData.roleId} onValueChange={(val) => setFormData({...formData, roleId: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold focus:ring-primary/20">
              <SelectValue placeholder="Identify role..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
              {roles?.map(role => (
                <SelectItem key={role.id} value={role.id} className="font-medium">{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Member Type</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold focus:ring-primary/20"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {MEMBER_TYPES.map(t => <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="bg-slate-50 p-6 flex justify-between items-center sm:justify-between -mx-8 -mb-8 mt-4">
        <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase hover:bg-slate-100">Cancel</Button></DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-8 h-11 gap-2 shadow-lg shadow-primary/20">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sync Member
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
