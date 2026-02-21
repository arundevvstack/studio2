'use server';

/**
 * @fileOverview A server action to handle the simulated export of invoice data to OneDrive.
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
 * 
 * NOTE: Real-time "reflection" in a OneDrive Excel sheet requires:
 * 1. An Azure App registration with 'Files.ReadWrite' and 'Sites.ReadWrite.All' permissions.
 * 2. A valid OAuth2 Access Token for the Microsoft Graph API.
 * 
 * @param data The invoice metadata to be exported.
 */
export async function exportInvoiceToOneDrive(data: InvoiceExportData) {
  // Simulate network latency for high-fidelity UX feedback
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Log the data and destination to the server console for audit/verification
  // In a production environment with Graph API, this is where the POST request would occur.
  console.log('--- [PROTOTYPE] OneDrive Export Action ---');
  console.log(`TARGET: ${ONEDRIVE_TARGET_LINK}`);
  console.log(`PAYLOAD:`, {
    "Project": data.project,
    "Invoice No": data.invoiceNo,
    "Invoice Date": data.invoiceDate,
    "Payable To": data.payableTo,
    "Due Date": data.dueDate,
    "Grand Total": `₹${data.amount.toLocaleString('en-IN')}`
  });
  console.log('--- Export Simulation Complete ---');

  return { 
    success: true,
    destination: ONEDRIVE_TARGET_LINK,
    message: "Data synchronized to the export buffer."
  };
}
