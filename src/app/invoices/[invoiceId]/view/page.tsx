import InvoiceViewClient from "./invoice-view-client";

/**
 * @fileOverview Server Component entry point for Invoice View.
 * Handles parameter resolution and passes it to the client viewport.
 */
export default async function InvoiceViewPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const resolvedParams = await params;
  return <InvoiceViewClient invoiceId={resolvedParams.invoiceId} />;
}
