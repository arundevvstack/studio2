'use server';
/**
 * @fileOverview A Genkit flow for generating market research insights for the media production industry.
 * 
 * - generateMarketResearch - A function that handles the intelligence generation process.
 * - MarketResearchInput - The input type for the research query.
 * - MarketResearchOutput - The structured return type for the research report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketResearchInputSchema = z.object({
  focus: z.string().describe('Specific focus area like "Video Production", "VFX", "Photography" or "Short-form Content"'),
});
export type MarketResearchInput = z.infer<typeof MarketResearchInputSchema>;

const MarketResearchOutputSchema = z.object({
  marketTrends: z.array(z.object({
    trend: z.string().describe('The name of the trend.'),
    impact: z.enum(['High', 'Medium', 'Low']).describe('The strategic impact level.'),
    description: z.string().describe('Details about how this trend affects the industry.')
  })).describe('Top trends in the media production market.'),
  demandByIndustry: z.array(z.object({
    industry: z.string().describe('The industry sector name (e.g., E-commerce, Real Estate).'),
    demandLevel: z.number().min(1).max(100).describe('Current demand score out of 100.'),
    growthRate: z.string().describe('Projected growth rate percentage or qualitative description.')
  })).describe('Demand levels across various sectors.'),
  requiredSkills: z.array(z.string()).describe('List of high-demand skills for production experts.'),
  executiveSummary: z.string().describe('A high-level strategic briefing of the research findings.')
});
export type MarketResearchOutput = z.infer<typeof MarketResearchOutputSchema>;

export async function generateMarketResearch(input: MarketResearchInput): Promise<MarketResearchOutput> {
  return marketResearchFlow(input);
}

const marketResearchPrompt = ai.definePrompt({
  name: 'marketResearchPrompt',
  input: { schema: MarketResearchInputSchema },
  output: { schema: MarketResearchOutputSchema },
  prompt: `You are a high-level strategic consultant for the media production industry. 
Your goal is to provide real-world, data-driven insights about market demands, industry requirements, and growth vectors for 2024-2025.

Focus Area: {{{focus}}}

Generate a comprehensive market research report that includes:
1. Five major market trends currently shaping this focus area.
2. A breakdown of at least four specific industries (e.g., E-commerce, Healthcare, EdTech, Real Estate) and their current demand for media services.
3. A list of key technical or creative skills that production companies must master to stay competitive.
4. A professional executive summary that a CEO would use to make strategic decisions.

Ensure the tone is professional, insightful, and reflects actual global market intelligence.`,
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
