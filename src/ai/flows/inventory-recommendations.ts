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
      'Strategic summary of inventory level recommendations focusing on overall patterns, categories, and turnover optimization for store management.'
    ),
  promotionalOpportunities: z
    .string()
    .describe(
      'High-level promotional strategy recommendations based on sales trends and inventory movement for physical store operations.'
    ),
  reorderAmounts: z
    .string()
    .describe(
      'Strategic purchasing guidance focusing on category priorities, budget allocation, and supplier management for store inventory.'
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
  prompt: `You are an expert inventory management consultant/auditor for physical retail stores. This is a store management system for tracking sales and inventory, not an e-commerce platform.

  Based on the sales data and current inventory levels provided, generate high-level strategic insights and recommendations for {{storeName}}.

  Sales Data: {{{salesData}}}
  Current Inventory Levels: {{{currentInventory}}}

  IMPORTANT: Even if sales data is limited or sparse, provide valuable insights based on the inventory data and general retail best practices. Do not start responses with phrases like "Given the lack of sales data" or "Without sales data". Instead, focus on what can be analyzed and provide actionable recommendations.

  Provide summary-level insights and actionable recommendations that help store managers make informed decisions. Focus on overall trends, patterns, and strategic guidance rather than individual product details.

  **Inventory Level Strategy:**
  Analyze overall inventory health and provide strategic guidance on:
  - General inventory turnover patterns
  - Categories that may be overstocked or understocked
  - Seasonal trends affecting inventory decisions
  - Storage space optimization recommendations
  
  **Sales & Promotion Strategy:**
  Provide strategic insights on:
  - Current inventory composition and potential promotional opportunities
  - Product categories that could benefit from targeted marketing
  - Seasonal considerations for promotional timing
  - Strategies to improve inventory turnover based on current stock levels
  
  **Purchasing & Reorder Strategy:**
  Offer high-level guidance on:
  - Inventory balance assessment and reordering priorities
  - Budget allocation recommendations based on current stock levels
  - Risk management for overstocked or slow-moving categories
  - Optimization strategies for storage space and cash flow
  
  Always provide positive, actionable recommendations that help store managers optimize their operations. Focus on inventory optimization, cash flow improvement, and operational efficiency based on the available data.
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
