
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Mail, 
  MessageSquare, 
  Briefcase, 
  Plus, 
  Search, 
  Loader2, 
  LayoutGrid, 
  List,
  Filter,
  ShieldCheck,
  X,
  ArrowRight,
  MoreHorizontal
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";

/**
 * @fileOverview Enhanced Team Management Page.
 * Features real-time filtering, search, and Grid/List view modes.
 */

export default function TeamPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const teamQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"), orderBy("firstName", "asc"));
  }, [db, user]);

  const { data: team, isLoading } = useCollection(teamQuery);

  const filteredTeam = useMemo(() => {
    if (!team) return [];
    return team.filter((member) => {
      const matchesSearch = 
        member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.roleId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || member.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [team, searchQuery, typeFilter]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">
            Team
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Manage your high-performance production crew and internal resources.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal">
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Provision Team Member</DialogTitle>
            </DialogHeader>
            <TeamMemberForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team by name or role..." 
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm font-bold tracking-normal text-base" 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-14 w-full md:w-[180px] rounded-2xl bg-white border-none shadow-sm font-bold text-xs uppercase tracking-normal">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="all" className="text-xs font-bold uppercase">All Types</SelectItem>
              <SelectItem value="In-house" className="text-xs font-bold uppercase">In-house</SelectItem>
              <SelectItem value="Freelancer" className="text-xs font-bold uppercase">Freelancer</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={`h-11 w-11 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={`h-11 w-11 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-normal">Syncing Production Crew...</p>
        </div>
      ) : filteredTeam && filteredTeam.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {filteredTeam.map((member) => (
              <Card key={member.id} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all rounded-[2.5rem] bg-white overflow-hidden text-center group">
                <CardHeader className="flex flex-col items-center pt-10 pb-4 relative">
                  <Badge className={`absolute top-6 right-6 border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-lg tracking-normal ${member.type === 'Freelancer' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    {member.type || "Expert"}
                  </Badge>
                  <Avatar className="h-24 w-24 border-4 border-slate-50 mb-6 shadow-md rounded-[2rem] group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={`https://picsum.photos/seed/${member.id}/200/200`} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">{member.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-xl text-slate-900 tracking-normal leading-none">{member.firstName} {member.lastName}</CardTitle>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-normal pt-2">{member.roleId || "CREW MEMBER"}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-8 pt-0">
                  <div className="flex justify-center">
                    <Badge className="bg-accent/10 text-accent border-none font-bold text-[10px] px-4 py-1 uppercase tracking-normal rounded-xl">
                      Available
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 py-6 border-y border-slate-50">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-normal">Capacity</p>
                      <p className="font-bold text-slate-900 mt-1">100%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-normal">Load</p>
                      <p className="font-bold text-slate-900 mt-1">0</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Button asChild variant="outline" className="flex-1 h-11 rounded-xl border-slate-100 font-bold text-[10px] uppercase gap-2 tracking-normal text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                      <a href={`mailto:${member.email}`}>
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-100 font-bold text-[10px] uppercase gap-2 tracking-normal text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="px-10 py-5 text-[10px] font-bold uppercase tracking-normal">Member Identity</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-normal">Resource Type</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-normal">Strategic Role</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-normal">Contact</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeam.map((member) => (
                  <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm rounded-xl shrink-0">
                          <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{member.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 tracking-normal leading-none">{member.firstName} {member.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">#{member.id.substring(0, 6).toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none font-bold text-[10px] uppercase px-3 py-1 rounded-lg tracking-normal ${member.type === 'Freelancer' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {member.type || "Expert"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600 tracking-normal">
                        <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                        {member.roleId || "Expert"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-900 tracking-normal">{member.email}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-normal">{member.phone || "No Hotline"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all">
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-200 transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-24 min-h-[500px] bg-white/30 text-center space-y-6">
          <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
            <Users className="h-10 w-10 text-slate-200" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No members matching your filters</p>
            <p className="text-xs text-slate-300 italic tracking-normal max-w-sm mx-auto">Adjust your search or register a new production expert.</p>
            <Button variant="link" onClick={() => { setSearchQuery(""); setTypeFilter("all"); }} className="text-primary font-bold text-xs mt-4 tracking-normal p-0">Clear all filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}
