import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw, Calendar, Filter, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TimeTrackingPage() {
  const recentEntries = [
    { id: 1, task: "Color Grading - Nike Commercial", project: "Nike Summer", duration: "3h 45m", date: "Today", status: "Submitted" },
    { id: 2, task: "Storyboarding - Apple Event", project: "Apple Launch", duration: "1h 20m", date: "Today", status: "Live" },
    { id: 3, task: "Script Review - Tesla Identity", project: "Tesla Branding", duration: "2h 10m", date: "Yesterday", status: "Approved" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Time Tracking</h1>
          <p className="text-muted-foreground">Monitor productivity and billable hours across production tasks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Timesheets
          </Button>
          <Button className="gap-2">
            <Clock className="h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-[-20deg] translate-x-12" />
          <CardHeader>
            <CardTitle className="font-headline text-xl">Active Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-6xl font-bold tracking-tighter tabular-nums">01:45:22</span>
              <p className="text-primary-foreground/70 mt-2 font-medium">Currently working on: Storyboarding - Apple Event</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="rounded-full h-16 w-16 p-0 shadow-lg">
                <Pause className="h-8 w-8" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-white/10 rounded-full h-12 w-12 p-0">
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary" className="px-8 font-bold">
                Complete Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Tracked</span>
                <span className="font-bold">34.5 / 40 hrs</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-[86%]" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              {[
                { name: "Nike Summer", hrs: "12.5 hrs", color: "bg-primary" },
                { name: "Apple Launch", hrs: "15.0 hrs", color: "bg-blue-400" },
                { name: "Tesla Brand", hrs: "7.0 hrs", color: "bg-slate-400" },
              ].map((proj) => (
                <div key={proj.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${proj.color}`} />
                    <span className="text-xs font-medium">{proj.name}</span>
                  </div>
                  <span className="text-xs font-bold">{proj.hrs}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold font-headline">Recent Entries</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${entry.status === 'Live' ? 'bg-accent/10' : 'bg-muted'}`}>
                    {entry.status === 'Live' ? (
                      <div className="relative">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                      </div>
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{entry.task}</p>
                    <p className="text-xs text-muted-foreground">{entry.project} • {entry.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">{entry.duration}</p>
                    <Badge variant="outline" className="text-[10px] py-0">{entry.status}</Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}