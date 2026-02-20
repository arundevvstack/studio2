import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Mail, Phone, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CLIENTS = [
  { id: 1, name: "Nike", industry: "Sportswear", projects: 12, contact: "Sarah Johnson", email: "s.johnson@nike.com", status: "Active" },
  { id: 2, name: "Apple", industry: "Technology", projects: 8, contact: "Mark Foster", email: "m.foster@apple.com", status: "Active" },
  { id: 3, name: "Tesla", industry: "Automotive", projects: 3, contact: "Elon M.", email: "office@tesla.com", status: "Dormant" },
  { id: 4, name: "Spotify", industry: "Entertainment", projects: 15, contact: "Daniel Ek", email: "daniel@spotify.com", status: "Active" },
  { id: 5, name: "Airbnb", industry: "Travel", projects: 5, contact: "Brian C.", email: "brian@airbnb.com", status: "Active" },
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Clients</h1>
          <p className="text-muted-foreground">Maintain client relationships and track collaboration history.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 bg-muted/50 border-none" placeholder="Search clients by name, contact, or industry..." />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Client</TableHead>
              <TableHead className="font-bold">Industry</TableHead>
              <TableHead className="font-bold">Contact Person</TableHead>
              <TableHead className="font-bold">Projects</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CLIENTS.map((client) => (
              <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={`https://picsum.photos/seed/${client.name}/100/100`} />
                      <AvatarFallback>{client.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.industry}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{client.contact}</span>
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-bold">
                    {client.projects}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={client.status === 'Active' ? 'default' : 'outline'} className={client.status === 'Active' ? 'bg-accent/10 text-accent hover:bg-accent/20' : ''}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4 text-primary" />
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