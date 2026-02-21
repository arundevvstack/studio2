'use server';

/**
 * @fileOverview A server action to handle the export of invoice data to a specific OneDrive location.
 * Target Destination: https://1drv.ms/f/c/647a0d6951a3319d/IgCdMaNRaQ16IIBk-wAAAAAAAfcdaEKnRuhBx-IP2qRxStM
 */

export interface InvoiceExportData {
  project: string;
  invoiceNo: string;
  invoiceDate: string;
  payableTo: string;
  dueDate: string;
  amount: number;
}

const ONEDRIVE_TARGET_LINK = 'https://1drv.ms/f/c/647a0d6951a3319d/IgCdMaNRaQ16IIBk-wAAAAAAAfcdaEKnRuhBx-IP2qRxStM';

/**
 * Simulates writing invoice entries to the specified OneDrive location.
 * In a high-fidelity production environment, this would utilize the Microsoft Graph API 
 * and the specific folder/drive ID extracted from the provided share link.
 * 
 * @param data The invoice metadata to be exported.
 */
export async function exportInvoiceToOneDrive(data: InvoiceExportData) {
  // Simulate network latency for high-fidelity UX feedback
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Log the data and destination to the server console for audit/verification
  console.log('--- OneDrive Export Initiated ---');
  console.log(`Destination: ${ONEDRIVE_TARGET_LINK}`);
  console.log(`Project: ${data.project}`);
  console.log(`Invoice No: ${data.invoiceNo}`);
  console.log(`Invoice Date: ${data.invoiceDate}`);
  console.log(`Payable To: ${data.payableTo}`);
  console.log(`Due Date: ${data.dueDate}`);
  console.log(`Amount: ₹${data.amount.toLocaleString('en-IN')}`);
  console.log('--- Export Simulation Complete ---');

  return { 
    success: true,
    destination: ONEDRIVE_TARGET_LINK
  };
}
