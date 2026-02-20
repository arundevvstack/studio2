import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  Users, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Video,
  FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const stats = [
    { label: "Active Projects", value: "12", icon: Briefcase, change: "+2 this month", trend: "up" },
    { label: "Total Clients", value: "48", icon: Users, change: "+5 this month", trend: "up" },
    { label: "Hours Tracked", value: "1,240", icon: Clock, change: "-12% vs last month", trend: "down" },
    { label: "Sales Projection", value: "$84,200", icon: TrendingUp, change: "+18.2%", trend: "up" },
  ];

  const recentProjects = [
    { name: "Nike Summer Campaign", client: "Nike", progress: 65, deadline: "May 15", type: "Video Production" },
    { name: "Apple Event Keynote", client: "Apple", progress: 88, deadline: "May 20", type: "Visual FX" },
    { name: "Tesla Brand Identity", client: "Tesla", progress: 25, deadline: "June 10", type: "Motion Graphics" },
    { name: "Spotify Podcast Series", client: "Spotify", progress: 95, deadline: "May 10", type: "Audio Engineering" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here's what's happening in your production pipeline.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center text-xs mt-1 ${stat.trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentProjects.map((project) => (
                <div key={project.name} className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.client} • {project.type}</p>
                  </div>
                  <div className="w-[100px] space-y-1 text-right">
                    <p className="text-xs font-medium">{project.progress}%</p>
                    <Progress value={project.progress} className="h-1" />
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Due {project.deadline}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { inv: "INV-2024-001", client: "Red Bull", amount: "$12,400", status: "Overdue" },
                { inv: "INV-2024-002", client: "Starbucks", amount: "$3,200", status: "Sent" },
                { inv: "INV-2024-003", client: "Airbnb", amount: "$5,600", status: "Draft" },
              ].map((inv) => (
                <div key={inv.inv} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.inv}</p>
                      <p className="text-xs text-muted-foreground">{inv.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{inv.amount}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                      inv.status === 'Overdue' ? 'bg-destructive/10 text-destructive' :
                      inv.status === 'Sent' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}