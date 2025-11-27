"use server";

/**
 * @fileOverview This file defines a Genkit flow for generating inventory recommendations based on sales data.
 *
 * - getInventoryRecommendations - A function that generates inventory recommendations.
 * - InventoryRecommendationsInput - The input type for the getInventoryRecommendations function.
 * - InventoryRecommendationsOutput - The return type for the getInventoryRecommendations function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const InventoryRecommendationsInputSchema = z.object({
  salesData: z
    .string()
    .describe(
      "Sales data, including product names, quantities sold, and dates of sales. Must be in a clear, parseable format, such as JSON or CSV."
    ),
  currentInventory: z
    .string()
    .describe(
      "Current inventory levels for each product. Must be in a clear, parseable format, such as JSON or CSV."
    ),
  storeName: z.string().describe("The name of the store."),
  language: z
    .string()
    .describe(
      "The language to generate recommendations in (e.g., 'en', 'fr', 'es', 'de')."
    )
    .default("en"),
});
export type InventoryRecommendationsInput = z.infer<
  typeof InventoryRecommendationsInputSchema
>;

const InventoryRecommendationsOutputSchema = z.object({
  optimalLevels: z
    .string()
    .describe(
      "Strategic summary of inventory level recommendations focusing on overall patterns, categories, and turnover optimization for store management. MUST be formatted as clean HTML with proper tags (p, ul, li, strong, em)."
    ),
  promotionalOpportunities: z
    .string()
    .describe(
      "High-level promotional strategy recommendations based on sales trends and inventory movement for physical store operations. MUST be formatted as clean HTML with proper tags (p, ul, li, strong, em)."
    ),
  reorderAmounts: z
    .string()
    .describe(
      "Strategic purchasing guidance focusing on category priorities, budget allocation, and supplier management for store inventory. MUST be formatted as clean HTML with proper tags (p, ul, li, strong, em)."
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
  name: "inventoryRecommendationsPrompt",
  input: { schema: InventoryRecommendationsInputSchema },
  output: { schema: InventoryRecommendationsOutputSchema },
  prompt: `You are an expert inventory management consultant/auditor for physical retail stores. This is a store management system for tracking sales and inventory, not an e-commerce platform.

  Based on the sales data, current inventory levels, and deshelving analytics provided, generate high-level strategic insights and recommendations for {{storeName}}.

  Sales Data: {{{salesData}}}
  Current Inventory Levels: {{{currentInventory}}}

  IMPORTANT: Generate all recommendations in the following language: {{language}}
  - If language is "en": Use English
  - If language is "fr": Use French (Français)
  - If language is "es": Use Spanish (Español)
  - If language is "de": Use German (Deutsch)
  - Use natural, professional language appropriate for business communications in the specified language.

  The sales data includes deshelving insights that show inventory losses due to various reasons like damage, expiration, theft, quality control issues, recalls, etc. Use this information to provide comprehensive inventory management recommendations.

  CRITICAL: First analyze the dataQuality object in the sales data to understand what data is available:
  - If isEmpty is true: Focus on setup recommendations for a new store
  - If isLimitedData is true: Provide growth-focused recommendations with data collection advice
  - If hasSalesData is false: Focus on inventory-only analysis and sales activation strategies
  - If hasProductData is false: Provide setup and stocking recommendations
  - Always acknowledge the current data state and tailor recommendations accordingly

  IMPORTANT: Always provide valuable, actionable insights regardless of data completeness. Adapt your recommendations to the available data quality and store situation. For limited data scenarios, include advice on data collection and baseline establishment.

  Provide summary-level insights and actionable recommendations that help store managers make informed decisions. Focus on overall trends, patterns, and strategic guidance rather than individual product details.

  **Inventory Level Strategy:**
  Analyze overall inventory health and provide strategic guidance on:
  - General inventory turnover patterns
  - Categories that may be overstocked or understocked
  - Seasonal trends affecting inventory decisions
  - Storage space optimization recommendations
  - Impact of inventory losses (deshelving) on stock levels and reorder timing
  
  **Sales & Promotion Strategy:**
  Provide strategic insights on:
  - Current inventory composition and potential promotional opportunities
  - Product categories that could benefit from targeted marketing
  - Seasonal considerations for promotional timing
  - Strategies to improve inventory turnover based on current stock levels
  - Promotional opportunities for products with high deshelving rates to move them faster
  
  **Purchasing & Reorder Strategy:**
  Offer high-level guidance on:
  - Inventory balance assessment and reordering priorities
  - Budget allocation recommendations based on current stock levels
  - Risk management for overstocked or slow-moving categories
  - Optimization strategies for storage space and cash flow
  - Adjusting reorder quantities to account for expected inventory losses
  
  **Loss Prevention & Quality Control:**
  Based on deshelving analytics, provide recommendations on:
  - Identifying patterns in inventory losses and their root causes
  - Preventive measures for high-loss product categories
  - Storage and handling improvements to reduce damage and expiration
  - Quality control processes to minimize defective products
  - Security measures if theft is a significant factor
  
  Always provide positive, actionable recommendations that help store managers optimize their operations. Focus on inventory optimization, cash flow improvement, operational efficiency, and loss prevention based on the available data.
  
  **CRITICAL OUTPUT FORMAT REQUIREMENT:**
  Format ALL responses as clean, semantic HTML using these tags ONLY:
  - <p> for paragraphs
  - <ul> and <li> for bullet lists
  - <strong> for emphasis/bold text
  - <em> for italic text
  - <h4> for section headings within recommendations
  
  Do NOT use markdown syntax (**, *, -, #). Output ONLY valid HTML.
  Example format:
  <p>Based on your inventory analysis, here are key recommendations:</p>
  <ul>
    <li><strong>Category A:</strong> Consider reducing stock levels by 20%</li>
    <li><strong>Category B:</strong> Increase promotional activities</li>
  </ul>
  <p>These changes will improve cash flow and reduce storage costs.</p>
  `,
});

const inventoryRecommendationsFlow = ai.defineFlow(
  {
    name: "inventoryRecommendationsFlow",
    inputSchema: InventoryRecommendationsInputSchema,
    outputSchema: InventoryRecommendationsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
