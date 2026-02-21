
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, MessageSquare, Briefcase, Plus, Search, Loader2, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function TeamPage() {
  const db = useFirestore();
  const { user } = useUser();

  const teamQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "teamMembers"), orderBy("firstName", "asc"));
  }, [db, user]);

  const { data: team, isLoading } = useCollection(teamQuery);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Team Collaboration</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Manage your production crew and high-performance resources.</p>
        </div>
        <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 tracking-normal">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-normal">Syncing Production Crew...</p>
        </div>
      ) : team && team.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member) => (
            <Card key={member.id} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all rounded-[2.5rem] bg-white overflow-hidden text-center group">
              <CardHeader className="flex flex-col items-center pt-10 pb-4">
                <Avatar className="h-24 w-24 border-4 border-slate-50 mb-6 shadow-md rounded-[2rem] group-hover:scale-105 transition-transform">
                  <AvatarImage src={`https://picsum.photos/seed/${member.id}/200/200`} />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">{member.firstName[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="font-headline text-xl text-slate-900 tracking-normal">{member.firstName} {member.lastName}</CardTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{member.roleId || "CREW MEMBER"}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8 pt-0">
                <div className="flex justify-center">
                  <Badge className="bg-accent/10 text-accent border-none font-bold text-[10px] px-4 py-1 uppercase tracking-normal">
                    Available
                  </Badge>
                </div>
                
                <div className="flex items-center justify-center gap-8 py-6 border-y border-slate-50">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-normal">Capacity</p>
                    <p className="font-bold text-slate-900 mt-1">100%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-normal">Asset Load</p>
                    <p className="font-bold text-slate-900 mt-1">0</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-100 font-bold text-[10px] uppercase gap-2 tracking-normal text-slate-600 hover:bg-slate-50">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Button>
                  <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-100 font-bold text-[10px] uppercase gap-2 tracking-normal text-slate-600 hover:bg-slate-50">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-24 min-h-[500px] bg-white/30 text-center space-y-6">
          <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
            <Users className="h-10 w-10 text-slate-200" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No Active Crew Records</p>
            <p className="text-xs text-slate-300 italic tracking-normal max-w-sm mx-auto">Build your high-performance team to manage global production throughput.</p>
            <Button variant="link" className="text-primary font-bold text-xs mt-4 tracking-normal">Register your first production expert</Button>
          </div>
        </div>
      )}
    </div>
  );
}
