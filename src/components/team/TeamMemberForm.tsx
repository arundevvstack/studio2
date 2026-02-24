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
import { Loader2, Save, Mail, Phone, Briefcase, User, Upload, ShieldCheck, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamMemberFormProps {
  existingMember?: any;
}

const MEMBER_TYPES = ["In-house", "Freelancer"];

/**
 * @fileOverview Strategic Team Member Provisioning Form.
 * Connects personnel identity with dynamic system roles.
 */
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
    status: "Active",
    thumbnail: "",
  });

  // Dynamic Roles Sync
  const rolesQuery = useMemoFirebase(() => query(collection(db, "roles"), orderBy("name", "asc")), [db]);
  const { data: roles, isLoading: rolesLoading } = useCollection(rolesQuery);

  useEffect(() => {
    if (existingMember && !isInitialized) {
      setFormData({
        firstName: existingMember.firstName || "",
        lastName: existingMember.lastName || "",
        email: existingMember.email || "",
        phone: existingMember.phone || "",
        roleId: existingMember.roleId || "",
        type: existingMember.type || "In-house",
        status: existingMember.status || "Active",
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
        title: "Provisioning Gap", 
        description: "Identify name, email, and strategic role to authorize user access." 
      });
      return;
    }

    setIsSubmitting(true);
    
    const memberData = {
      ...formData,
      updatedAt: serverTimestamp(),
    };

    if (existingMember) {
      const memberRef = doc(db, "teamMembers", existingMember.id);
      updateDocumentNonBlocking(memberRef, memberData);
      toast({ title: "Intelligence Synchronized", description: `${formData.firstName}'s identity has been updated.` });
    } else {
      const teamRef = collection(db, "teamMembers");
      const newDocRef = doc(teamRef);
      setDocumentNonBlocking(newDocRef, {
        ...memberData,
        id: newDocRef.id,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "User Provisioned", description: `${formData.firstName} added to the organizational engine.` });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-10 space-y-10 max-h-[85vh] overflow-y-auto custom-scrollbar bg-white">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={handleThumbnailClick}>
          <Avatar className="h-32 w-32 border-8 border-slate-50 shadow-2xl rounded-[3rem] transition-all group-hover:scale-105">
            <AvatarImage src={formData.thumbnail || ""} className="object-cover" />
            <AvatarFallback className="bg-slate-100"><Upload className="h-8 w-8 text-slate-300" /></AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-[3rem] backdrop-blur-[2px]">
            <Badge className="bg-white text-slate-900 border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Change Portrait</Badge>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive Identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">First Name</Label>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-14 pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20" placeholder="e.g. Rahul" />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Last Name</Label>
          <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-14 font-bold text-base shadow-inner focus-visible:ring-primary/20" placeholder="e.g. Nair" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Executive Email</Label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-14 pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20" placeholder="r.nair@agency.com" />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Contact Hotline</Label>
          <div className="relative">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-14 pl-14 font-bold text-base shadow-inner focus-visible:ring-primary/20" placeholder="+91 0000 0000" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Connect System Role</Label>
          <Select value={formData.roleId} onValueChange={(val) => setFormData({...formData, roleId: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner px-6 focus:ring-primary/20">
              <SelectValue placeholder={rolesLoading ? "Syncing Roles..." : "Assign Professional Title"} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
              {roles?.map(role => (
                <SelectItem key={role.id} value={role.id} className="font-bold text-slate-900">{role.name}</SelectItem>
              ))}
              {(!roles || roles.length === 0) && !rolesLoading && (
                <SelectItem value="none" disabled>No roles found. Create roles in Settings.</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Resource Type</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner px-6 focus:ring-primary/20"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {MEMBER_TYPES.map(t => <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Account Access</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status Policy</p>
          </div>
        </div>
        <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
          <SelectTrigger className="h-10 w-32 rounded-xl bg-white border-slate-100 font-bold text-[10px] uppercase tracking-widest shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="Active" className="text-green-600 font-bold">Active</SelectItem>
            <SelectItem value="Suspended" className="text-red-600 font-bold">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="bg-slate-50 p-10 flex justify-between items-center -mx-10 -mb-10 mt-10 rounded-b-[3.5rem]">
        <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-transparent">Discard</Button></DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-12 h-14 gap-3 tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            Sync Identity
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
