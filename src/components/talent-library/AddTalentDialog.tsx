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
import { Plus } from "lucide-react";
import { TalentForm } from "./TalentForm";

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
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Provision New Identity</DialogTitle>
        </DialogHeader>
        <TalentForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}