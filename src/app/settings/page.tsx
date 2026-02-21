"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Plus, 
  Loader2,
  Briefcase,
  FileText,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsGenerating] = useState(false);

  // Team Data
  const teamQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "team_members"), orderBy("firstName", "asc"));
  }, [db, user]);
  const { data: team, isLoading: teamLoading } = useCollection(teamQuery);

  // Roles Data
  const rolesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "roles"), orderBy("name", "asc"));
  }, [db, user]);
  const { data: roles, isLoading: rolesLoading } = useCollection(rolesQuery);

  const handleSaveProfile = () => {
    setIsGenerating(true);
    // Simulation of organization profile update
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Profile Synchronized",
        description: "Organization details have been updated across the network."
      });
    }, 1000);
  };

  const handleDeleteMember = (memberId: string, name: string) => {
    const memberRef = doc(db, "team_members", memberId);
    deleteDocumentNonBlocking(memberRef);
    toast({
      variant: "destructive",
      title: "Member De-provisioned",
      description: `${name} has been removed from the organization.`
    });
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-normal">Syncing Global Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">Strategic Settings</h1>
        <p className="text-sm text-slate-500 font-medium tracking-normal">Manage your organization profile, team access, and system preferences.</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 h-auto rounded-2xl shadow-sm gap-1">
          <TabsTrigger value="organization" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-xl px-6 py-3 text-xs font-bold uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all tracking-normal">
            <ShieldCheck className="h-4 w-4" />
            Strategic Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-xl font-bold font-headline tracking-normal">Company Identity</CardTitle>
              <CardDescription className="tracking-normal">Define the branding and identifiers used in legal and billing documents.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Legal Entity Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input defaultValue="Marzelz Lifestyle Private Limited" className="pl-12 h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Brand Display Name</Label>
                  <Input defaultValue="Marzelz" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">CIN Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input defaultValue="U60200KL2023PTC081308" className="pl-12 h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">GSTIN Identifier</Label>
                  <Input defaultValue="32AAQCM8450P1ZQ" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">PAN Registration</Label>
                  <Input defaultValue="AAQCM8450P" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Headquarters Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-5 h-4 w-4 text-slate-300" />
                  <textarea 
                    defaultValue="Dotspace Business Center TC 24/3088 Ushasandya Building, Kowdiar - Devasom Board Road, Kowdiar, Trivandrum, Pin : 695003"
                    className="w-full min-h-[100px] pl-12 p-4 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-sm tracking-normal resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sync Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="animate-in slide-in-from-left-2 duration-300">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <div className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/30">
              <div>
                <CardTitle className="text-xl font-bold font-headline tracking-normal">Production Crew</CardTitle>
                <CardDescription className="tracking-normal">Provision and manage internal resources and access permissions.</CardDescription>
              </div>
              <Button className="h-11 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white gap-2 tracking-normal">
                <Plus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
            
            <CardContent className="p-0">
              {teamLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : team && team.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-10 text-[10px] font-bold uppercase tracking-normal">Crew Member</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-normal">Strategic Role</TableHead>
                      <TableHead className="text-right px-10 text-[10px] font-bold uppercase tracking-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.map((member) => (
                      <TableRow key={member.id} className="group transition-colors">
                        <TableCell className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm rounded-xl">
                              <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                              <AvatarFallback>{member.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900 tracking-normal leading-none">{member.firstName} {member.lastName}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-accent/10 text-accent border-none font-bold text-[10px] uppercase px-3 py-1 tracking-normal">Available</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 tracking-normal">
                            <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                            {member.roleId || "Expert"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteMember(member.id, member.firstName)}
                            className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/5 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-24 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center p-4 shadow-inner">
                    <Users className="h-full w-full text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">No crew members provisioned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="animate-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesLoading ? (
              <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : roles && roles.length > 0 ? (
              roles.map((role) => (
                <Card key={role.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-md transition-all">
                  <CardHeader className="p-8 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold font-headline tracking-normal">{role.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-normal">
                      {role.description || "Permissions defined by system security policies."}
                    </p>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Entitlements</p>
                      <div className="flex flex-wrap gap-2">
                        {(role.permissions || ['View Assets', 'Edit Workspace']).map((perm: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-normal">{perm}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
                <BadgeCheck className="h-12 w-12 text-slate-200" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-normal">Standard System Roles Enabled</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
