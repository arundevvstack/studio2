'use server';

/**
 * @fileOverview A server action to handle the export of invoice data to a OneDrive sheet.
 * This function currently simulates the integration process and logs the strategic billing data.
 */

export interface InvoiceExportData {
  project: string;
  invoiceNo: string;
  invoiceDate: string;
  payableTo: string;
  dueDate: string;
  amount: number;
}

/**
 * Simulates writing invoice entries to a OneDrive sheet.
 * In a production environment, this would interface with the Microsoft Graph API.
 * 
 * @param data The invoice metadata to be exported.
 */
export async function exportInvoiceToOneDrive(data: InvoiceExportData) {
  // Simulate network latency for high-fidelity UX feedback
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Log the data to the server console for audit/verification
  console.log('--- OneDrive Export Initiated ---');
  console.log(`Project: ${data.project}`);
  console.log(`Invoice No: ${data.invoiceNo}`);
  console.log(`Invoice Date: ${data.invoiceDate}`);
  console.log(`Payable To: ${data.payableTo}`);
  console.log(`Due Date: ${data.dueDate}`);
  console.log(`Amount: ₹${data.amount.toLocaleString('en-IN')}`);
  console.log('--- Export Simulation Complete ---');

  return { success: true };
}
