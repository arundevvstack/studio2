"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { TalentForm } from "./TalentForm";

/**
 * @fileOverview Talent Onboarding Portal.
 * Enhanced wrapper for the high-fidelity onboarding engine.
 */

export function AddTalentDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal transition-all active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Onboard Talent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-10 pb-0 bg-white">
          <DialogTitle className="text-3xl font-bold font-headline flex items-center gap-3 tracking-tight">
            <Sparkles className="h-7 w-7 text-primary" />
            Provision New Identity
          </DialogTitle>
        </DialogHeader>
        <TalentForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}