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
  PhoneCall
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const FEATURED_PROJECTS: any[] = [];
const TASKS_TODAY: any[] = [];
const TASKS_TOMORROW: any[] = [];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-full">
      {/* Main Content Area */}
      <div className="lg:col-span-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Hi Shakir!</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-muted-foreground">0% task completed</span>
               <Progress value={0} className="h-2 w-32" />
             </div>
          </div>
        </div>

        {/* Featured Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_PROJECTS.length > 0 ? (
            FEATURED_PROJECTS.map((project) => (
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
                      {project.team.map((user: string, i: number) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-white/50">
                          <AvatarImage src={`https://picsum.photos/seed/${user}/100/100`} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-40 group-hover:scale-110 transition-transform">
                     <div className="w-24 h-24 bg-white/20 rounded-full blur-3xl" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full border-2 border-dashed border-slate-100 bg-white/50 rounded-[2rem] h-64 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center p-3">
                <Grid className="h-full w-full text-slate-200" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-300 uppercase">No Featured Projects</p>
                <Button variant="link" asChild className="text-primary font-bold text-xs p-0 h-auto mt-1">
                  <Link href="/projects/new">Create a new pitch</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Monthly Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Monthly Tasks</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full px-6 text-xs font-bold bg-white/50 border-none shadow-sm">Archive</Button>
              <Button className="rounded-full px-6 text-xs font-bold shadow-lg shadow-primary/20" asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Link>
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
              <h3 className="text-sm font-bold text-muted-foreground uppercase">Today</h3>
              <div className="space-y-3">
                {TASKS_TODAY.length > 0 ? (
                  TASKS_TODAY.map((task) => (
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
                        {task.team.map((user: string, i: number) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={`https://picsum.photos/seed/${user}/100/100`} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-50">
                    <p className="text-xs font-bold text-slate-300 uppercase">No tasks scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase">Tomorrow</h3>
              <div className="space-y-3">
                {TASKS_TOMORROW.length > 0 ? (
                  TASKS_TOMORROW.map((task) => (
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
                        {task.team.map((user: string, i: number) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={`https://picsum.photos/seed/${user}/100/100`} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-50">
                    <p className="text-xs font-bold text-slate-300 uppercase">Clear schedule for tomorrow</p>
                  </div>
                )}
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
            <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-slate-50">
               <p className="text-xs font-bold text-slate-300 uppercase">No appointments today</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Production Stats</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                 <Clock className="h-3 w-3" />
                 Last 30 Days
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase">Completed</p>
               <p className="text-3xl font-bold font-headline mt-1">0</p>
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase">In Progress</p>
               <p className="text-3xl font-bold font-headline mt-1 text-primary relative">
                 0
               </p>
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase">Active Team</p>
               <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border-2 border-white flex items-center justify-center text-[10px] font-bold mt-2">0</div>
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
               <label className="text-xs font-bold text-muted-foreground uppercase px-1">Task Title</label>
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
               <label className="text-xs font-bold text-muted-foreground uppercase px-1">Add Collaborators</label>
               <div className="flex flex-wrap gap-2">
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
