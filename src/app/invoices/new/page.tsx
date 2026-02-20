"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  Receipt, 
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const PRODUCTION_ITEMS = [
  {
    id: "item-1",
    title: "Podcast",
    phase: "Pre Production",
    amount: 38000,
    status: "BUDGETED"
  },
  {
    id: "item-2",
    title: "TVC",
    phase: "Production",
    amount: 250000,
    status: "BUDGETED"
  }
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalRevenue = PRODUCTION_ITEMS
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);

  const handleDeploy = () => {
    // Navigate to the high-fidelity view
    router.push("/invoices/MRZL_202602_25/view");
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            Revenue Generation
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Synthesize production assets into a strategic billing document.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Content: Synthesis Form */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden p-10">
            <CardHeader className="p-0 mb-10">
              <CardTitle className="text-2xl font-bold font-headline text-slate-900">
                Client & Project Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                  Select Strategic Client
                </label>
                <Select defaultValue="gg">
                  <SelectTrigger className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 px-8 text-slate-900 font-bold focus:ring-primary/20">
                    <SelectValue placeholder="Identify client for billing..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="nike">Nike Global</SelectItem>
                    <SelectItem value="gg">GG</SelectItem>
                    <SelectItem value="apple">Apple EMEA</SelectItem>
                    <SelectItem value="airbnb">Airbnb Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Production Phases
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Aggregate Recurring</span>
                    <Checkbox className="h-5 w-5 rounded-md border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  {PRODUCTION_ITEMS.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-center gap-6">
                        <Checkbox 
                          checked={selectedItems.includes(item.id)}
                          className="h-6 w-6 rounded-lg border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        />
                        <div>
                          <h4 className="text-xl font-bold font-headline text-slate-900">{item.title}</h4>
                          <Badge className="mt-2 bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase px-3 py-1">
                            {item.phase}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold font-headline text-slate-900">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Summary and Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 blur-3xl -z-10" />
            
            <CardContent className="p-10 pt-12 space-y-12">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline text-slate-900">
                  Invoice Synthesis
                </h3>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Total Revenue
                </p>
                <h2 className="text-5xl font-bold font-headline tracking-tighter text-slate-900">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Payment Due Date
                </p>
                <div className="relative group">
                  <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                  <div className="h-16 w-full rounded-2xl bg-slate-50 border-none flex items-center px-8 text-slate-900 font-bold text-sm shadow-inner cursor-pointer hover:bg-slate-100/50 transition-colors">
                    15/02/2026
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleDeploy}
                className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                Deploy Invoice
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-50/50 p-8 flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">
                Auto-Aggregation
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Recurring projects for the same client are grouped for strategic clarity.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
