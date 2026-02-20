"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Video,
  FileText,
  Calendar,
  Grid,
  ChevronRight,
  ChevronLeft,
  Smile,
  Mic,
  Camera,
  Archive,
  SearchIcon,
  PhoneCall
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FEATURED_PROJECTS = [
  {
    id: 1,
    title: "R&D for New Banking Mobile App",
    icon: <Grid className="h-4 w-4" />,
    gradient: "bg-gradient-pink",
    team: ["user1", "user2", "user3"]
  },
  {
    id: 2,
    title: "Create Signup Page",
    icon: <Grid className="h-4 w-4" />,
    gradient: "bg-gradient-purple",
    team: ["user4", "user5", "user1"]
  }
];

const TASKS_TODAY = [
  { id: 1, name: "Uber", desc: "App Design and Upgrades with new features", time: "In Progress 16 days", icon: "https://picsum.photos/seed/uber/40/40", team: ["user1", "user2", "user3"] },
  { id: 2, name: "Facebook Ads", desc: "Facebook Ads Design for CreativeCloud", time: "Last worked 5 days ago", icon: "https://picsum.photos/seed/fb/40/40", team: ["user4", "user5", "user1"] },
  { id: 3, name: "Payoneer", desc: "Payoneer Dashboard Design", time: "Due in 3 days", icon: "https://picsum.photos/seed/pay/40/40", team: ["user2", "user3", "user4"] },
];

const TASKS_TOMORROW = [
  { id: 4, name: "Upwork", desc: "Developming - Viewed Just Now", time: "Assigned 10 min ago", icon: "https://picsum.photos/seed/upwork/40/40", team: ["user5", "user1", "user2"] },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-full">
      {/* Main Content Area */}
      <div className="lg:col-span-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Hi Shakir!</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-muted-foreground">15% task completed</span>
               <Progress value={15} className="h-2 w-32" />
             </div>
          </div>
        </div>

        {/* Featured Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_PROJECTS.map((project) => (
            <Card key={project.id} className={`${project.gradient} border-none shadow-xl shadow-primary/10 rounded-3xl overflow-hidden relative group cursor-pointer`}>
              <CardContent className="p-8 text-white h-64 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    {project.icon}
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline leading-tight max-w-[200px] mb-4">
                    {project.title}
                  </h3>
                  <div className="flex -space-x-3">
                    {project.team.map((user, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-white/50">
                        <AvatarImage src={`https://picsum.photos/seed/${user}/100/100`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute right-0 bottom-0 opacity-40 group-hover:scale-110 transition-transform">
                   <div className="w-24 h-24 bg-white/20 rounded-full blur-3xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Monthly Tasks</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full px-6 text-xs font-bold bg-white/50 border-none shadow-sm">Archive</Button>
              <Button className="rounded-full px-6 text-xs font-bold shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b">
            <Tabs defaultValue="active" className="w-auto">
              <TabsList className="bg-transparent gap-8 h-auto p-0">
                <TabsTrigger value="active" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-2">Active Tasks</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none p-0 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-2">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <span className="pl-9 text-sm font-bold text-muted-foreground cursor-pointer flex items-center gap-1">
                Search
              </span>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Today</h3>
              <div className="space-y-3">
                {TASKS_TODAY.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-2xl shadow-inner border bg-muted/20">
                        <AvatarImage src={task.icon} />
                        <AvatarFallback>{task.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-base leading-none">{task.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{task.desc} - {task.time}</p>
                      </div>
                    </div>
                    <div className="flex -space-x-3">
                      {task.team.map((user, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={`https://picsum.photos/seed/${user}/100/100`} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tomorrow</h3>
              <div className="space-y-3">
                {TASKS_TOMORROW.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-2xl shadow-inner border bg-muted/20">
                        <AvatarImage src={task.icon} />
                        <AvatarFallback>{task.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-base leading-none">{task.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{task.desc} - {task.time}</p>
                      </div>
                    </div>
                    <div className="flex -space-x-3">
                      {task.team.map((user, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={`https://picsum.photos/seed/${user}/100/100`} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Sidebar-like panel) */}
      <div className="lg:col-span-4 space-y-8">
        {/* Schedule */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Today's Schedule</h2>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground bg-white shadow-sm rounded-lg"><Grid className="h-4 w-4" /></Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground bg-white shadow-sm rounded-lg"><Calendar className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-1">
               <p className="text-[10px] font-bold text-primary uppercase mb-1">30 minute call with Client</p>
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg">Project Discovery Call</h3>
                 <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-auto p-0 flex items-center gap-1">
                   <Plus className="h-3 w-3" />
                   <span className="text-[10px] font-bold">Invite</span>
                 </Button>
               </div>
            </div>

            <Card className="bg-accent text-white border-none rounded-[2.5rem] shadow-xl shadow-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {["u1", "u2", "u3"].map((u, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-accent">
                        <AvatarImage src={`https://picsum.photos/seed/${u}/100/100`} />
                      </Avatar>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-white/20 border-2 border-accent flex items-center justify-center text-[10px] font-bold">R</div>
                  </div>
                  <div className="text-xl font-bold font-mono">28:35</div>
                  <div className="flex items-center gap-3">
                    <PhoneCall className="h-5 w-5" />
                    <MoreHorizontal className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Design Project</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                 <Clock className="h-3 w-3" />
                 In Progress
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Completed</p>
               <p className="text-3xl font-bold font-headline mt-1">114</p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">In Progress</p>
               <p className="text-3xl font-bold font-headline mt-1 text-primary relative">
                 24
                 <span className="absolute top-0 -right-2 w-1.5 h-1.5 bg-primary rounded-full" />
               </p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Team members</p>
               <div className="flex -space-x-3 mt-2">
                 {["u1", "u2"].map((u, i) => (
                   <Avatar key={i} className="h-8 w-8 border-2 border-white">
                     <AvatarImage src={`https://picsum.photos/seed/${u}/100/100`} />
                   </Avatar>
                 ))}
                 <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border-2 border-white flex items-center justify-center text-[10px] font-bold">S</div>
               </div>
            </div>
          </div>
        </div>

        {/* New Task Form */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-headline">New Task</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
           </div>
           
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Task Title</label>
               <Input className="rounded-2xl h-14 bg-muted/30 border-none shadow-inner" placeholder="Create new..." />
             </div>

             <div className="flex items-center justify-between py-2 border-y border-dashed">
                <Button variant="ghost" size="icon" className="text-muted-foreground"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="flex items-center gap-3">
                   {["😊", "🎉", "👩‍💻", "🚀", "💡", "🔥", "🙌", "✨"].map((emoji, i) => (
                     <span key={i} className="text-xl cursor-pointer hover:scale-125 transition-transform">{emoji}</span>
                   ))}
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><ChevronRight className="h-4 w-4" /></Button>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Add Collaborators</label>
               <div className="flex flex-wrap gap-2">
                 <Badge variant="secondary" className="rounded-full pl-1 pr-2 py-1 gap-2 bg-primary/10 text-primary border-none shadow-sm cursor-pointer">
                   <Avatar className="h-6 w-6">
                     <AvatarImage src="https://picsum.photos/seed/angela/50/50" />
                   </Avatar>
                   Angela <span className="opacity-50">×</span>
                 </Badge>
                 <Badge variant="secondary" className="rounded-full pl-1 pr-2 py-1 gap-2 bg-accent/10 text-accent border-none shadow-sm cursor-pointer">
                   <Avatar className="h-6 w-6">
                     <AvatarImage src="https://picsum.photos/seed/chris/50/50" />
                   </Avatar>
                   Chris <span className="opacity-50">×</span>
                 </Badge>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-dashed border-2 text-muted-foreground">+</Button>
                 <Button className="h-8 w-8 rounded-full bg-primary shadow-lg shadow-primary/20"><ChevronRight className="h-4 w-4" /></Button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}