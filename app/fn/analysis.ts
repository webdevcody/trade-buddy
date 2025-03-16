import { createServerFn } from "@tanstack/start";
import { authenticatedMiddleware } from "~/lib/auth";
import { z } from "zod";
import OpenAI from "openai";
import { env } from "~/utils/env";
import { getStorageUrl } from "~/utils/storage";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const analysisResponseSchema = z.object({
  recommendation: z.enum(["LONG", "SHORT", "WAIT"]),
  confidence: z.number().min(0).max(100),
  analysis: z.string(),
  patterns: z.array(z.string()),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

const systemPrompt = `You are an expert technical analyst reviewing trading chart images. Analyze the provided chart images together to determine market trends, patterns, and trading opportunities. Focus on:

1. Overall trend direction and strength
2. Key reversal patterns
3. Support and resistance levels
4. Trading recommendation (LONG, SHORT, or WAIT)

Provide a structured analysis with a clear recommendation and confidence level.`;

const analysisInputSchema = z.object({
  symbol: z.string(),
  images: z.array(
    z.object({
      timeframe: z.string(),
      imageId: z.string(),
    })
  ),
});

async function fetchAndEncodeImage(imageId: string): Promise<string> {
  const imageUrl = getStorageUrl(imageId);
  const response = await fetch(imageUrl);
  const contentType = response.headers.get("content-type");

  // Check if content type is supported
  const supportedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  if (!contentType || !supportedTypes.includes(contentType)) {
    throw new Error(
      `Unsupported image type: ${contentType}. Supported types are: png, jpeg, gif, webp`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export const analyzeChartsWithAIFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(analysisInputSchema)
  .handler(async ({ data }) => {
    try {
      // Fetch and encode all images in parallel
      const encodedImages = await Promise.all(
        data.images.map(async ({ timeframe, imageId }) => ({
          timeframe,
          base64Data: await fetchAndEncodeImage(imageId),
        }))
      );

      const messages = [
        {
          role: "system" as const,
          content: systemPrompt,
        },
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `Please analyze these ${data.symbol} charts across different timeframes (${encodedImages
                .map((img) => img.timeframe)
                .join(", ")}) and provide trading recommendations.`,
            },
            ...encodedImages.map(({ base64Data }) => ({
              type: "image_url" as const,
              image_url: {
                url: base64Data, // Now base64Data already includes the data URL prefix
              },
            })),
          ],
        },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1000,
      });

      const analysis = response.choices[0].message.content || "";

      // Extract recommendation and confidence from the analysis
      let recommendation: "LONG" | "SHORT" | "WAIT" = "WAIT";
      if (analysis.toUpperCase().includes("LONG")) {
        recommendation = "LONG";
      } else if (analysis.toUpperCase().includes("SHORT")) {
        recommendation = "SHORT";
      }

      // Extract patterns (looking for common pattern names)
      const patternKeywords = [
        "Head and Shoulders",
        "Double Top",
        "Double Bottom",
        "Triangle",
        "Flag",
        "Pennant",
        "Channel",
        "Cup and Handle",
        "Wedge",
      ];

      const patterns = patternKeywords.filter((pattern) =>
        analysis.toLowerCase().includes(pattern.toLowerCase())
      );

      // Estimate confidence based on language used
      let confidence = 70;
      if (analysis.toLowerCase().includes("strong")) confidence = 85;
      if (analysis.toLowerCase().includes("very strong")) confidence = 95;
      if (analysis.toLowerCase().includes("weak")) confidence = 55;
      if (analysis.toLowerCase().includes("uncertain")) confidence = 40;
      if (analysis.toLowerCase().includes("unclear")) confidence = 30;

      const result: AnalysisResponse = {
        recommendation,
        confidence,
        analysis,
        patterns,
      };

      return analysisResponseSchema.parse(result);
    } catch (error) {
      console.error("Failed to analyze charts:", error);
      throw new Error("Failed to analyze charts");
    }
  });
