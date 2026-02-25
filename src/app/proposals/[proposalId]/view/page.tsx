"use client";

import React, { useMemo } from "react";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  Loader2, 
  ChevronLeft, 
  Printer, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Globe,
  IndianRupee,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

/**
 * @fileOverview High-Fidelity Strategic Proposal Viewport.
 * Integrates all AI-generated content with real-time Market Intelligence and Competitor Analysis.
 * Features data visualizations and infographics optimized for professional printing.
 */

export default function ProposalPrintView({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const proposalRef = useMemoFirebase(() => {
    if (!user || !proposalId) return null;
    return doc(db, "proposals", proposalId);
  }, [db, proposalId, user]);
  const { data: proposal, isLoading: isProposalLoading } = useDoc(proposalRef);

  const billingSettingsRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: globalSettings, isLoading: isSettingsLoading } = useDoc(billingSettingsRef);

  // Replicate Validation Logic for the Print View
  const validation = useMemo(() => {
    if (!proposal) return null;
    const scope = proposal.scope || [];
    const totalBudget = proposal.totalBudget || 0;
    
    let demand: 'High' | 'Medium' | 'Low' = 'Medium';
    let competitorSummary = "Standard agencies focusing on traditional production timelines.";
    let opportunityGap = "Limited focus on AI-driven asset repurposing and creator-led distribution.";
    let trendSummary = "Increasing demand for cross-platform visual consistency.";
    let avgBudget = 75000;

    if (scope.includes('AI Content Creation') && scope.includes('Social Media Management')) {
      demand = 'High';
      avgBudget = 120000;
      competitorSummary = "Creative boutiques offering high-cost bespoke production without AI speed.";
      opportunityGap = "Immediate need for VFX-led storytelling at performance marketing speeds.";
      trendSummary = "Brands shifting budgets from TVC to high-fidelity 'Synthetic Media' for Reels/TikTok.";
    } else if (scope.includes('Influencer Marketing')) {
      demand = 'High';
      avgBudget = 150000;
      competitorSummary = "Talent agencies with high commissions and slow execution cycles.";
      opportunityGap = "Integrating internal production with influencer reach to cut costs.";
      trendSummary = "Rise of the 'In-house Creator' model within agencies.";
    } else if (scope.length < 2) {
      demand = 'Low';
      avgBudget = 40000;
      competitorSummary = "Freelance networks undercutting on price for single-asset delivery.";
      opportunityGap = "Upsell into multi-asset strategic campaigns.";
      trendSummary = "Commoditization of single-asset production.";
    }

    const chartData = [
      { name: 'Your Quote', value: totalBudget },
      { name: 'Industry Avg', value: avgBudget },
    ];

    return { 
      demand, 
      competitorSummary, 
      opportunityGap, 
      trendSummary, 
      avgBudget,
      chartData
    };
  }, [proposal]);

  if (isProposalLoading || isSettingsLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Synthesizing Document Identity...</p>
      </div>
    );
  }

  if (!proposal) return null;

  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const companyName = globalSettings?.companyName || "Organization Name";
  const companyAddress = globalSettings?.companyAddress || "Headquarters Address not configured.";

  return (
    <div className="min-h-screen bg-slate-100/50 p-4 md:p-12 animate-in fade-in duration-1000 print:bg-white print:p-0">
      {/* Strategic Controls */}
      <div className="max-w-[900px] mx-auto mb-10 flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
          <ChevronLeft className="h-4 w-4" /> Return to Intelligence
        </Button>
        <Button onClick={() => window.print()} className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold gap-3 shadow-xl">
          <Printer className="h-4 w-4" /> Print Document
        </Button>
      </div>

      {/* Main Print Artifact */}
      <div className="max-w-[900px] mx-auto bg-white shadow-2xl print:shadow-none font-serif text-slate-900 leading-relaxed">
        
        {/* Cover Page */}
        <section className="h-[1100px] flex flex-col justify-between p-24 relative overflow-hidden page-break-after">
          <div className="space-y-6">
            {globalSettings?.logo ? (
              <img src={globalSettings.logo} alt="Org Logo" className="h-16 w-auto object-contain grayscale brightness-0" />
            ) : (
              <div className="h-1 w-20 bg-slate-900" />
            )}
            <p className="text-sm font-bold tracking-[0.3em] uppercase">Strategic Production Proposal</p>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <p className="text-xl font-medium text-slate-500 uppercase tracking-widest">Prepared For</p>
              <h1 className="text-7xl font-bold font-headline leading-tight tracking-tight">{proposal.clientName}</h1>
              <p className="text-2xl text-slate-400 font-medium">{proposal.brandName}</p>
            </div>

            <div className="h-px w-full bg-slate-100" />

            <div className="space-y-2">
              <p className="text-lg font-bold uppercase tracking-widest">{proposal.projectTitle}</p>
              <p className="text-sm text-slate-500 font-medium">{proposal.projectType} • {date}</p>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-slate-100 pt-12">
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-widest">{companyName}</p>
              <p className="text-[10px] text-slate-400 font-medium max-w-[300px] leading-relaxed">{companyAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Confidential Executive Briefing</p>
            </div>
          </div>
        </section>

        {/* Introduction & Context */}
        {proposal.aiContent?.introduction && (
          <section className="min-h-[1100px] p-24 space-y-12 page-break-after">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Section 01</p>
              <h2 className="text-4xl font-bold font-headline tracking-tight">Executive Summary</h2>
            </div>
            <div className="prose max-w-none text-xl leading-[1.8] text-slate-700 whitespace-pre-wrap font-serif">
              {proposal.aiContent.introduction}
            </div>
            <div className="pt-12">
              <img 
                src="https://picsum.photos/seed/proposal-hero/800/400" 
                alt="Vision" 
                className="w-full rounded-sm grayscale shadow-sm"
                data-ai-hint="cinematic studio"
              />
            </div>
          </section>
        )}

        {/* Market Insights & Validation (Analysis Section) */}
        <section className="min-h-[1100px] p-24 space-y-12 page-break-after bg-slate-50/20">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Section 02</p>
            <h2 className="text-4xl font-bold font-headline tracking-tight">Market Intelligence</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-12 pt-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Market Demand Index
                </h3>
                <div className="p-8 border-2 border-slate-900 flex flex-col items-center justify-center text-center">
                  <span className="text-6xl font-bold font-headline">{validation?.demand}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Current Industry Signal</p>
                </div>
                <p className="text-sm text-slate-600 font-medium italic">
                  "{validation?.trendSummary}"
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" /> Budget Benchmarking
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={validation?.chartData}>
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                      <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Your Investment vs Industry Benchmark</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <Compass className="h-4 w-4" /> Strategic Positioning
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-white border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Competitor Landscape</p>
                    <p className="text-sm font-medium leading-relaxed">{validation?.competitorSummary}</p>
                  </div>
                  <div className="p-6 bg-slate-900 text-white shadow-xl">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap className="h-3 w-3" /> The Strategic Advantage
                    </p>
                    <p className="text-sm font-bold leading-relaxed italic">"{validation?.opportunityGap}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Approach */}
        {proposal.aiContent?.strategicApproach && (
          <section className="min-h-[1100px] p-24 space-y-12 page-break-after">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Section 03</p>
              <h2 className="text-4xl font-bold font-headline tracking-tight">Strategic Approach</h2>
            </div>
            <div className="prose max-w-none text-xl leading-[1.8] text-slate-700 whitespace-pre-wrap font-serif">
              {proposal.aiContent.strategicApproach}
            </div>
            <div className="grid grid-cols-3 gap-6 pt-12">
              <div className="p-6 border border-slate-100 text-center">
                <Zap className="h-8 w-8 mx-auto mb-4 text-slate-900" />
                <p className="text-xs font-bold uppercase tracking-widest">Rapid Prototyping</p>
              </div>
              <div className="p-6 border border-slate-100 text-center">
                <Target className="h-8 w-8 mx-auto mb-4 text-slate-900" />
                <p className="text-xs font-bold uppercase tracking-widest">Precision Targeting</p>
              </div>
              <div className="p-6 border border-slate-100 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-4 text-slate-900" />
                <p className="text-xs font-bold uppercase tracking-widest">Data Verification</p>
              </div>
            </div>
          </section>
        )}

        {/* Financial Ledger Section */}
        <section className="min-h-[1100px] p-24 space-y-12 page-break-after border-t border-slate-50">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Section 08</p>
            <h2 className="text-4xl font-bold font-headline tracking-tight">Financial Ledger</h2>
          </div>
          <div className="mt-12 overflow-hidden border border-slate-900 rounded-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-6 text-xs font-bold uppercase tracking-widest">Description</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-center">Qty</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-right">Unit Price</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(proposal.lineItems || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="p-6 text-sm font-bold text-slate-900">{item.description}</td>
                    <td className="p-6 text-sm text-slate-500 text-center">{item.quantity}</td>
                    <td className="p-6 text-sm text-slate-500 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-6 text-sm font-bold text-slate-900 text-right">₹{item.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={3} className="p-6 text-sm font-bold text-slate-900 uppercase tracking-widest text-right">Total Investment</td>
                  <td className="p-6 text-xl font-bold text-slate-900 text-right">₹{(proposal.totalBudget || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {proposal.aiContent?.investmentNarrative && (
            <div className="mt-12 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Investment Narrative</h3>
              <div className="text-lg leading-relaxed text-slate-600 italic font-serif">
                {proposal.aiContent.investmentNarrative}
              </div>
            </div>
          )}
        </section>

        {/* Commercial Terms */}
        <section className="min-h-[1100px] p-24 space-y-16 page-break-after bg-slate-50/30">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Section 10</p>
            <h2 className="text-4xl font-bold font-headline tracking-tight">Terms & Conditions</h2>
          </div>
          <div className="grid grid-cols-1 gap-12 text-sm text-slate-600 font-medium">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest">Payment Structure</h4>
              <p>50% advance mobilization fee required at project initiation. 30% upon completion of primary production. 20% on final asset delivery.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest">Intellectual Property</h4>
              <p>Full usage rights transfer to the client upon final settlement. Raw project files remain the property of the agency unless otherwise negotiated.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest">Validity</h4>
              <p>This strategic proposal and the associated investment summary are valid for 15 calendar days from the date of issue.</p>
            </div>
          </div>
        </section>

        {/* Signature Page */}
        <section className="min-h-[1100px] p-24 flex flex-col justify-between">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold font-headline tracking-tight">Authorization</h2>
            <p className="text-xl text-slate-500 font-medium">By signing below, both parties agree to the terms and strategic direction outlined in this proposal.</p>
          </div>

          <div className="grid grid-cols-2 gap-24 pt-32">
            <div className="space-y-12">
              <div className="h-24 w-full border-b border-slate-900" />
              <div>
                <p className="font-bold uppercase tracking-widest text-slate-900">For {companyName}</p>
                <p className="text-sm text-slate-400 font-medium mt-1">Authorized Strategic Signatory</p>
              </div>
            </div>
            <div className="space-y-12">
              <div className="h-24 w-full border-b border-slate-900" />
              <div>
                <p className="font-bold uppercase tracking-widest text-slate-900">For {proposal.clientName}</p>
                <p className="text-sm text-slate-400 font-medium mt-1">Authorized Client Signatory</p>
              </div>
            </div>
          </div>

          <div className="pt-24 text-center">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase text-slate-900">{companyName}</p>
              <p className="text-[10px] text-slate-400">{companyAddress}</p>
            </div>
            <p className="text-[10px] font-bold text-slate-200 uppercase tracking-[0.5em]">END OF STRATEGIC PROPOSAL</p>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .page-break-after { page-break-after: always; }
          @page { margin: 0; }
          .recharts-responsive-container {
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
