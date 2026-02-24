
"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview High-fidelity Invoice View viewport Client component.
 * Consolidates production metadata into a professional billing document.
 */

function InvoiceViewContent({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user } = useUser();

  const paramDueDate = searchParams.get('dueDate');

  // Retrieve project entity
  const projectRef = useMemoFirebase(() => {
    if (!user || !invoiceId) return null;
    return doc(db, "projects", invoiceId);
  }, [db, invoiceId, user]);
  const { data: project, isLoading: isProjectLoading } = useDoc(projectRef);

  const clientRef = useMemoFirebase(() => {
    if (!db || !project?.clientId) return null;
    return doc(db, "clients", project.clientId);
  }, [db, project?.clientId]);
  const { data: client, isLoading: isClientLoading } = useDoc(clientRef);

  const billingSettingsRef = useMemoFirebase(() => {
    return doc(db, "companyBillingSettings", "global");
  }, [db]);
  const { data: globalSettings, isLoading: isBillingLoading } = useDoc(billingSettingsRef);

  if (isProjectLoading || isClientLoading || isBillingLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center tracking-normal">Synthesizing Billing Document...</p>
      </div>
    );
  }

  const budget = project?.budget || 0;
  const gst = budget * 0.18;
  const grandTotal = budget + gst;
  const invoiceDate = new Date().toLocaleDateString('en-GB');
  
  // Resolution of due date from params or fallback
  const dueDateDisplay = paramDueDate 
    ? new Date(paramDueDate).toLocaleDateString('en-GB')
    : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

  const invoiceNumber = `MRZL_${invoiceId.substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-100/50 p-4 md:p-8 animate-in fade-in duration-700 font-body">
      {/* Strategic Actions */}
      <div className="max-w-[900px] mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm uppercase shadow-none border-none tracking-normal"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Synthesis
        </Button>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="gap-2 bg-white rounded-xl font-bold text-xs uppercase border-slate-200 shadow-sm tracking-normal">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={() => window.print()} className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 tracking-normal">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Main Invoice Synthesis */}
      <div className="max-w-[900px] mx-auto bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none border-none">
        <div className="p-12 md:p-16 space-y-12">
          {/* Brand Identity */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
              {globalSettings?.logo ? (
                <div className="h-20 w-auto mb-2 flex items-center justify-center">
                  <img src={globalSettings.logo} alt="Brand Logo" className="h-full w-auto object-contain" />
                </div>
              ) : (
                <>
                  <svg
                    width="80"
                    height="60"
                    viewBox="0 0 40 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-slate-300"
                  >
                    <path
                      d="M5 25L15 5L25 25M15 25L25 5L35 25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-center mt-2">
                    <h1 className="text-xl font-bold text-slate-800 uppercase leading-none tracking-normal">MARZELZ</h1>
                    <p className="text-[10px] font-medium text-slate-400 uppercase mt-1 tracking-normal">LIFESTYLE</p>
                  </div>
                </>
              )}
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-2xl font-bold text-primary tracking-normal">
                {globalSettings?.companyName || "Marzelz Lifestyle PVT LTD"}
              </h2>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-normal">CIN: {globalSettings?.cinNumber || "U60200KL2023PTC081308"}</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-normal">GSTIN: {globalSettings?.taxId || "32AAQCM8450P1ZQ"}</p>
              <h3 className="text-5xl font-bold text-slate-900 pt-4 tracking-normal">Invoice</h3>
            </div>
          </div>

          {/* Core Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium tracking-normal">Project :</span>
                <span className="text-slate-900 font-bold tracking-normal">{project?.name || "Production Entity"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium tracking-normal">Invoice No :</span>
                <span className="text-slate-900 font-bold tracking-normal">{invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium tracking-normal">Invoice Date :</span>
                <span className="text-slate-900 font-bold tracking-normal">{invoiceDate}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium tracking-normal">Payable To :</span>
                <span className="text-slate-900 font-bold tracking-normal">{globalSettings?.companyName || "Marzelz Lifestyle PVT LTD"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium tracking-normal">Due Date :</span>
                <span className="text-slate-900 font-bold tracking-normal">{dueDateDisplay}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-primary uppercase tracking-normal">BILL TO</p>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 tracking-normal">{client?.name || "Client Name Not Found"}</h4>
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium tracking-normal whitespace-pre-line">
                  {client?.address || "Address not specified"}<br />
                  {client?.gstin && `GSTIN: ${client.gstin}`}
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Ledger */}
          <div className="overflow-hidden rounded-sm border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-center w-20 tracking-normal">SL No</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-normal">Description</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-center tracking-normal">Unit Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-center tracking-normal">Quantity</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-right tracking-normal">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center tracking-normal">1</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 tracking-normal">{project?.name || "Project Service"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center tracking-normal">₹{budget.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center tracking-normal">1</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right tracking-normal">₹{budget.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Reconciliation */}
          <div className="flex justify-end pt-4">
            <div className="w-[300px] space-y-0.5">
              <div className="grid grid-cols-[1fr_100px] bg-slate-100/80 px-4 py-2 text-sm">
                <span className="font-bold text-slate-900 tracking-normal">Subtotal</span>
                <span className="font-bold text-slate-900 text-right tracking-normal">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-[1fr_100px] bg-slate-100/80 px-4 py-2 text-sm">
                <span className="font-bold text-slate-900 tracking-normal">GST @ 18%</span>
                <span className="font-bold text-slate-900 text-right tracking-normal">₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-[1fr_100px] bg-slate-200 px-4 py-3 text-sm">
                <span className="font-bold text-slate-900 uppercase tracking-normal">Grand Total</span>
                <span className="font-bold text-slate-900 text-right tracking-normal">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              
              {/* Authenticity Seal */}
              <div className="flex justify-center pt-8 pb-4">
                <div className="relative h-24 w-24 border-2 border-blue-600 rounded-full flex items-center justify-center p-2 opacity-80 rotate-[-12deg]">
                  <div className="text-[7px] font-bold text-blue-600 text-center uppercase tracking-normal">
                    {globalSettings?.companyName || "MARZELZ LIFESTYLE PVT LTD"}<br />
                    <span className="text-[10px]">TRIVANDRUM</span><br />
                    695003<br />
                    CIN: {globalSettings?.cinNumber || "U60200KL2023PTC081308"}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 pointer-events-none opacity-60">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-blue-800">
                      <path d="M10,30 Q30,5 50,25 T90,10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="pt-12 border-t border-slate-900/10">
            <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-normal">Settlement Details</h4>
            <div className="space-y-3">
              <h5 className="text-[13px] font-bold text-slate-900 tracking-normal">{globalSettings?.bankName || "Axis Bank"}</h5>
              <div className="grid grid-cols-[120px_1fr] text-[13px] gap-y-1">
                <span className="text-slate-500 tracking-normal">Acc No</span><span className="font-medium tracking-normal">: {globalSettings?.bankAccountNumber || "922020014850667"}</span>
                <span className="text-slate-500 tracking-normal">Phone</span><span className="font-medium tracking-normal">: {globalSettings?.companyPhone || "9947109143"}</span>
                <span className="text-slate-500 tracking-normal">Name</span><span className="font-medium tracking-normal">: {globalSettings?.companyName || "Marzelz Lifestyle Private Limited."}</span>
                <span className="text-slate-500 tracking-normal">IFSC</span><span className="font-medium tracking-normal">: {globalSettings?.bankSwiftCode || "UTIB0003042"}</span>
                <span className="text-slate-500 tracking-normal">Branch</span><span className="font-medium tracking-normal">: {globalSettings?.bankIban || "Sasthamangalam"}</span>
                <span className="text-slate-500 tracking-normal">PAN</span><span className="font-medium tracking-normal">: {globalSettings?.panNumber || "AAQCM8450P"}</span>
                <span className="text-slate-500 tracking-normal">GSTIN</span><span className="font-medium tracking-normal">: {globalSettings?.taxId || "32AAQCM8450P1ZQ"}</span>
              </div>
            </div>
          </div>

          {/* Strategic Footer */}
          <div className="pt-20 flex flex-col md:flex-row justify-between items-end border-t border-slate-100 gap-6">
            <div className="space-y-2">
              <h5 className="text-[12px] font-bold text-slate-900 uppercase tracking-normal">{globalSettings?.companyName || "MARZELZ LIFESTYLE PRIVATE LIMITED"}</h5>
              <p className="text-[10px] text-slate-500 font-medium max-w-[400px] tracking-normal">
                {globalSettings?.companyAddress || "Dotspace Business Center TC 24/3088 Ushasandya Building, Kowdiar - Devasom Board Road, Kowdiar, Trivandrum, Pin : 695003"}
              </p>
            </div>
            <div className="text-right space-y-1">
              <h5 className="text-[12px] font-bold text-slate-900 uppercase tracking-normal">CONTACT US</h5>
              <div className="text-[10px] text-slate-500 font-medium space-y-0.5 tracking-normal">
                <p>Email: info@marzelz.com</p>
                <p>Phone: +91 871 400 5550</p>
                <p className="font-bold text-slate-900">www.marzelz.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceViewClient({ invoiceId }: { invoiceId: string }) {
  return (
    <Suspense fallback={
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center tracking-normal">Initializing Viewport...</p>
      </div>
    }>
      <InvoiceViewContent invoiceId={invoiceId} />
    </Suspense>
  );
}
