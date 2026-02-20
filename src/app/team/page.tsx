import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, MessageSquare, Briefcase, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TEAM = [
  { id: 1, name: "Alex Rivera", role: "Creative Director", status: "Available", projects: 3, avatar: "user1" },
  { id: 2, name: "Jordan Smith", role: "Lead Editor", status: "Busy", projects: 5, avatar: "user2" },
  { id: 3, name: "Sam Chen", role: "VFX Artist", status: "Available", projects: 2, avatar: "user3" },
  { id: 4, name: "Casey Jones", role: "Production Manager", status: "Available", projects: 4, avatar: "user4" },
  { id: 5, name: "Taylor Swift", role: "Sound Engineer", status: "On Leave", projects: 0, avatar: "user5" },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Team Collaboration</h1>
          <p className="text-muted-foreground">Manage your production crew and resource allocation.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all text-center">
            <CardHeader className="flex flex-col items-center pb-2">
              <Avatar className="h-20 w-20 border-4 border-background mb-4 shadow-sm">
                <AvatarImage src={`https://picsum.photos/seed/${member.avatar}/200/200`} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-lg">{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                <Badge variant={member.status === 'Available' ? 'default' : member.status === 'Busy' ? 'secondary' : 'outline'} className={
                  member.status === 'Available' ? 'bg-accent/10 text-accent border-none' : 
                  member.status === 'Busy' ? 'bg-primary/10 text-primary border-none' : ''
                }>
                  {member.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-2 border-y">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Projects</p>
                  <p className="font-bold">{member.projects}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <Mail className="h-3.5 w-3.5 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}