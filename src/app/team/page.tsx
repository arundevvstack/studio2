"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  Plus, 
  Search, 
  Loader2, 
  LayoutGrid, 
  List,
  Filter,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Star
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
import Link from "next/link";

/**
 * @fileOverview Team Registry.
 * High-density executive monitoring with dynamic role resolution.
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
  const { data: team, isLoading: teamLoading } = useCollection(teamQuery);

  const rolesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "roles"));
  }, [db, user]);
  const { data: roles } = useCollection(rolesQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"));
  }, [db, user]);
  const { data: projects } = useCollection(projectsQuery);

  const filteredTeam = useMemo(() => {
    if (!team) return [];
    return team.map(member => {
      const projectCount = projects?.filter(p => 
        p.crew?.some((c: any) => c.talentId === member.id)
      ).length || 0;
      
      const roleName = roles?.find(r => r.id === member.roleId)?.name || member.roleId || "CREW MEMBER";
      
      return { ...member, projectCount, roleName };
    }).filter((member) => {
      const matchesSearch = 
        member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.roleName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || member.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [team, searchQuery, typeFilter, projects, roles]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-tight leading-none">Team</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Manage your high-performance production crew and internal resources.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal transition-all active:scale-[0.98]">
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-10 pb-0">
              <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Provision Team Member</DialogTitle>
            </DialogHeader>
            <TeamMemberForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team by name or role..." 
            className="pl-14 h-14 rounded-full bg-white border-none shadow-sm font-bold tracking-normal text-base" 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-14 w-full md:w-[180px] rounded-full bg-white border-none shadow-sm font-bold text-xs uppercase tracking-widest">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              <SelectItem value="all" className="text-xs font-bold uppercase">All Types</SelectItem>
              <SelectItem value="In-house" className="text-xs font-bold uppercase">In-house</SelectItem>
              <SelectItem value="Freelancer" className="text-xs font-bold uppercase">Freelancer</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-white p-1.5 rounded-full shadow-sm border border-slate-100 shrink-0">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={`h-11 w-11 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={`h-11 w-11 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {teamLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Production Crew...</p>
        </div>
      ) : filteredTeam && filteredTeam.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredTeam.map((member) => (
              <Card key={member.id} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                <div className="p-4 flex-grow">
                  <div className="relative aspect-square overflow-hidden rounded-[2.2rem]">
                    <img 
                      src={member.thumbnail || `https://picsum.photos/seed/${member.id}/400/400`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={member.firstName}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`border-none font-bold text-[8px] uppercase px-3 py-1 rounded-full shadow-lg tracking-widest ${member.type === 'Freelancer' ? 'bg-orange-50 text-white' : 'bg-blue-600 text-white'}`}>
                        {member.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="px-4 py-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-headline text-slate-900 tracking-tight leading-tight">{member.firstName} {member.lastName}</h3>
                        <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                      </div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">{member.roleName}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="font-bold text-slate-600 text-[10px]">{member.projectCount} Projects</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-slate-600 text-[10px]">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <Button asChild className="w-full h-11 rounded-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 font-bold text-[10px] uppercase transition-all shadow-none border-none gap-2">
                    <Link href={`/team/${member.id}`}>View Profile +</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Member Identity</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Role</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Load</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeam.map((member) => (
                  <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm rounded-xl shrink-0">
                          <AvatarImage src={member.thumbnail || `https://picsum.photos/seed/${member.id}/100/100`} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{member.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 tracking-tight">{member.firstName} {member.lastName}</p>
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{member.id.substring(0, 6).toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600 tracking-normal">
                        <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                        {member.roleName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-slate-900 text-sm">{member.projectCount} Projects</span>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-6 font-bold text-[10px] uppercase gap-2 hover:bg-primary hover:text-white transition-all">
                        <Link href={`/team/${member.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-24 min-h-[500px] bg-white/30 text-center space-y-6">
          <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
            <Users className="h-10 w-10 text-slate-200" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No members matching your filters</p>
            <p className="text-xs text-slate-300 italic tracking-normal max-w-sm mx-auto">Adjust your search or register a new production expert.</p>
            <Button variant="link" onClick={() => { setSearchQuery(""); setTypeFilter("all"); }} className="text-primary font-bold text-xs mt-4 tracking-widest p-0">Clear all filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}
