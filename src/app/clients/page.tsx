
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Briefcase,
  TrendingUp,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const CLIENTS_PORTFOLIO = [
  {
    id: 1,
    name: "Nike",
    industry: "Sportswear",
    activeProjects: 4,
    totalRevenue: "$1.2M",
    contact: "Sarah Johnson",
    email: "s.johnson@nike.com",
    status: "Strategic",
    color: "bg-gradient-pink"
  },
  {
    id: 2,
    name: "Apple",
    industry: "Technology",
    activeProjects: 2,
    totalRevenue: "$850k",
    contact: "Mark Foster",
    email: "m.foster@apple.com",
    status: "Active",
    color: "bg-gradient-purple"
  },
  {
    id: 3,
    name: "Airbnb",
    industry: "Travel",
    activeProjects: 1,
    totalRevenue: "$320k",
    contact: "Brian Chesky",
    email: "brian@airbnb.com",
    status: "Growth",
    color: "bg-gradient-blue"
  }
];

export default function ClientsPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">
            Client Portfolio
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Managing global partnerships and strategic accounts.
          </p>
        </div>
        <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Strategic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Reach</p>
              <h3 className="text-2xl font-bold font-headline">12 Countries</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Value</p>
              <h3 className="text-2xl font-bold font-headline">$4.2M</h3>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ops</p>
              <h3 className="text-2xl font-bold font-headline">18 Projects</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-xl text-base placeholder:text-slate-400" 
            placeholder="Filter clients by name, industry, or key contact..." 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 bg-white border-slate-100 rounded-xl font-bold text-slate-600 gap-2 shadow-sm">
          <Filter className="h-4 w-4" />
          Refine
        </Button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {CLIENT_PORTFOLIO.map((client) => (
          <Card key={client.id} className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`h-24 ${client.color} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="absolute -bottom-10 left-8">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg rounded-3xl">
                  <AvatarImage src={`https://picsum.photos/seed/${client.name}/200/200`} />
                  <AvatarFallback>{client.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <CardContent className="p-8 pt-14 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold font-headline text-slate-900">{client.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{client.industry}</p>
                </div>
                <Badge className="bg-slate-50 text-slate-500 border-none font-bold text-[10px] uppercase px-3 py-1">
                  {client.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Projects</p>
                  <p className="text-xl font-bold mt-1 text-primary">{client.activeProjects}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Revenue</p>
                  <p className="text-xl font-bold mt-1 text-slate-900">{client.totalRevenue}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">{client.contact}</span>
                </div>
              </div>

              <Button variant="ghost" className="w-full h-12 rounded-2xl bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all gap-2">
                View Engagement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {/* New Client Empty State Card */}
        <Link href="/clients/new" className="border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 min-h-[400px] hover:border-primary/20 hover:bg-slate-50/50 transition-all group">
          <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Plus className="h-8 w-8 text-slate-300 group-hover:text-primary" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Scale Portfolio</p>
          <p className="text-xs text-slate-300 mt-2 font-medium">Add a new high-value client</p>
        </Link>
      </div>
    </div>
  );
}
