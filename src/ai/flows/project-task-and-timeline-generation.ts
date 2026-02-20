'use server';
/**
 * @fileOverview A Genkit flow for generating project tasks and a high-level timeline based on a project description.
 *
 * - generateProjectTasksAndTimeline - A function that handles the generation process.
 * - ProjectTaskAndTimelineGenerationInput - The input type for the generateProjectTasksAndTimeline function.
 * - ProjectTaskAndTimelineGenerationOutput - The return type for the generateProjectTasksAndTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectTaskAndTimelineGenerationInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A brief description of the project for which to generate tasks and a timeline.'),
});
export type ProjectTaskAndTimelineGenerationInput = z.infer<
  typeof ProjectTaskAndTimelineGenerationInputSchema
>;

const ProjectTaskAndTimelineGenerationOutputSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      description: z
        .string()
        .describe('A detailed description explaining what needs to be done for this task.'),
      estimatedDuration: z
        .string()
        .describe('The estimated duration for this task (e.g., "3 days", "1 week", "2 hours").'),
    })
  ).describe('A list of proposed tasks with descriptions and estimated durations for the project.'),
  timelineSummary: z
    .string()
    .describe(
      'A high-level summary of the project timeline, including major phases, milestones, and estimated overall duration (e.g., "Phase 1: Planning (1 week), Phase 2: Execution (2 weeks), Phase 3: Review (3 days). Overall: 3 weeks and 3 days.")'
    ),
});
export type ProjectTaskAndTimelineGenerationOutput = z.infer<
  typeof ProjectTaskAndTimelineGenerationOutputSchema
>;

export async function generateProjectTasksAndTimeline(
  input: ProjectTaskAndTimelineGenerationInput
): Promise<ProjectTaskAndTimelineGenerationOutput> {
  return projectTaskAndTimelineGenerationFlow(input);
}

const projectTaskAndTimelineGenerationPrompt = ai.definePrompt({
  name: 'projectTaskAndTimelineGenerationPrompt',
  input: {schema: ProjectTaskAndTimelineGenerationInputSchema},
  output: {schema: ProjectTaskAndTimelineGenerationOutputSchema},
  prompt: `You are an expert project manager for a media production company. Your goal is to help a project manager quickly set up a new project by generating a proposed list of tasks and a high-level timeline.

Based on the following project description, generate a comprehensive list of tasks including their names, detailed descriptions, and estimated durations. Also, provide a high-level summary of the project's timeline, breaking it down into major phases and overall estimated duration.

Project Description: {{{projectDescription}}}

Ensure your output is a valid JSON object matching the specified schema for tasks and timeline summary.`,
});

const projectTaskAndTimelineGenerationFlow = ai.defineFlow(
  {
    name: 'projectTaskAndTimelineGenerationFlow',
    inputSchema: ProjectTaskAndTimelineGenerationInputSchema,
    outputSchema: ProjectTaskAndTimelineGenerationOutputSchema,
  },
  async input => {
    const {output} = await projectTaskAndTimelineGenerationPrompt(input);
    return output!;
  }
);
