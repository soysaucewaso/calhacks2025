// Simplified AI configuration for demo purposes
// In production, you would use actual AI services

export const ai = {
  // Mock AI functions for demo
  definePrompt: (config: any) => ({
    name: config.name,
    input: config.input,
    output: config.output,
    prompt: config.prompt,
  }),
  defineFlow: (config: any, handler: any) => handler,
};
