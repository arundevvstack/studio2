import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Send, Filter, MoreHorizontal, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const INVOICES = [
  { id: "INV-2024-001", client: "Nike", project: "Summer Campaign", amount: "$12,400", date: "2024-04-12", status: "Paid", due: "-" },
  { id: "INV-2024-002", client: "Starbucks", project: "Commercial Edit", amount: "$3,200", date: "2024-04-15", status: "Sent", due: "2024-05-15" },
  { id: "INV-2024-003", client: "Airbnb", project: "Product Visuals", amount: "$5,600", date: "2024-04-20", status: "Overdue", due: "2024-04-30" },
  { id: "INV-2024-004", client: "Spotify", project: "Audio Branding", amount: "$8,900", date: "2024-04-22", status: "Draft", due: "-" },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage payments, send invoices, and track financial records.</p>
        </div>
        <Button asChild className="gap-2 px-6 shadow-lg shadow-primary/20 font-bold">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,600</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last year</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$38,200</div>
            <p className="text-xs text-muted-foreground mt-1">across 12 invoices</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,600</div>
            <p className="text-xs text-destructive mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold font-headline">Recent Activity</h3>
          <Button variant="outline" size="sm" className="gap-2 border-slate-200">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-8 text-[10px] font-bold uppercase tracking-widest">Invoice ID</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Client</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Project</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-right px-8 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id} className="group transition-colors">
                <TableCell className="font-medium text-primary px-8">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {inv.id}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{inv.client}</TableCell>
                <TableCell className="text-muted-foreground">{inv.project}</TableCell>
                <TableCell className="font-bold">{inv.amount}</TableCell>
                <TableCell className="text-xs font-medium text-slate-500">{inv.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant={inv.status === 'Paid' ? 'default' : 'outline'} 
                    className={
                      inv.status === 'Paid' ? 'bg-accent/10 text-accent hover:bg-accent/20 border-none px-3' : 
                      inv.status === 'Overdue' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-none px-3' : 
                      inv.status === 'Sent' ? 'bg-primary/10 text-primary hover:bg-primary/20 border-none px-3' : 'px-3'
                    }
                  >
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
