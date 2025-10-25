'use server';
/**
 * @fileOverview Generates a personalized training assignment when a user fails a phishing simulation.
 *
 * - generatePhishingTrainingAssignment - A function that handles the training assignment generation.
 * - GeneratePhishingTrainingAssignmentInput - The input type for the generatePhishingTrainingAssignment function.
 * - GeneratePhishingTrainingAssignmentOutput - The return type for the generatePhishingTrainingAssignment function.
 */

import { z } from 'zod';

const GeneratePhishingTrainingAssignmentInputSchema = z.object({
  employeeName: z.string().describe('The name of the employee who failed the phishing simulation.'),
  employeeEmail: z.string().email().describe('The email address of the employee.'),
  phishingSimulationDetails: z.string().describe('Details about the phishing simulation, including the theme, and any tricks used.'),
});
export type GeneratePhishingTrainingAssignmentInput = z.infer<typeof GeneratePhishingTrainingAssignmentInputSchema>;

const GeneratePhishingTrainingAssignmentOutputSchema = z.object({
  trainingTitle: z.string().describe('The title of the training assignment.'),
  trainingSteps: z.array(z.string()).describe('A list of steps for the training assignment.'),
  youtubeLink: z.string().url().describe('A link to a relevant YouTube video.'),
  quizQuestions: z.array(z.string()).describe('A list of quiz questions to test understanding.'),
});
export type GeneratePhishingTrainingAssignmentOutput = z.infer<typeof GeneratePhishingTrainingAssignmentOutputSchema>;

export async function generatePhishingTrainingAssignment(input: GeneratePhishingTrainingAssignmentInput): Promise<GeneratePhishingTrainingAssignmentOutput> {
  // Simulate AI processing with dummy data
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
  
  return {
    trainingTitle: `Phishing Awareness Training for ${input.employeeName}`,
    trainingSteps: [
      "Always verify the sender's email address before clicking any links",
      "Look for spelling errors and suspicious URLs in emails",
      "When in doubt, contact IT support to verify the email's legitimacy"
    ],
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    quizQuestions: [
      "What should you do if you receive an email asking for your password?",
      "How can you identify a suspicious email?",
      "Who should you contact if you're unsure about an email's legitimacy?"
    ]
  };
}
