"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvoiceViewPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = React.use(params);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100/50 p-4 md:p-8 animate-in fade-in duration-700 font-body">
      {/* Navigation & Actions */}
      <div className="max-w-[900px] mx-auto mb-8 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm uppercase shadow-none border-none"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Synthesis
        </Button>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 bg-white rounded-xl font-bold text-sm uppercase border-slate-200 shadow-none">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={() => window.print()} className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm uppercase shadow-lg shadow-primary/20">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Main Invoice Layout */}
      <div className="max-w-[900px] mx-auto bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none border-none">
        <div className="p-12 md:p-16 space-y-12">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
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
                <h1 className="text-xl font-bold text-slate-800 uppercase leading-none">MARZELZ</h1>
                <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">LIFESTYLE</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-2xl font-bold text-primary">
                <span className="text-primary/70">Marzelz</span> Lifestyle PVT LTD
              </h2>
              <p className="text-[11px] font-bold text-slate-500 uppercase">CIN: U60200KL2023PTC081308</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase">GSTIN: 32AAQCM8450P1ZQ</p>
              <h3 className="text-5xl font-bold text-slate-900 pt-4">Invoice</h3>
            </div>
          </div>

          {/* Details & Bill To Section */}
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium">Project :</span>
                <span className="text-slate-900 font-bold">MRZL_202604_GG11</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium">Invoice No :</span>
                <span className="text-slate-900 font-bold">{invoiceId || "MRZL_202602_25"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium">Invoice Date :</span>
                <span className="text-slate-900 font-bold">05/01/2026</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium">Payable To :</span>
                <span className="text-slate-900 font-bold">Marzelz Lifestyle PVT LTD</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <span className="text-slate-400 font-medium">Due Date :</span>
                <span className="text-slate-900 font-bold">15/02/2026</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-primary uppercase">BILL TO</p>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Paragon Hospital Kerala Pvt. Ltd</h4>
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  TC.1/1469, GG HOSPITAL, Murinjapalam medical college, Pattom<br />
                  Trivandrum PIN: 695011<br />
                  32AAFCP2774A1ZU
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-sm border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-center w-20">SL No</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase">Description</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-center">Unit Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-center">Quantity</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">1</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">MRI launch Video</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">20,000</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">1</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹20,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-4">
            <div className="w-[300px] space-y-0.5">
              <div className="grid grid-cols-[1fr_100px] bg-slate-100/80 px-4 py-2 text-sm">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-slate-900 text-right">₹20,000.00</span>
              </div>
              <div className="grid grid-cols-[1fr_100px] bg-slate-100/80 px-4 py-2 text-sm">
                <span className="font-bold text-slate-900">GST @ 18%</span>
                <span className="font-bold text-slate-900 text-right">₹3,600.00</span>
              </div>
              <div className="grid grid-cols-[1fr_100px] bg-slate-200 px-4 py-3 text-sm">
                <span className="font-bold text-slate-900 uppercase">Grand Total Including GST</span>
                <span className="font-bold text-slate-900 text-right">₹23,600</span>
              </div>
              
              {/* Seal Placeholder */}
              <div className="flex justify-center pt-8 pb-4">
                <div className="relative h-24 w-24 border-2 border-blue-600 rounded-full flex items-center justify-center p-2 opacity-80 rotate-[-12deg]">
                  <div className="text-[7px] font-bold text-blue-600 text-center uppercase">
                    MARZELZ LIFESTYLE PVT LTD<br />
                    <span className="text-[10px]">TRIVANDRUM</span><br />
                    695003<br />
                    CIN: U60200KL2023PTC081308
                  </div>
                  {/* Mock Signature Line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 pointer-events-none opacity-60">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-blue-800">
                      <path d="M10,30 Q30,5 50,25 T90,10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="pt-12 border-t border-slate-900/10">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Account Details</h4>
            <div className="space-y-3">
              <h5 className="text-[13px] font-bold text-slate-900">Axis Bank</h5>
              <div className="grid grid-cols-[120px_1fr] text-[13px] gap-y-1">
                <span className="text-slate-500">Acc no</span><span className="font-medium">: 922020014850667</span>
                <span className="text-slate-500">Phone</span><span className="font-medium">: 9947109143</span>
                <span className="text-slate-500">NAME</span><span className="font-medium">: Marzelz Lifestyle Private Limited.</span>
                <span className="text-slate-500">IFSC</span><span className="font-medium">: UTIB0003042</span>
                <span className="text-slate-500">Branch</span><span className="font-medium">: Sasthamangalam</span>
                <span className="text-slate-500">PAN</span><span className="font-medium">: AAQCM8450P</span>
                <span className="text-slate-500">GST</span><span className="font-medium">: 32AAQCM8450P1ZQ</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-20 flex justify-between items-end border-t border-slate-100">
            <div className="space-y-2">
              <h5 className="text-[12px] font-bold text-slate-900 uppercase">MARZELZ LIFESTYLE PRIVATE LIMITED</h5>
              <p className="text-[10px] text-slate-500 font-medium max-w-[400px]">
                Dotspace Business Center TC 24/3088 Ushasandya Building, Kowdiar - Devasom Board Road, Kowdiar, Trivandrum, Pin : 695003
              </p>
            </div>
            <div className="text-right space-y-1">
              <h5 className="text-[12px] font-bold text-slate-900 uppercase">CONTACT US</h5>
              <div className="text-[10px] text-slate-500 font-medium space-y-0.5">
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
