"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  Loader2, 
  Settings, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  History,
  MessageSquare,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, where } from "firebase/firestore";
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
 * @fileOverview High-fidelity Team Member Detail View.
 * Displays member identity, contact channels, capacity metrics, and production ledger.
 */

export default function TeamMemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = React.use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", memberId);
  }, [db, memberId, user]);
  const { data: member, isLoading: isMemberLoading } = useDoc(memberRef);

  const roleRef = useMemoFirebase(() => {
    if (!member?.roleId) return null;
    return doc(db, "roles", member.roleId);
  }, [db, member?.roleId]);
  const { data: role } = useDoc(roleRef);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"));
  }, [db, user]);
  const { data: allProjects, isLoading: isProjectsLoading } = useCollection(projectsQuery);

  const activeProjects = React.useMemo(() => {
    if (!allProjects || !memberId) return [];
    return allProjects.filter(p => p.crew?.some((c: any) => c.talentId === memberId));
  }, [allProjects, memberId]);

  if (isUserLoading || isMemberLoading || isProjectsLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase text-center tracking-normal">Syncing Member Intelligence...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className="text-2xl font-bold font-headline tracking-normal">Member Not Found</h2>
        <Button onClick={() => router.push("/team")} className="font-bold tracking-normal">Return to Team</Button>
      </div>
    );
  }

  const roleName = role?.name || member.roleId || "Expert";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm shrink-0"
            onClick={() => router.push("/team")}
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-headline text-slate-900 leading-none tracking-normal">
                {member.firstName} {member.lastName}
              </h1>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
                {member.type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 tracking-normal">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {roleName}
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Verified Internal Staff
              </span>
            </div>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors tracking-normal">
              <Settings className="h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-bold font-headline tracking-normal">Update Team Member</DialogTitle>
            </DialogHeader>
            <TeamMemberForm existingMember={member} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
            <div className="p-10 flex flex-col items-center text-center space-y-6">
              <Avatar className="h-48 w-48 border-8 border-slate-50 shadow-2xl rounded-[3rem]">
                <AvatarImage src={member.thumbnail || `https://picsum.photos/seed/${member.id}/400/400`} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">{member.firstName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">{member.firstName} {member.lastName}</h2>
                <p className="text-[10px] font-bold text-primary uppercase mt-2 tracking-widest">{roleName}</p>
              </div>
              <Badge className="bg-accent/10 text-accent border-none font-bold text-[10px] px-4 py-1.5 uppercase tracking-normal rounded-xl">
                Ready for Deployment
              </Badge>
            </div>
            
            <div className="px-10 pb-10 space-y-6 pt-6 border-t border-slate-50">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Contact Channels</p>
                <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold truncate tracking-normal">{member.email}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold tracking-normal">{member.phone || "No Hotline"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold text-slate-50 uppercase tracking-normal">Operational Load</p>
              <h4 className="text-xl font-bold font-headline tracking-normal">Capacity Brief</h4>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-medium">Active Load</span>
                <span className="text-2xl font-bold font-headline text-primary tracking-normal">{activeProjects.length} Entities</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(activeProjects.length * 20, 100)}%` }} />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-headline tracking-normal">Production Ledger</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1 tracking-normal">Current projects and production roles.</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>

              <div className="space-y-4">
                {activeProjects.length > 0 ? (
                  activeProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-50 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-slate-900 tracking-normal leading-tight">{project.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100">{project.status}</Badge>
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 tracking-normal">
                              <User className="h-3 w-3" />
                              Role: {project.crew?.find((c: any) => c.talentId === memberId)?.role || roleName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all">
                        <Link href={`/projects/${project.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-20 border-2 border-dashed border-slate-50 rounded-[2rem] text-center bg-slate-50/20">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-normal">No active production engagements</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-6">
              <h3 className="text-lg font-bold font-headline tracking-normal flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Engagement History
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-2 w-2 rounded-full bg-slate-200 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 tracking-normal">Organization Onboarding</p>
                    <p className="text-xs text-slate-400 font-medium tracking-normal">Member registered in the global repository.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 space-y-6">
              <h3 className="text-lg font-bold font-headline tracking-normal flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                Performance Notes
              </h3>
              <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">No entries recorded</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
