"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Printer, 
  Save, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
  Briefcase,
  IndianRupee,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { generateProposalContent, type ProposalOutput } from "@/ai/flows/proposal-generation-flow";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

/**
 * @fileOverview Strategic Proposal Intelligence Hub.
 * Manages AI synthesis and market validation for a specific bid.
 */

export default function ProposalIntelligencePage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeTab, setActiveTab] = useState("intelligence");

  const proposalRef = useMemoFirebase(() => doc(db, "proposals", proposalId), [db, proposalId]);
  const { data: proposal, isLoading } = useDoc(proposalRef);

  // MOCK Market Validation Logic
  const validation = useMemo(() => {
    if (!proposal) return null;
    const scope = proposal.scope || [];
    
    let demand: 'High' | 'Medium' | 'Low' = 'Medium';
    let advantage = "Standard production alignment.";
    let gap = "Standard competitive landscape.";

    if (scope.includes('AI Content Creation') || scope.includes('Influencer Marketing')) {
      demand = 'High';
      advantage = "Leveraging frontier tech and reach.";
      gap = "High demand for content repurposing.";
    } else if (scope.length < 2) {
      demand = 'Low';
      advantage = "Limited scope differentiation.";
      gap = "Opportunity to upsell AI content layer.";
    }

    return { demand, advantage, gap };
  }, [proposal]);

  const handleSynthesize = async () => {
    if (!proposal) return;
    setIsSynthesizing(true);
    try {
      const aiContent = await generateProposalContent({
        clientName: proposal.clientName,
        brandName: proposal.brandName,
        projectTitle: proposal.projectTitle,
        projectType: proposal.projectType,
        objective: proposal.objective,
        targetAudience: proposal.targetAudience,
        deliverables: proposal.deliverables,
        scope: proposal.scope,
        timeline: proposal.timeline,
        budgetRange: proposal.budgetRange,
      });

      await updateDoc(proposalRef, {
        aiContent,
        status: "Validated",
        updatedAt: serverTimestamp()
      });

      toast({ title: "Synthesis Complete", description: "AI content and strategy layers updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Failed", description: e.message });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const updateStatus = async (status: string) => {
    await updateDoc(proposalRef, { status, updatedAt: serverTimestamp() });
    toast({ title: "Workflow Synchronized", description: `Proposal status: ${status}` });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!proposal) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white border-slate-100 shadow-xl shadow-slate-200/20" onClick={() => router.push("/proposals")}>
            <ChevronLeft className="h-7 w-7 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">{proposal.projectTitle}</h1>
              <Badge className="bg-primary text-white border-none text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                {proposal.status}
              </Badge>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest opacity-60">
              {proposal.clientName} • {proposal.projectType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button onClick={handleSynthesize} disabled={isSynthesizing} className="h-14 px-10 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 tracking-normal transition-all active:scale-95 gap-3">
            {isSynthesizing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {proposal.aiContent ? "Re-Synthesize Intelligence" : "Generate Strategy"}
          </Button>
          <Button asChild variant="outline" className="h-14 px-10 rounded-full font-bold gap-3 bg-white border-slate-100 text-slate-600 hover:bg-slate-50 shadow-xl shadow-slate-200/20 transition-all active:scale-95">
            <Link href={`/proposals/${proposalId}/view`}>
              <Printer className="h-5 w-5" /> View Print Ready
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border border-slate-100 p-2 h-auto rounded-full shadow-2xl shadow-slate-200/30 gap-2 mb-10 inline-flex">
              <TabsTrigger value="intelligence" className="rounded-full px-10 py-4 text-xs font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest"><Sparkles className="h-4 w-4" /> AI Strategy</TabsTrigger>
              <TabsTrigger value="validation" className="rounded-full px-10 py-4 text-xs font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest"><BarChart3 className="h-4 w-4" /> Market Validation</TabsTrigger>
              <TabsTrigger value="parameters" className="rounded-full px-10 py-4 text-xs font-bold uppercase gap-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-widest"><FileText className="h-4 w-4" /> Core Brief</TabsTrigger>
            </TabsList>

            <TabsContent value="intelligence" className="m-0 animate-in fade-in duration-500">
              {proposal.aiContent ? (
                <div className="space-y-8">
                  {Object.entries(proposal.aiContent).map(([key, value]: [string, any]) => (
                    <Card key={key} className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden group hover:shadow-md transition-all border border-slate-50">
                      <div className="p-10 space-y-6">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-lg font-medium leading-relaxed text-slate-600 italic tracking-tight whitespace-pre-wrap">
                          {value}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-32 border-2 border-dashed border-slate-100 rounded-[4rem] text-center bg-slate-50/20 space-y-6">
                  <Sparkles className="h-12 w-12 text-slate-200 mx-auto" />
                  <div className="max-w-xs mx-auto">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synthesis Pending</p>
                    <p className="text-xs text-slate-300 mt-2 font-medium">Click "Generate Strategy" to analyze parameters and synthesize AI content.</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="validation" className="m-0 animate-in fade-in duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Demand Index</h3>
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold font-headline text-slate-900 tracking-tight">{validation?.demand}</span>
                      <Badge className={`${validation?.demand === 'High' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} border-none font-bold text-[10px] uppercase px-4`}>
                        LIVE SIGNAL
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${validation?.demand === 'High' ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: validation?.demand === 'High' ? '95%' : '60%' }} />
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-sm rounded-[3rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mr-24 -mt-24" />
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strategic Advantage</h3>
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-lg font-bold font-headline leading-tight tracking-tight">{validation?.advantage}</p>
                    <p className="text-xs text-slate-400 mt-4 font-medium leading-relaxed italic">
                      "Proposal validation confirms a unique production position relative to current competitor patterns."
                    </p>
                  </div>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline tracking-tight">Intelligence Gap Opportunity</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Strategic Refinement</p>
                  </div>
                </div>
                <div className="p-8 rounded-[2rem] bg-blue-50/50 border border-blue-100">
                  <p className="text-sm font-bold text-blue-900 leading-relaxed tracking-normal italic">
                    "{validation?.gap}"
                  </p>
                </div>
                {validation?.demand === 'Low' && (
                  <div className="flex items-start gap-4 p-6 rounded-2xl bg-orange-50 border border-orange-100">
                    <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-900 uppercase tracking-widest">Strategic Warning: Low Demand Scope</p>
                      <p className="text-xs text-orange-700 mt-1 font-medium leading-relaxed">Consider adding "AI Content Repurposing" or "Instagram Specific Vertical" to increase the perceived value and alignment with current market signals.</p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[3rem] bg-white p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Scope</p>
                      <div className="flex flex-wrap gap-2">
                        {proposal.scope?.map((s: string) => (
                          <Badge key={s} className="bg-slate-50 text-slate-500 border-none font-bold text-[9px] uppercase px-4 py-2 rounded-xl">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Platforms</p>
                      <div className="flex flex-wrap gap-2">
                        {proposal.platforms?.map((p: string) => (
                          <Badge key={p} className="bg-blue-50 text-blue-600 border-none font-bold text-[9px] uppercase px-4 py-2 rounded-xl">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Brief Narrative</p>
                      <p className="text-sm font-medium leading-relaxed text-slate-600 italic">
                        "{proposal.objective}"
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3.5rem] bg-white p-10 space-y-10">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive Decision</p>
              <h3 className="text-xl font-bold font-headline tracking-tight">Proposal Status</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {["Draft", "Under Review", "Validated", "Sent to Client", "Approved", "Rejected"].map((status) => (
                <Button 
                  key={status}
                  variant={proposal.status === status ? "default" : "outline"}
                  onClick={() => updateStatus(status)}
                  className={`h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all justify-start px-6 ${
                    proposal.status === status ? 'bg-primary border-none text-white' : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full mr-4 ${proposal.status === status ? 'bg-white' : 'bg-slate-200'}`} />
                  {status}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-2xl shadow-primary/20 rounded-[3rem] bg-slate-900 text-white p-10 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24" />
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quote Value</p>
              <h2 className="text-4xl font-bold font-headline tracking-tight">{proposal.budgetRange}</h2>
            </div>
            <div className="pt-8 border-t border-white/10 relative z-10 space-y-6">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-500">Timeline</span>
                <span className="text-primary">{proposal.timeline}</span>
              </div>
              <Button asChild className="w-full h-14 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-[10px] uppercase border-none tracking-widest shadow-2xl transition-all active:scale-95">
                <Link href={`/proposals/${proposalId}/view`}>Download B&W PDF</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
