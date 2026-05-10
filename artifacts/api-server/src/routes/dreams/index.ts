import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] || "dummy",
});

const anthropic = new Anthropic({
  baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] || "dummy",
});

router.post("/dreams/interpret", async (req, res) => {
  try {
    const { dreamText } = req.body as { dreamText: string };
    if (!dreamText || typeof dreamText !== "string" || dreamText.trim().length < 10) {
      res.status(400).json({ error: "dreamText is required" });
      return;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a compassionate dream interpreter combining psychology, symbolism, and mindfulness insights. Analyze the dream below and respond with ONLY valid JSON — no markdown, no code blocks, no explanation before or after, just the raw JSON object.

JSON shape:
{
  "title": "a poetic 3-5 word title for this dream",
  "interpretation": "2-3 paragraphs of emotional and psychological interpretation",
  "symbols": [{"symbol": "symbol name", "meaning": "what it represents for the dreamer"}],
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "insights": "one paragraph of deeper psychological insights",
  "advice": "one gentle, practical reflection or action the dreamer can take"
}

Dream:
"${dreamText.trim()}"`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      res.status(500).json({ error: "Unexpected AI response" });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(block.text);
    } catch {
      const match = block.text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        res.status(500).json({ error: "Failed to parse AI response" });
        return;
      }
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Dream interpretation error");
    res.status(500).json({ error: "Failed to interpret dream" });
  }
});

router.post("/dreams/image", async (req, res) => {
  try {
    const { dreamText, interpretation, visualStyle } = req.body as {
      dreamText: string;
      interpretation?: { title?: string; symbols?: Array<{ symbol: string }>; emotions?: string[] };
      visualStyle?: string;
    };

    if (!dreamText || typeof dreamText !== "string") {
      res.status(400).json({ error: "dreamText is required" });
      return;
    }

    const style = visualStyle || "Cinematic";
    const title = interpretation?.title || "";
    const symbols = interpretation?.symbols?.slice(0, 3).map((s) => s.symbol).join(", ") || "";
    const emotions = interpretation?.emotions?.slice(0, 2).join(", ") || "";

    const styleMap: Record<string, string> = {
      Cinematic: "cinematic photorealistic, dramatic lighting, anamorphic lens flare, film grain",
      Surreal: "surrealist painting, Salvador Dali inspired, dreamlike impossible geometry, melting forms",
      Fantasy: "epic fantasy digital art, magical atmosphere, luminous ethereal light, painterly",
      Horror: "dark horror atmosphere, ominous lighting, unsettling shadows, gothic",
      Anime: "anime illustration style, cel shading, vibrant colors, Studio Ghibli inspired",
      Watercolor: "soft watercolor painting, flowing washes of color, delicate brushwork, impressionistic",
      Cyberpunk: "cyberpunk neon-lit cityscape, holographic, rain-soaked streets, sci-fi",
    };

    const stylePrompt = styleMap[style] || styleMap.Cinematic;

    const prompt = [
      `A ${style.toLowerCase()} dream scene: ${title ? `"${title}" — ` : ""}${dreamText.slice(0, 200)}`,
      symbols ? `Key symbols: ${symbols}.` : "",
      emotions ? `Emotional tone: ${emotions}.` : "",
      stylePrompt,
      "No text, no words, no letters. Dark cosmic atmosphere. Purple and cyan color palette. Highly detailed.",
    ]
      .filter(Boolean)
      .join(" ");

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      res.status(500).json({ error: "No image returned" });
      return;
    }

    res.json({ b64_json: b64 });
  } catch (err) {
    req.log.error({ err }, "Dream image generation error");
    res.status(500).json({ error: "Failed to generate dream image" });
  }
});

router.post("/dreams/chat", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = `You are Luna, a gentle and empathetic AI dream companion from DreamScape AI. You help people understand their dreams, process their emotions, and gently uncover what their subconscious might be telling them.

Your tone is:
- Warm, calm, and compassionate
- Thoughtfully curious — you ask gentle follow-up questions
- Never clinical, cold, or prescriptive
- Poetic when it fits, but always clear

Keep responses to 2-4 sentences unless the user asks for more. Acknowledge the emotional weight of what they share. You can draw on Jungian psychology, mindfulness, and symbolic interpretation, but always lead with empathy.`;

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Dream chat error");
    res.write(`data: ${JSON.stringify({ error: "Chat error occurred" })}\n\n`);
    res.end();
  }
});

export default router;
