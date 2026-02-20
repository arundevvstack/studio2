"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Clock, 
  Loader2,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateProjectTasksAndTimeline } from "@/ai/flows/project-task-and-timeline-generation";
import type { ProjectTaskAndTimelineGenerationOutput } from "@/ai/flows/project-task-and-timeline-generation";
import { ScrollArea } from "@/components/ui/scroll-area";

const INITIAL_PROJECTS = [
  { id: 1, name: "Summer Music Video", client: "Record Label X", status: "In Progress", progress: 45, team: 4, deadline: "2024-06-15" },
  { id: 2, name: "Tech Launch 3D Render", client: "Z-Tech", status: "Planning", progress: 10, team: 2, deadline: "2024-07-20" },
  { id: 3, name: "Corporate Interview Series", client: "Global Corp", status: "Review", progress: 90, team: 3, deadline: "2024-05-30" },
];

export default function ProjectsPage() {
  const [projects] = useState(INITIAL_PROJECTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [aiResult, setAiResult] = useState<ProjectTaskAndTimelineGenerationOutput | null>(null);

  const handleGenerateTasks = async () => {
    if (!projectDescription) return;
    setIsGenerating(true);
    try {
      const result = await generateProjectTasksAndTimeline({ projectDescription });
      setAiResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Projects</h1>
          <p className="text-muted-foreground">Manage your production pipeline and tasks.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Create New Project</DialogTitle>
              <DialogDescription>
                Define your project and let AI help you generate a timeline and tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input placeholder="e.g. Nike Winter Campaign" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Describe the project scope, deliverables, and goals..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              {!aiResult && (
                <Button 
                  onClick={handleGenerateTasks} 
                  disabled={isGenerating || !projectDescription}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-none"
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating AI Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Project Tasks & Timeline with AI
                    </>
                  )}
                </Button>
              )}

              {aiResult && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Proposed Roadmap
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setAiResult(null)}>Reset</Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Timeline Summary</p>
                    <p className="text-sm text-foreground">{aiResult.timelineSummary}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Proposed Tasks</p>
                    <ScrollArea className="h-[200px] rounded-md border p-4 bg-background">
                      <div className="space-y-4">
                        {aiResult.tasks.map((task, i) => (
                          <div key={i} className="flex flex-col gap-1 border-b pb-2 last:border-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{task.name}</span>
                              <Badge variant="secondary" className="text-[10px]">{task.estimatedDuration}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 bg-muted/50 border-none" placeholder="Search projects..." />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <Badge variant={project.status === 'Planning' ? 'outline' : project.status === 'Review' ? 'secondary' : 'default'} className="mb-2">
                  {project.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="font-headline text-xl">{project.name}</CardTitle>
              <CardDescription>{project.client}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-1000" 
                    style={{ width: `${project.progress}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {project.team} members
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {project.deadline}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}