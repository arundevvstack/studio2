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
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function MarketResearchPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchFocus, setResearchFocus] = useState("Video Production");
  const [researchData, setResearchData] = useState<MarketResearchOutput | null>(null);

  const handleRunResearch = async () => {
    if (!researchFocus) return;
    
    setIsGenerating(true);
    try {
      const result = await generateMarketResearch({ focus: researchFocus });
      setResearchData(result);
    } catch (error) {
      console.error("Research Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const PRESET_TOPICS = [
    "Short-form Content",
    "Corporate Branding",
    "Real Estate Virtual Tours",
    "E-commerce Product Ads",
    "VFX & Post-Production"
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
              Real-time Analysis
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Analyze global media demands and strategic industry shifts.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden p-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              value={researchFocus}
              onChange={(e) => setResearchFocus(e.target.value)}
              className="pl-12 h-16 bg-slate-50 border-none shadow-inner rounded-2xl text-lg font-bold placeholder:text-slate-300 tracking-normal" 
              placeholder="e.g. Video Production Trends in Real Estate" 
            />
          </div>
          <Button 
            onClick={handleRunResearch} 
            disabled={isGenerating || !researchFocus} 
            className="h-16 px-10 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-3 text-lg transition-all active:scale-[0.98]"
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Synthesize Report
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          {PRESET_TOPICS.map((topic) => (
            <button 
              key={topic}
              onClick={() => setResearchFocus(topic)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-normal transition-all ${
                researchFocus === topic 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </Card>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <Globe className="h-6 w-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-900 tracking-normal">Connecting to Global Intelligence...</p>
            <p className="text-sm text-slate-400 animate-pulse uppercase font-bold tracking-normal">Aggregating market signals and industry throughput</p>
          </div>
        </div>
      )}

      {researchData && !isGenerating && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 h-full">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Demand Index</CardTitle>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mt-1 tracking-normal">Industry Vertical Demand</h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] w-full">
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
                        <Bar dataKey="demandLevel" radius={[0, 8, 8, 0]} barSize={24} fill="hsl(var(--primary))">
                          {researchData.demandByIndustry.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                <CardHeader className="p-0 mb-8 relative z-10">
                  <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Strategic Brief</CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative z-10 space-y-8">
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
                    <p className="text-sm font-medium leading-relaxed italic text-slate-300 tracking-normal">
                      "{researchData.executiveSummary}"
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Growth Acceleration</p>
                    <div className="flex flex-wrap gap-2">
                      {researchData.requiredSkills.map((skill, i) => (
                        <Badge key={i} className="bg-white/10 text-white border-none text-[9px] font-bold uppercase tracking-normal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold font-headline tracking-normal">Strategic Market Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {researchData.marketTrends.map((trend, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white p-8 group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        trend.impact === 'High' ? 'bg-primary/5 text-primary' : 'bg-blue-50 text-blue-500'
                      }`}>
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <Badge className={`border-none font-bold text-[8px] uppercase px-3 py-1 tracking-normal ${
                        trend.impact === 'High' ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {trend.impact} Impact
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 tracking-normal">{trend.trend}</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed tracking-normal">
                      {trend.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Demand Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {researchData.demandByIndustry.map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700 tracking-normal">{item.industry}</span>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-normal">{item.growthRate}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out" 
                        style={{ width: `${item.demandLevel}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-3xl rounded-full -mr-24 -mt-24" />
              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Next Move</p>
                <h4 className="text-xl font-bold font-headline tracking-normal">Strategic Adaptation</h4>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative z-10">
                <p className="text-sm font-medium leading-relaxed text-slate-300 tracking-normal mb-6">
                  Based on current demand in the <strong>{researchData.demandByIndustry[0].industry}</strong> sector, consider updating your production portfolio to highlight your <strong>{researchData.requiredSkills[0]}</strong> capabilities.
                </p>
                <Button className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-white/90 font-bold text-[10px] uppercase gap-2 tracking-normal shadow-none border-none">
                  Sync with Pipeline <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-white p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/5 flex items-center justify-center">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">Market Vitality</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-normal">
                  <span className="text-slate-400">Competitive Saturation</span>
                  <span className="text-slate-900">Moderate</span>
                </div>
                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '45%' }} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!researchData && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 space-y-6 text-center">
          <div className="h-20 w-20 rounded-[2.5rem] bg-primary/5 flex items-center justify-center shadow-sm">
            <Globe className="h-10 w-10 text-primary" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-bold font-headline text-slate-900 tracking-normal">Synthesize Global Research</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed tracking-normal">
              Enter a focus area above to pull real-time data about industry demands, trends, and growth opportunities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
