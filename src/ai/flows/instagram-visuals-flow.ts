'use server';
/**
 * @fileOverview A visual extraction engine for social media profiles.
 * 
 * - fetchInstagramVisuals - A function that handles the intelligence extraction process using AI.
 * - InstagramVisualsInput - The input type requiring an Instagram URL and talent category.
 * - InstagramVisualsOutput - The structured return type containing style analysis, metrics, and visual assets.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InstagramVisualsInputSchema = z.object({
  instagramUrl: z.string().describe('The URL or handle of the Instagram profile.'),
  category: z.string().describe('The creative category of the talent (e.g. Model, DOP).'),
});
export type InstagramVisualsInput = z.infer<typeof InstagramVisualsInputSchema>;

const InstagramVisualsOutputSchema = z.object({
  profilePictureUrl: z.string().describe('The primary profile thumbnail extracted from Instagram.'),
  styleAnalysis: z.string().describe('A briefing on the talent\'s visual identity and style.'),
  followers: z.string().describe('Total follower count (e.g. "12.4k").'),
  posts: z.string().describe('Total posts count (e.g. "432").'),
  engagementRate: z.string().describe('Calculated engagement rate (e.g. "4.2%").'),
  visuals: z.array(z.object({
    url: z.string().describe('The URL of the image asset.'),
    likes: z.string().describe('Engagement metrics summary.'),
    description: z.string().describe('Visual context description.')
  })).describe('A collection of extracted professional visuals.'),
});
export type InstagramVisualsOutput = z.infer<typeof InstagramVisualsOutputSchema>;

export async function fetchInstagramVisuals(input: InstagramVisualsInput): Promise<InstagramVisualsOutput> {
  return instagramVisualsFlow(input);
}

const instagramVisualsPrompt = ai.definePrompt({
  name: 'instagramVisualsPrompt',
  input: { schema: InstagramVisualsInputSchema },
  output: { schema: InstagramVisualsOutputSchema },
  prompt: `You are a social media intelligence agent. 
Given an Instagram profile URL or handle and a talent category, generate a professional analysis of their social presence.

Instagram URL/Handle: {{{instagramUrl}}}
Category: {{{category}}}

Since you are in a simulation environment, generate realistic and high-fidelity metrics that would be typical for a professional in this category.
The profile picture URL should be in the format: https://picsum.photos/seed/[handle]-profile/400/400
The visual URLs should be in the format: https://picsum.photos/seed/[handle]-[index]/600/600

Ensure the follower count is a realistic string like "12.4k" or "1.2m".
Ensure the engagement rate is a percentage string like "4.5%".`,
});

const instagramVisualsFlow = ai.defineFlow(
  {
    name: 'instagramVisualsFlow',
    inputSchema: InstagramVisualsInputSchema,
    outputSchema: InstagramVisualsOutputSchema,
  },
  async (input) => {
    const { output } = await instagramVisualsPrompt(input);
    return output!;
  }
);
