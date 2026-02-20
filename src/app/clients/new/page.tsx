"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  Briefcase, 
  Globe, 
  Mail, 
  Phone, 
  Users, 
  SendHorizontal,
  MapPin,
  ReceiptText,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, useAuth } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export default function AddClientPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstin: "",
    address: "",
    notes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide at least a brand name and email."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const clientsRef = collection(db, "clients");
      const newClientRef = doc(clientsRef);
      const clientId = newClientRef.id;

      const clientData = {
        id: clientId,
        name: formData.name,
        companyName: formData.name, // Using name as companyName for now
        industry: formData.industry,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        gstin: formData.gstin,
        address: formData.address,
        notes: formData.notes,
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      setDocumentNonBlocking(newClientRef, clientData, { merge: true });
      
      toast({
        title: "Success",
        description: `${formData.name} has been added to your portfolio.`
      });

      router.push("/clients");
    } catch (error) {
      console.error("Error adding client:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-start gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-xl bg-white border-slate-200 shadow-sm shrink-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">
            Onboard Client
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Register a new strategic partnership in your portfolio.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        {/* Top Accent Border (Purple for Clients) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#a855f7]" />
        
        <div className="p-10 space-y-12">
          {/* Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Client Brand Name
              </label>
              <div className="relative">
                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Nike Global" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Industry Vertical
              </label>
              <div className="relative">
                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g. Consumer Electronics" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Primary Contact Person
              </label>
              <div className="relative">
                <Users className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Executive Email
              </label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. j.doe@nike.com" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* New Grid Row: Phone & GSTIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                GSTIN Number
              </label>
              <div className="relative">
                <ReceiptText className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  placeholder="e.g. 22AAAAA0000A1Z5" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
              Physical Office Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-6 top-7 h-4 w-4 text-slate-300" />
              <Textarea 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g. 123 Innovation Drive, Silicon Valley, CA 94025"
                className="pl-14 min-h-[100px] rounded-2xl bg-slate-50 border-none shadow-inner text-base p-6 focus-visible:ring-primary/20 resize-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Partnership Brief */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
              Strategic Brief
            </label>
            <Textarea 
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Outline the client's core objectives and long-term partnership goals..."
              className="min-h-[200px] rounded-2xl bg-slate-50 border-none shadow-inner text-base p-8 focus-visible:ring-primary/20 resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Form Footer */}
        <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-end gap-10">
          <Button 
            type="button"
            variant="ghost" 
            className="text-slate-900 font-bold text-sm hover:bg-transparent"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="h-14 px-10 rounded-xl bg-[#a855f7] hover:bg-[#a855f7]/90 text-white font-bold text-base shadow-lg shadow-purple-200 gap-3 group"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Add Client
                <SendHorizontal className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
