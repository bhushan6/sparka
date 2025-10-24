import { generateObject, streamObject } from "ai";
import { z } from "zod";
import { getLanguageModel } from "../providers";

export async function selectToolsForPrompt(
  userMessage: string,
  availableTools: Record<string, string>,
): Promise<string[]> {
  if (Object.keys(availableTools).length === 0) {
    return [];
  }

  const toolDescriptions = Object.entries(availableTools)
    .map(([slug, description]) => `- ${slug}: ${description}`)
    .join("\n");

  const result = await generateObject({
    model: getLanguageModel("openai/gpt-4o"), // Using a capable model for tool selection
    system: `You are an expert tool selector. Based on the user's request, select the most relevant tools from the available list. Only select tools that are absolutely necessary to fulfill the request. If no tools are relevant, return an empty array.

Available Tools:
${toolDescriptions}

Your response should be a JSON array of the slugs of the selected tools.`,
    prompt: `User's request: ${userMessage}`,
    schema: z.object({
      selectedTools: z.array(z.string()),
    }),
  });

  const { selectedTools } = result.object;
  return selectedTools;
}
