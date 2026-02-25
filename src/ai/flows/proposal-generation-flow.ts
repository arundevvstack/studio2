'use server';
/**
 * @fileOverview AI Flow for generating strategic media production proposals.
 * 
 * - generateProposalContent - Generates structured sections for client proposals.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProposalInputSchema = z.object({
  clientName: z.string(),
  brandName: z.string(),
  projectTitle: z.string(),
  projectType: z.string(),
  objective: z.string(),
  targetAudience: z.string(),
  deliverables: z.string(),
  scope: z.array(z.string()),
  timeline: z.string(),
  budgetRange: z.string(),
});

export type ProposalInput = z.infer<typeof ProposalInputSchema>;

const ProposalOutputSchema = z.object({
  introduction: z.string().describe('Professional introduction and project context.'),
  scopeUnderstanding: z.string().describe('Detailed breakdown of how we understand their requirements.'),
  strategicApproach: z.string().describe('The unique creative and technical strategy for this project.'),
  executionPlan: z.string().describe('Step-by-step production plan from Pre to Post.'),
  deliverablesSummary: z.string().describe('Clear list of what the client receives.'),
  timelinePhases: z.string().describe('Chronological breakdown of project milestones.'),
  investmentSummary: z.string().describe('Explanation of value and budget allocation.'),
  whyChooseUs: z.string().describe('Competitive advantages and agency strengths.'),
});

export type ProposalOutput = z.infer<typeof ProposalOutputSchema>;

export async function generateProposalContent(input: ProposalInput): Promise<ProposalOutput> {
  return proposalFlow(input);
}

const proposalPrompt = ai.definePrompt({
  name: 'proposalPrompt',
  input: { schema: ProposalInputSchema },
  output: { schema: ProposalOutputSchema },
  prompt: `You are a high-level strategic consultant for a premium media production agency.
Generate a comprehensive, professional proposal for the following project:

Client: {{{clientName}}} (Brand: {{{brandName}}})
Title: {{{projectTitle}}}
Type: {{{projectType}}}
Objective: {{{objective}}}
Audience: {{{targetAudience}}}
Deliverables: {{{deliverables}}}
Scope of Work: {{#each scope}}{{{this}}}, {{/each}}
Timeline: {{{timeline}}}
Investment: {{{budgetRange}}}

Format the output into these specific sections:
1. Introduction: Set the stage and show excitement.
2. Scope Understanding: Demonstrate deep understanding of their specific needs.
3. Strategic Approach: How we will use creative intelligence to solve their problem.
4. Execution Plan: A clear production roadmap.
5. Deliverables: Concrete list of assets.
6. Timeline: When they can expect results.
7. Investment: The value proposition of the budget.
8. Why Us: Our unique edge in AI, influencers, and production.

Tone: Professional, persuasive, data-backed, and visionary. Avoid fluff; focus on results.`,
});

const proposalFlow = ai.defineFlow(
  {
    name: 'proposalFlow',
    inputSchema: ProposalInputSchema,
    outputSchema: ProposalOutputSchema,
  },
  async (input) => {
    const { output } = await proposalPrompt(input);
    return output!;
  }
);
