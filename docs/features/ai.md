# AI Features

AI-powered inventory recommendations using Google's Gemini Pro.

![AI Insights](/images/ai-insight.png)

## Overview

- Inventory optimization recommendations
- Reorder amount suggestions
- Promotional opportunities for slow-moving items

## Setup

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file:
   ```bash
   GOOGLE_GENAI_API_KEY=your-api-key-here
   ```
3. Restart application

## AI Recommendations

View on the dashboard:

- **Optimal Inventory Levels** - Strategic guidance on stock levels by category
- **Promotional Opportunities** - Suggestions for moving slow inventory
- **Reorder Amounts** - Purchasing recommendations based on sales trends

AI analyzes your sales data, current inventory, and deshelving patterns to provide intelligent recommendations.

## Requirements

- Internet connection
- Google Generative AI API key
- Sufficient API quota
- Supports English, French, Spanish, German

## Technical Details

- **Framework**: Google Genkit
- **Model**: Gemini Pro
- **Processing**: Server-side

## Related Features

- [Dashboard](/features/dashboard) - View AI recommendations
- [Inventory](/features/inventory) - Inventory management
