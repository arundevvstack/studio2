"use client";

import React, { useState } from "react";
import { 
  Globe, 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  Target,
  Search,
  CheckCircle2,
  PieChart,
  Calendar,
  MapPin,
  Lightbulb,
  Users,
  Package,
  IndianRupee,
  Mail,
  Instagram,
  MessageSquare,
  Phone,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  generateMarketResearch, 
  type MarketResearchOutput 
} from "@/ai/flows/market-research-flow";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

type TimeFrame = 'Today' | 'This Week' | 'This Month' | 'Next 3 Months';

export default function MarketResearchPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchFocus, setResearchFocus] = useState("Short-form Content");
  const [timeframe, setTimeframe] = useState<TimeFrame>('This Week');
  const [location, setLocation] = useState("Trivandrum, KL");
  const [radius, setRadius] = useState([25]);
  const [researchData, setResearchData] = useState<MarketResearchOutput | null>(null);

  const handleRunResearch = async () => {
    if (!researchFocus) return;
    
    setIsGenerating(true);
    try {
      const result = await generateMarketResearch({ 
        focus: researchFocus,
        timeframe: timeframe,
        location: location,
        radius: radius[0]
      });
      setResearchData(result);
    } catch (error) {
      console.error("Research Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getContactIcon = (strategy: string) => {
    switch (strategy) {
      case 'Instagram DM': return <Instagram className="h-3 w-3" />;
      case 'Email': return <Mail className="h-3 w-3" />;
      case 'WhatsApp': return <MessageSquare className="h-3 w-3" />;
      case 'Phone Call': return <Phone className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  const PRESET_TOPICS = [
    "Short-form Content",
    "Real Estate Virtual Tours",
    "E-commerce Ads",
    "Corporate Branding",
    "AI Video Production"
  ];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal leading-none">
              Market Intelligence Hub
            </h1>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 uppercase tracking-normal">
              <Zap className="h-3 w-3 mr-1" />
              Live Intelligence
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Analyze global media demands and hyper-local content trends.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden p-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                  <Target className="h-3 w-3" /> Production Focus
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary" />
                  <Input 
                    value={researchFocus}
                    onChange={(e) => setResearchFocus(e.target.value)}
                    className="pl-12 h-14 bg-slate-50 border-none shadow-inner rounded-xl font-bold placeholder:text-slate-300 tracking-normal" 
                    placeholder="e.g. Video Production" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Timeframe Perspective
                </label>
                <Select value={timeframe} onValueChange={(val: TimeFrame) => setTimeframe(val)}>
                  <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold tracking-normal focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="This Week">This Week</SelectItem>
                    <SelectItem value="This Month">This Month</SelectItem>
                    <SelectItem value="Next 3 Months">Next 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Local Market Target
                </label>
                <Input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-14 bg-slate-50 border-none shadow-inner rounded-xl font-bold tracking-normal" 
                  placeholder="City, Region" 
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Search Radius</label>
                  <span className="text-[10px] font-bold text-primary">{radius[0]} KM</span>
                </div>
                <Slider 
                  value={radius} 
                  onValueChange={setRadius} 
                  max={100} 
                  step={5} 
                  className="[&_.bg-primary]:bg-primary" 
                />
              </div>

              <Button 
                onClick={handleRunResearch} 
                disabled={isGenerating || !researchFocus} 
                className="w-full h-16 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-3 text-lg transition-all active:scale-[0.98]"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Synthesize Live
              </Button>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((topic) => (
              <button 
                key={topic}
                onClick={() => setResearchFocus(topic)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-normal transition-all ${
                  researchFocus === topic 
                    ? "bg-slate-900 text-white" 
                    : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-48 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-6 text-center">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <Globe className="h-6 w-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-900 tracking-normal">Connecting to Global Signals...</p>
                <p className="text-sm text-slate-400 animate-pulse uppercase font-bold tracking-normal">Aggregating search data for {location} over {timeframe}</p>
              </div>
            </div>
          ) : researchData ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
                  <CardHeader className="p-0 mb-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Localized Demand Index</CardTitle>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Industry Demand Snapshot</h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={researchData.demandByIndustry} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.05} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="industry" 
                            type="category" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            width={100}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                          />
                          <Bar dataKey="demandLevel" radius={[0, 8, 8, 0]} barSize={24}>
                            {researchData.demandByIndustry.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                  <CardHeader className="p-0 mb-8 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Behavioral Intelligence</CardTitle>
                    <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Target Client Archetypes</h3>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {researchData.mostSearchedClients.map((client, i) => (
                        <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                          <Users className="h-3 w-3 text-primary" />
                          <span className="text-xs font-bold tracking-normal">{client}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <p className="text-xs font-medium leading-relaxed text-slate-400 italic tracking-normal">
                        "High volume searches for these niches suggest immediate production gaps in {location}."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ACTIONABLE ASSETS: Suggested Content Packages */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-headline tracking-normal flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" /> Strategic Service Packages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {researchData.contentPackages.map((pkg, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white p-8 group hover:shadow-xl transition-all border border-slate-50">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                            <Rocket className="h-5 w-5 text-primary" />
                          </div>
                          <Badge className="bg-slate-50 text-slate-500 border-none text-[8px] font-bold uppercase tracking-normal px-2">
                            Package {i + 1}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 tracking-normal line-clamp-1">{pkg.packageName}</h4>
                          <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-normal flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" /> {pkg.priceRange}
                          </p>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-slate-50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Deliverables</p>
                          <ul className="space-y-1.5">
                            {pkg.deliverables.map((item, idx) => (
                              <li key={idx} className="text-[11px] font-medium text-slate-600 flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-accent shrink-0" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-4">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Target</p>
                          <p className="text-[11px] font-bold text-slate-900 mt-1 tracking-normal">{pkg.targetAudience}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* ACTIONABLE ASSETS: Targeted Client Leads */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-headline tracking-normal flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-accent" /> Strategic Prospecting
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {researchData.potentialClientLeads.map((lead, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group hover:shadow-md transition-all">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                            <Users className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-slate-900 tracking-normal">{lead.businessType}</h4>
                              <Badge className="bg-accent/10 text-accent border-none text-[8px] font-bold uppercase tracking-normal px-2">Hot Lead</Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed tracking-normal italic">
                              "{lead.reasoning}"
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Est. Budget</p>
                            <p className="text-sm font-bold text-slate-900 tracking-normal flex items-center gap-1 justify-end">
                              <IndianRupee className="h-3 w-3" /> {lead.estimatedBudget}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">Best Contact Method</p>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase gap-2 border-slate-100 text-slate-600 bg-white">
                              {getContactIcon(lead.contactStrategy)}
                              {lead.contactStrategy}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <h3 className="text-xl font-bold font-headline tracking-normal flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-accent" /> Strategic Marketing Guidance
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {researchData.marketingSuggestions.map((item, i) => (
                      <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white p-8 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className="bg-accent/10 text-accent border-none text-[8px] font-bold uppercase tracking-normal px-3 py-1">
                            Strategy {i + 1}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 tracking-normal">{item.strategy}</h4>
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-bold text-slate-900 tracking-normal flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> ACTION: {item.actionItem}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed tracking-normal">
                          {item.reasoning}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-3xl rounded-full -mr-24 -mt-24" />
                    <div className="space-y-2 relative z-10">
                      <p className="text-[10px] font-bold text-slate-50 uppercase tracking-normal">Executive Brief</p>
                      <h4 className="text-xl font-bold font-headline tracking-normal">Core Insights</h4>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative z-10">
                      <p className="text-xs font-medium leading-relaxed text-slate-300 tracking-normal">
                        {researchData.executiveSummary}
                      </p>
                    </div>
                    <div className="space-y-4 relative z-10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Critical Skill Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {researchData.requiredSkills.slice(0, 4).map((skill, i) => (
                          <Badge key={i} className="bg-white/10 text-white border-none text-[9px] font-bold uppercase tracking-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-48 border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 space-y-6 text-center">
              <div className="h-20 w-20 rounded-[2.5rem] bg-primary/5 flex items-center justify-center shadow-sm">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Launch Local Intelligence Research</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed tracking-normal">
                  Configure your focus and location on the left to synthesize real-time data about industry demands, targeted leads, and content packages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}