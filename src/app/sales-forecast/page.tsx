"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  Calendar,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { salesForecastGeneration } from "@/ai/flows/sales-forecast-generation";
import type { SalesForecastGenerationOutput } from "@/ai/flows/sales-forecast-generation";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const MOCK_HISTORICAL: any[] = [];
const MOCK_CLIENTS: any[] = [];

export default function SalesForecastPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState("4");
  const [forecastData, setForecastData] = useState<SalesForecastGenerationOutput | null>(null);

  const handleGenerateForecast = async () => {
    if (MOCK_HISTORICAL.length === 0) {
      alert("No historical data available for analysis. Please onboard clients and log projects first.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await salesForecastGeneration({
        historicalProjects: MOCK_HISTORICAL,
        clients: MOCK_CLIENTS,
        forecastPeriodInWeeks: parseInt(forecastPeriod),
      });
      setForecastData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'hsl(var(--accent))';
      case 'Medium': return '#EAB308';
      case 'Low': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Sales Forecast</h1>
          <p className="text-muted-foreground">AI-powered revenue projections based on historical performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">Next 4 Weeks</SelectItem>
              <SelectItem value="8">Next 8 Weeks</SelectItem>
              <SelectItem value="12">Next 12 Weeks</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateForecast} disabled={isGenerating || MOCK_HISTORICAL.length === 0} className="gap-2">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {forecastData ? "Update Forecast" : "Generate Forecast"}
          </Button>
        </div>
      </div>

      {!forecastData && !isGenerating && (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold font-headline">Project Your Future Revenue</h3>
              <p className="text-muted-foreground mt-2">
                Use MediaFlow's advanced AI to analyze your historical client data, current project statuses, and market trends to predict upcoming earnings.
              </p>
            </div>
            <Button onClick={handleGenerateForecast} disabled={MOCK_HISTORICAL.length === 0} className="mt-4">
              {MOCK_HISTORICAL.length === 0 ? "Insufficient Data" : "Start Analysis"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-medium animate-pulse">Analyzing historical trends and client data...</p>
        </div>
      )}

      {forecastData && (
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm h-full">
              <CardHeader>
                <CardTitle className="font-headline">Weekly Revenue Projections</CardTitle>
                <CardDescription>Estimated USD revenue for the next {forecastPeriod} weeks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData.forecasts}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Projected Revenue']}
                      />
                      <Bar dataKey="projectedRevenue" radius={[4, 4, 0, 0]}>
                        {forecastData.forecasts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getConfidenceColor(entry.confidenceLevel)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" /> High Confidence
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EAB308]" /> Medium Confidence
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" /> Low Confidence
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm h-full flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-sm leading-relaxed italic text-foreground/80">
                      "{forecastData.overallSummary}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Total Projected</p>
                      <p className="text-2xl font-bold font-headline">
                        ${forecastData.forecasts.reduce((acc, curr) => acc + curr.projectedRevenue, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Avg Confidence</p>
                      <p className="text-2xl font-bold font-headline">Medium</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Period Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.forecasts.map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted rounded-lg p-2 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{item.period}</p>
                        <p className="text-sm text-muted-foreground">{item.explanation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Projected</p>
                        <p className="font-bold text-lg">${item.projectedRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Confidence</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.confidenceLevel === 'High' ? 'bg-accent/10 text-accent' :
                          item.confidenceLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {item.confidenceLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}