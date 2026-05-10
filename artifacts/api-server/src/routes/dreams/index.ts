import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

const router = Router();

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
