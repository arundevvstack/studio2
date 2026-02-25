"use client";

import React from "react";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, ChevronLeft, Printer, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Print-Ready Strategic Proposal Viewport.
 * Clean Black & White formatting with professional spacing.
 * Dynamically fetches Organization branding and details.
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

  if (isProposalLoading || isSettingsLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Synthesizing Document Identity...</p>
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
        <section className="h-[1100px] flex flex-col justify-between p-24 relative overflow-hidden">
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

        {/* Contents */}
        <section className="min-h-[1100px] p-24 space-y-20 page-break-after">
          <h2 className="text-3xl font-bold font-headline tracking-tight border-b-2 border-slate-900 pb-6">Table of Contents</h2>
          <div className="space-y-8">
            {[
              "Introduction & Context", 
              "Understanding of Requirements", 
              "Strategic Approach", 
              "Execution Roadmap", 
              "Deliverables & Assets", 
              "Project Timeline", 
              "Financial Ledger", 
              "Investment Narrative",
              "Agency Credentials"
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-lg">
                <span className="font-bold tracking-tight">{i + 1}. {item}</span>
                <span className="flex-1 mx-4 border-b border-dotted border-slate-200" />
                <span className="text-slate-400 font-medium">0{i + 2}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Sections */}
        {proposal.aiContent && Object.entries(proposal.aiContent).map(([key, value]: [string, any], idx) => {
          if (key === 'investmentNarrative') return null; // Handle specifically below
          return (
            <section key={key} className="min-h-[1100px] p-24 space-y-12 page-break-after border-t border-slate-50 first:border-none">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Section 0{idx + 2}</p>
                <h2 className="text-4xl font-bold font-headline tracking-tight capitalize">{key.replace(/([A-Z])/g, ' $1')}</h2>
              </div>
              <div className="prose max-w-none text-xl leading-[1.8] text-slate-700 whitespace-pre-wrap font-serif">
                {value}
              </div>
            </section>
          );
        })}

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
        }
      `}</style>
    </div>
  );
}
