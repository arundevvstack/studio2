
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
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, doc, serverTimestamp, orderBy, updateDoc, writeBatch } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save, Mail, Phone, Briefcase, User, Upload, ShieldCheck, Trash2, AlertTriangle, BadgeCheck, Layers } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamMemberFormProps {
  existingMember?: any;
  onSuccess?: () => void;
}

const MEMBER_TYPES = ["In-house", "Freelancer"];
const DEPARTMENTS = ["Marketing", "Sales", "Admin", "Production", "HR", "Operations"];

export function TeamMemberForm({ existingMember, onSuccess }: TeamMemberFormProps) {
  const db = useFirestore();
  const { user: currentUser } = useUser();
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
    department: "Production",
    thumbnail: "",
  });

  // Fetch Current User Role for Gating
  const currentUserRef = useMemoFirebase(() => {
    if (!currentUser) return null;
    return doc(db, "users", currentUser.uid);
  }, [db, currentUser]);
  const { data: currentUserData } = useDoc(currentUserRef);

  const isAuthorizedAdmin = currentUserData?.role === 'admin' || currentUserData?.email === 'defineperspective.in@gmail.com';
  const isEditingSelf = existingMember?.id === currentUser?.uid;

  // Dynamic Roles Sync
  const rolesQuery = useMemoFirebase(() => query(collection(db, "roles"), orderBy("name", "asc")), [db]);
  const { data: roles, isLoading: rolesLoading } = useCollection(rolesQuery);

  useEffect(() => {
    if (existingMember && !isInitialized) {
      // Logic to split 'name' into first/last if separate fields are missing
      let fName = existingMember.firstName || "";
      let lName = existingMember.lastName || "";
      
      if (!fName && !lName && existingMember.name) {
        const parts = existingMember.name.split(" ");
        fName = parts[0] || "";
        lName = parts.slice(1).join(" ") || "";
      }

      setFormData({
        firstName: fName,
        lastName: lName,
        email: existingMember.email || "",
        phone: existingMember.phone || "",
        roleId: existingMember.role || existingMember.roleId || "",
        type: existingMember.type || "In-house",
        status: (existingMember.status === 'active' || existingMember.status === 'Active') ? "Active" : 
                (existingMember.status === 'suspended' || existingMember.status === 'Suspended') ? "Suspended" : "Pending",
        department: existingMember.department || "Production",
        thumbnail: existingMember.thumbnail || existingMember.photoURL || "",
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
        setFormData(prev => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({ 
        variant: "destructive", 
        title: "Incomplete Identity", 
        description: "Name and Email are required." 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const batch = writeBatch(db);
      const memberData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      const registryData: any = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email.toLowerCase(),
        photoURL: formData.thumbnail,
        updatedAt: serverTimestamp()
      };

      // Only sync role/status if admin or not editing self
      if (isAuthorizedAdmin) {
        registryData.role = formData.roleId;
        registryData.status = formData.status === 'Active' ? 'active' : formData.status === 'Suspended' ? 'suspended' : 'pending';
        registryData.strategicPermit = formData.status === 'Active';
      }

      if (existingMember) {
        batch.update(doc(db, "teamMembers", existingMember.id), memberData);
        batch.update(doc(db, "users", existingMember.id), registryData);
      } else {
        const newRef = doc(collection(db, "teamMembers"));
        const newRegistryRef = doc(db, "users", newRef.id);
        batch.set(newRef, { ...memberData, id: newRef.id, createdAt: serverTimestamp() });
        batch.set(newRegistryRef, { 
          ...registryData, 
          id: newRef.id, 
          provider: 'password', 
          permittedPhases: [], 
          role: formData.roleId,
          status: formData.status === 'Active' ? 'active' : 'pending',
          strategicPermit: formData.status === 'Active',
          createdAt: serverTimestamp() 
        });
      }

      await batch.commit();
      toast({ title: "Identity Synchronized", description: "Records updated across system nodes." });
      onSuccess?.();
    } catch (error: any) {
      console.error("Save Error:", error);
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingMember || !isAuthorizedAdmin) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "teamMembers", existingMember.id));
      batch.delete(doc(db, "users", existingMember.id));
      await batch.commit();
      toast({ variant: "destructive", title: "User Deleted", description: "Identity removed from system." });
      onSuccess?.();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: e.message });
    }
  };

  return (
    <div className="p-10 space-y-10 max-h-[85vh] overflow-y-auto custom-scrollbar bg-white">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group cursor-pointer" onClick={handleThumbnailClick}>
          <Avatar className="h-32 w-32 border-8 border-slate-50 shadow-2xl rounded-[10px] transition-all group-hover:scale-105">
            <AvatarImage src={formData.thumbnail} className="object-cover" />
            <AvatarFallback className="bg-slate-100"><Upload className="h-10 w-10 text-slate-300" /></AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-[10px] backdrop-blur-[2px]">
            <Badge className="bg-white text-slate-900 border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">Change Portrait</Badge>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Identifier Photo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">First Name</Label>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="rounded-[10px] bg-slate-50 border-none h-14 pl-14 font-bold text-base shadow-inner" placeholder="Rahul" />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Last Name</Label>
          <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="rounded-[10px] bg-slate-50 border-none h-14 font-bold text-base shadow-inner" placeholder="Nair" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Work Email</Label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-[10px] bg-slate-50 border-none h-14 pl-14 font-bold text-base shadow-inner" placeholder="r.nair@marzelz.com" />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hotline Number</Label>
          <div className="relative">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-[10px] bg-slate-50 border-none h-14 pl-14 font-bold text-base shadow-inner" placeholder="+91 0000 0000" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategic Department</Label>
          <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})}>
            <SelectTrigger className="h-14 rounded-[10px] bg-slate-50 border-none font-bold text-lg shadow-inner px-6"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl shadow-2xl">
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategic Role</Label>
          <Select disabled={!isAuthorizedAdmin} value={formData.roleId} onValueChange={(val) => setFormData({...formData, roleId: val})}>
            <SelectTrigger className="h-14 rounded-[10px] bg-slate-50 border-none font-bold text-lg shadow-inner px-6">
              <SelectValue placeholder="Assign Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-2xl">
              {roles?.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
              <SelectItem value="admin">ROOT ADMINISTRATOR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Resource Type</Label>
          <Select disabled={!isAuthorizedAdmin} value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
            <SelectTrigger className="h-14 rounded-[10px] bg-slate-50 border-none font-bold text-lg shadow-inner px-6"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl shadow-2xl">
              {MEMBER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Access Status</Label>
          <Select disabled={!isAuthorizedAdmin} value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
            <SelectTrigger className={`h-14 rounded-[10px] bg-slate-50 border-none font-bold text-lg shadow-inner px-6 ${formData.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl shadow-2xl">
              <SelectItem value="Active" className="text-green-600 font-bold">Authorized</SelectItem>
              <SelectItem value="Pending" className="text-orange-600 font-bold">Pending</SelectItem>
              <SelectItem value="Suspended" className="text-red-600 font-bold">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="bg-slate-50 p-10 flex justify-between items-center -mx-10 -mb-10 mt-10 rounded-b-[10px]">
        <div className="flex items-center gap-4">
          <DialogClose asChild><Button variant="ghost" className="text-slate-500 font-bold text-xs uppercase tracking-widest">Discard</Button></DialogClose>
          {existingMember && isAuthorizedAdmin && !isEditingSelf && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive font-bold text-xs uppercase tracking-widest gap-2 hover:bg-destructive/5 hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[10px] border-none shadow-2xl">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 text-destructive mb-2">
                    <AlertTriangle className="h-6 w-6" />
                    <AlertDialogTitle className="font-headline text-xl">Confirm Delete User</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                    This will permanently remove <span className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</span> from the organizational registry.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-6">
                  <AlertDialogCancel className="rounded-[10px] font-bold text-xs uppercase tracking-normal">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white rounded-[10px] font-bold px-8 uppercase text-xs tracking-normal">Confirm Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-[10px] font-bold px-12 h-14 gap-3 shadow-2xl shadow-primary/20 transition-all active:scale-95">
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          {existingMember ? 'Sync Identity' : 'Provision User'}
        </Button>
      </DialogFooter>
    </div>
  );
}
