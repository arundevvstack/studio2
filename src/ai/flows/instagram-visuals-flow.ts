'use server';
/**
 * @fileOverview A visual extraction engine for social media profiles.
 * 
 * - fetchInstagramVisuals - A function that simulates the extraction of professional assets from Instagram.
 * - InstagramVisualsInput - The input type requiring an Instagram URL and talent category.
 * - InstagramVisualsOutput - The structured return type containing style analysis and visual assets.
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
    // Here, we use the Gemini model to "describe" the expected style based on the category and mock the results.
    
    const seed = input.instagramUrl.split('/').filter(Boolean).pop() || 'creative';
    
    // We simulate a delay for the "extraction" process
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      profilePictureUrl: `https://picsum.photos/seed/${seed}-profile/400/400`,
      styleAnalysis: `Visual architecture for this ${input.category} profile demonstrates high-fidelity production values. The feed maintains a consistent chromatic temperature with a professional focus on cinematic framing and modern ${input.category} aesthetics.`,
      visuals: Array.from({ length: 9 }).map((_, i) => ({
        url: `https://picsum.photos/seed/${seed}-${i}/600/600`,
        likes: `${(Math.random() * 12 + 1).toFixed(1)}k`,
        description: `Strategic ${input.category} asset demonstrating professional grade lighting and composition.`
      }))
    };
  }
);
