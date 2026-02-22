'use server';
/**
 * @fileOverview A visual extraction engine for social media profiles.
 * 
 * - fetchInstagramVisuals - A function that simulates the extraction of professional assets and metrics from Instagram.
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

const instagramVisualsFlow = ai.defineFlow(
  {
    name: 'instagramVisualsFlow',
    inputSchema: InstagramVisualsInputSchema,
    outputSchema: InstagramVisualsOutputSchema,
  },
  async (input) => {
    // Strategic Simulation: In a production environment, this would interface with a professional scraping service.
    // We use the Instagram ID as a seed for consistent results.
    
    const handle = input.instagramUrl.split('/').filter(Boolean).pop() || 'creative';
    const seed = handle.toLowerCase();
    
    // We simulate a delay for the "extraction" process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate deterministic random numbers based on seed for consistent feeling
    const getSeedNum = (str: string) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sNum = getSeedNum(seed);
    
    const followers = `${((sNum % 50) + 5).toFixed(1)}k`;
    const posts = `${(sNum % 800) + 100}`;
    const engagement = `${((sNum % 8) + 2).toFixed(1)}%`;

    return {
      profilePictureUrl: `https://picsum.photos/seed/${seed}-profile/400/400`,
      styleAnalysis: `The visual architecture for @${handle} in the ${input.category} vertical demonstrates high-fidelity production values. The feed maintains a consistent chromatic temperature with a professional focus on cinematic framing and modern ${input.category} aesthetics typical of premium Kerala talent.`,
      followers,
      posts,
      engagementRate: engagement,
      visuals: Array.from({ length: 9 }).map((_, i) => ({
        url: `https://picsum.photos/seed/${seed}-${i}/600/600`,
        likes: `${(Math.random() * 12 + 1).toFixed(1)}k`,
        description: `Strategic ${input.category} asset demonstrating professional grade lighting and composition for @${handle}.`
      }))
    };
  }
);
