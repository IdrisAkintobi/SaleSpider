// src/ai/flows/inventory-recommendations.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating inventory recommendations based on sales data.
 *
 * - getInventoryRecommendations - A function that generates inventory recommendations.
 * - InventoryRecommendationsInput - The input type for the getInventoryRecommendations function.
 * - InventoryRecommendationsOutput - The return type for the getInventoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventoryRecommendationsInputSchema = z.object({
  salesData: z
    .string()
    .describe(
      'Sales data, including product names, quantities sold, and dates of sales. Must be in a clear, parseable format, such as JSON or CSV.'
    ),
  currentInventory: z
    .string()
    .describe(
      'Current inventory levels for each product. Must be in a clear, parseable format, such as JSON or CSV.'
    ),
  storeName: z.string().describe('The name of the store.'),
});
export type InventoryRecommendationsInput = z.infer<
  typeof InventoryRecommendationsInputSchema
>;

const InventoryRecommendationsOutputSchema = z.object({
  optimalLevels: z
    .string()
    .describe(
      'Recommended optimal inventory levels for each product, with reasoning. Must be in a clear, parseable format, such as JSON or CSV.'
    ),
  promotionalOpportunities: z
    .string()
    .describe(
      'Suggested promotional opportunities to maximize sales, including specific products and timing. Must be in a clear, parseable format, such as JSON or CSV.'
    ),
  reorderAmounts: z
    .string()
    .describe(
      'Recommended amounts to reorder for each product, considering lead times and demand. Must be in a clear, parseable format, such as JSON or CSV.'
    ),
});
export type InventoryRecommendationsOutput = z.infer<
  typeof InventoryRecommendationsOutputSchema
>;

export async function getInventoryRecommendations(
  input: InventoryRecommendationsInput
): Promise<InventoryRecommendationsOutput> {
  return inventoryRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryRecommendationsPrompt',
  input: {schema: InventoryRecommendationsInputSchema},
  output: {schema: InventoryRecommendationsOutputSchema},
  prompt: `You are an expert inventory management consultant for retail stores.

  Based on the sales data and current inventory levels provided, generate recommendations for optimal inventory levels, promotional opportunities, and reorder amounts for {{storeName}}.

  Sales Data: {{{salesData}}}
  Current Inventory Levels: {{{currentInventory}}}

  Consider factors such as seasonality, product popularity, and lead times when making your recommendations. Format your output in a parseable format such as JSON or CSV.

  Specifically:
  *   Determine the optimal inventory levels for each product, explaining your reasoning.
  *   Identify promotional opportunities to maximize sales, including specific products and timing.
  *   Calculate recommended reorder amounts for each product, considering lead times and demand.
  `,
});

const inventoryRecommendationsFlow = ai.defineFlow(
  {
    name: 'inventoryRecommendationsFlow',
    inputSchema: InventoryRecommendationsInputSchema,
    outputSchema: InventoryRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
