'use server';
/**
 * @fileOverview A hyper-local Genkit flow for generating real-time market research insights and actionable growth assets.
 * 
 * - generateMarketResearch - A function that handles the intelligence generation process.
 * - MarketResearchInput - The input type for the research query.
 * - MarketResearchOutput - The structured return type for the research report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketResearchInputSchema = z.object({
  focus: z.string().describe('Focus area like "Video Production", "VFX", or "Content Creation"'),
  timeframe: z.enum(['Today', 'This Week', 'This Month', 'Next 3 Months']).describe('The temporal scope of the research.'),
  location: z.string().optional().describe('The geographic target for local demand analysis.'),
  radius: z.number().optional().describe('The search radius in kilometers.'),
});
export type MarketResearchInput = z.infer<typeof MarketResearchInputSchema>;

const MarketResearchOutputSchema = z.object({
  marketTrends: z.array(z.object({
    trend: z.string().describe('The name of the trend.'),
    impact: z.enum(['High', 'Medium', 'Low']).describe('The strategic impact level.'),
    description: z.string().describe('Details about how this trend affects the industry.')
  })).describe('Top trends in the media production market for the given timeframe.'),
  demandByIndustry: z.array(z.object({
    industry: z.string().describe('The industry sector name.'),
    demandLevel: z.number().min(1).max(100).describe('Current demand score.'),
    growthRate: z.string().describe('Projected growth.')
  })).describe('Local demand levels across various sectors.'),
  requiredSkills: z.array(z.string()).describe('High-demand skills for this specific window.'),
  marketingSuggestions: z.array(z.object({
    strategy: z.string().describe('The marketing approach.'),
    actionItem: z.string().describe('A concrete step to take.'),
    reasoning: z.string().describe('Why this strategy works now.')
  })).describe('Tactical marketing suggestions based on content trends.'),
  contentPackages: z.array(z.object({
    packageName: z.string().describe('Name of the suggested media package.'),
    priceRange: z.string().describe('Suggested price range in INR.'),
    deliverables: z.array(z.string()).describe('List of items included in the package.'),
    targetAudience: z.string().describe('The specific business type this package targets.')
  })).describe('Suggested service packages to offer based on current demand.'),
  potentialClientLeads: z.array(z.object({
    businessType: z.string().describe('The niche or type of business (e.g. Real Estate Agent, Luxury Cafe).'),
    contactStrategy: z.enum(['Email', 'Instagram DM', 'WhatsApp', 'Phone Call']).describe('The most effective way to reach them.'),
    reasoning: z.string().describe('Why they need your services right now.'),
    estimatedBudget: z.string().describe('Estimated budget range for this client type.')
  })).describe('Specific client archetypes to target in the selected location.'),
  mostSearchedClients: z.array(z.string()).describe('List of most searched client types in the target location.'),
  executiveSummary: z.string().describe('A high-level strategic briefing.')
});
export type MarketResearchOutput = z.infer<typeof MarketResearchOutputSchema>;

export async function generateMarketResearch(input: MarketResearchInput): Promise<MarketResearchOutput> {
  return marketResearchFlow(input);
}

const marketResearchPrompt = ai.definePrompt({
  name: 'marketResearchPrompt',
  input: { schema: MarketResearchInputSchema },
  output: { schema: MarketResearchOutputSchema },
  prompt: `You are a high-level strategic consultant for the media production industry specializing in real-time data analysis. 
Your goal is to provide actionable intelligence based on the following parameters:

Focus Area: {{{focus}}}
Timeframe: {{{timeframe}}}
Location: {{{location}}}
Radius: {{radius}}km

Analyze current internet search patterns, social media trends (Instagram Reels, TikTok, YouTube Shorts), and local business data to generate a report including:
1. Major market trends specifically relevant to the next {{timeframe}}.
2. Localized demand breakdown for industries within {{radius}}km of {{{location}}}.
3. The "Most Searched Client Types" looking for media services right now.
4. Specific marketing suggestions for a production agency to capture this demand.
5. High-demand creative skills.
6. **ACTIONABLE ASSETS**: 
   - Suggest 3 "Content Packages" that would sell fast in this market right now.
   - Provide a list of "Potential Client Leads" based on industry demand in {{{location}}}. For these leads, specify if they are likely to be reached via Social Media (DM), Email, or Direct Call, and why they are currently a "Hot" lead.

Ensure the tone is professional, insightful, and reflects real-time global and local market signals.`,
});

const marketResearchFlow = ai.defineFlow(
  {
    name: 'marketResearchFlow',
    inputSchema: MarketResearchInputSchema,
    outputSchema: MarketResearchOutputSchema,
  },
  async (input) => {
    const { output } = await marketResearchPrompt(input);
    return output!;
  }
);
