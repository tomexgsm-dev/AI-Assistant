import { Router, type IRouter } from "express";
import { desc, eq, and } from "drizzle-orm";
import { db, conversations, messages, generatedImages, summaries, profiles, usageLimits } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GenerateOpenaiImageBody,
} from "@workspace/api-zod";

// ─── LIMITS ───────────────────────────────────────────────────────────────────
const FREE_CHAT_LIMIT = 20;
const FREE_IMAGE_LIMIT = 3;

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

async function getOrCreateUsage(clientId: string) {
  const today = todayStr();
  const [row] = await db
    .select()
    .from(usageLimits)
    .where(and(eq(usageLimits.clientId, clientId), eq(usageLimits.date, today)));
  if (row) return row;
  const [created] = await db
    .insert(usageLimits)
    .values({ clientId, date: today, chatCount: 0, imageCount: 0, isPro: 0 })
    .returning();
  return created;
}

async function incrementChat(clientId: string) {
  const today = todayStr();
  await db
    .update(usageLimits)
    .set({ chatCount: (await getOrCreateUsage(clientId)).chatCount + 1, updatedAt: new Date() })
    .where(and(eq(usageLimits.clientId, clientId), eq(usageLimits.date, today)));
}

async function incrementImage(clientId: string) {
  const today = todayStr();
  await db
    .update(usageLimits)
    .set({ imageCount: (await getOrCreateUsage(clientId)).imageCount + 1, updatedAt: new Date() })
    .where(and(eq(usageLimits.clientId, clientId), eq(usageLimits.date, today)));
}

const router: IRouter = Router();

const defaultSystemPrompt =
  "Jesteś inteligentnym, ogólnym AI asystentem. Pomagasz w każdej dziedzinie życia. Odpowiadasz zawsze w tym samym języku co użytkownik.";

async function getOrCreateProfile(): Promise<string> {
  const [profile] = await db.select().from(profiles).limit(1);
  return profile?.info ?? "";
}

async function getRecentSummaries(conversationId: number): Promise<string> {
  const rows = await db
    .select()
    .from(summaries)
    .where(eq(summaries.conversationId, conversationId))
    .orderBy(desc(summaries.createdAt))
    .limit(3);
  return rows
    .reverse()
    .map((s) => s.summary)
    .join("\n\n");
}

async function generateAndSaveSummary(conversationId: number, msgs: { role: string; content: string }[]): Promise<void> {
  try {
    const text = msgs.map((m) => `${m.role}: ${m.content}`).join("\n");
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Podsumuj najważniejsze informacje z tej rozmowy: cele użytkownika, ustalenia, kluczowe fakty. Bądź zwięzły (max 200 słów). Pisz po polsku.",
        },
        { role: "user", content: text },
      ],
    });
    const summary = completion.choices[0].message.content ?? "";
    if (summary) {
      await db.insert(summaries).values({
        conversationId,
        summary,
        messageCount: msgs.length,
      });

      const profileInfo = await getOrCreateProfile();
      const profileCompletion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "Na podstawie profilu użytkownika i nowego podsumowania rozmowy, stwórz zaktualizowany profil użytkownika. Uwzględnij: zainteresowania, cele, styl komunikacji, zawód, preferencje. Max 300 słów. Pisz po polsku.",
          },
          {
            role: "user",
            content: `Aktualny profil:\n${profileInfo || "(brak)"}\n\nNowe podsumowanie:\n${summary}`,
          },
        ],
      });
      const newProfile = profileCompletion.choices[0].message.content ?? "";
      if (newProfile) {
        const [existing] = await db.select().from(profiles).limit(1);
        if (existing) {
          await db.update(profiles).set({ info: newProfile, updatedAt: new Date() }).where(eq(profiles.id, existing.id));
        } else {
          await db.insert(profiles).values({ info: newProfile });
        }
      }
    }
  } catch (_err) {
    // Non-critical — don't break the chat flow
  }
}

router.get("/conversations", async (_req, res) => {
  const rows = await db
    .select()
    .from(conversations)
    .orderBy(conversations.createdAt);
  res.json(rows);
});

router.post("/conversations", async (req, res) => {
  const body = CreateOpenaiConversationBody.parse(req.body);
  const [row] = await db
    .insert(conversations)
    .values({
      title: body.title,
      appId: body.appId ?? null,
      systemPrompt: body.systemPrompt ?? null,
    })
    .returning();
  res.status(201).json(row);
});

router.get("/conversations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  res.json({ ...conversation, messages: msgs });
});

router.delete("/conversations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.status(204).end();
});

router.delete("/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(messages).where(eq(messages.conversationId, id));
  res.status(204).end();
});

router.get("/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const body = SendOpenaiMessageBody.parse(req.body);

  // ── Usage check ──────────────────────────────────────────────────────────
  const clientId = (req.headers["x-client-id"] as string) || "anonymous";
  const usage = await getOrCreateUsage(clientId);
  if (!usage.isPro && usage.chatCount >= FREE_CHAT_LIMIT) {
    res.status(429).json({
      error: "limit_reached",
      type: "chat",
      used: usage.chatCount,
      limit: FREE_CHAT_LIMIT,
    });
    return;
  }
  // ─────────────────────────────────────────────────────────────────────────

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const hasImage = !!body.imageBase64;
  const dbContent = hasImage
    ? body.content
      ? `[📷 Obraz dołączony]\n${body.content}`
      : "[📷 Obraz dołączony]"
    : body.content;

  await db.insert(messages).values({
    conversationId: id,
    role: "user",
    content: dbContent,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const [profileInfo, recentSummaries] = await Promise.all([
    getOrCreateProfile(),
    getRecentSummaries(id),
  ]);

  const memoryBlock = [
    profileInfo ? `Profil użytkownika:\n${profileInfo}` : "",
    recentSummaries ? `Wnioski z poprzednich części rozmowy:\n${recentSummaries}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const basePrompt = conversation.systemPrompt ?? defaultSystemPrompt;
  const fullSystemPrompt = memoryBlock
    ? `${basePrompt}\n\n---\n${memoryBlock}`
    : basePrompt;

  // Build history without the last user message (we'll add it with vision format if needed)
  const historyWithoutLast = history.slice(0, -1);

  // Build the last user message — with image if provided
  type OpenAIMessage =
    | { role: "system" | "user" | "assistant"; content: string }
    | { role: "user"; content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> };

  const lastUserMessage: OpenAIMessage = hasImage
    ? {
        role: "user",
        content: [
          { type: "text", text: body.content || "Opisz i przeanalizuj ten obraz." },
          {
            type: "image_url",
            image_url: {
              url: `data:${body.imageMimeType ?? "image/jpeg"};base64,${body.imageBase64}`,
            },
          },
        ],
      }
    : { role: "user", content: body.content };

  const chatMessages: OpenAIMessage[] = [
    { role: "system" as const, content: fullSystemPrompt },
    ...historyWithoutLast.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    lastUserMessage,
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  // Use OpenAI Vision when image is attached; Mistral 7B for text-only
  const stream = hasImage
    ? await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 8192,
        messages: chatMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
        stream: true,
      })
    : await openrouter.chat.completions.create({
        model: "mistralai/mistral-7b-instruct-v0.1",
        max_tokens: 8192,
        messages: chatMessages as Parameters<typeof openrouter.chat.completions.create>[0]["messages"],
        stream: true,
      });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  // Increment chat usage (fire-and-forget)
  incrementChat(clientId).catch(() => {});

  const [savedMsg] = await db
    .insert(messages)
    .values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    })
    .returning();

  res.write(`data: ${JSON.stringify({ done: true, messageId: savedMsg.id })}\n\n`);
  res.end();

  // After streaming: auto-generate summary every 10 messages (non-blocking)
  const totalMessages = history.length + 1;
  if (totalMessages % 10 === 0) {
    const allMsgs = [...history, { role: "assistant", content: fullResponse }];
    generateAndSaveSummary(id, allMsgs).catch(() => {});
  }
});

// Rate a message (1 = thumbs up, -1 = thumbs down)
router.patch("/messages/:id/rating", async (req, res) => {
  const id = Number(req.params.id);
  const { rating } = req.body as { rating: 1 | -1 | null };
  if (rating !== 1 && rating !== -1 && rating !== null) {
    res.status(400).json({ error: "rating must be 1, -1, or null" });
    return;
  }

  const [updated] = await db
    .update(messages)
    .set({ rating })
    .where(eq(messages.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  res.json(updated);
});

// Get conversation summaries
router.get("/conversations/:id/summaries", async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db
    .select()
    .from(summaries)
    .where(eq(summaries.conversationId, id))
    .orderBy(desc(summaries.createdAt));
  res.json(rows);
});

// Get user profile (global memory)
router.get("/profile", async (_req, res) => {
  const [profile] = await db.select().from(profiles).limit(1);
  res.json(profile ?? { info: "" });
});

// Clear user profile
router.delete("/profile", async (_req, res) => {
  await db.delete(profiles);
  res.status(204).end();
});

router.get("/images", async (_req, res) => {
  const rows = await db
    .select()
    .from(generatedImages)
    .orderBy(generatedImages.createdAt);
  res.json(rows);
});

router.post("/images", async (req, res) => {
  const body = GenerateOpenaiImageBody.parse(req.body);

  // ── Usage check ──────────────────────────────────────────────────────────
  const clientId = (req.headers["x-client-id"] as string) || "anonymous";
  const usage = await getOrCreateUsage(clientId);
  if (!usage.isPro && usage.imageCount >= FREE_IMAGE_LIMIT) {
    res.status(429).json({
      error: "limit_reached",
      type: "image",
      used: usage.imageCount,
      limit: FREE_IMAGE_LIMIT,
    });
    return;
  }
  // ─────────────────────────────────────────────────────────────────────────

  const size = (body.size ?? "1024x1024") as "1024x1024" | "512x512" | "256x256";

  const buffer = await generateImageBuffer(body.prompt, size);
  const b64Data = buffer.toString("base64");

  const [row] = await db
    .insert(generatedImages)
    .values({ prompt: body.prompt, size, b64Data })
    .returning();

  // Increment image usage (fire-and-forget)
  incrementImage(clientId).catch(() => {});

  res.status(201).json(row);
});

router.delete("/images/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(generatedImages).where(eq(generatedImages.id, id));
  res.status(204).end();
});

// ── Usage status endpoint ────────────────────────────────────────────────────
router.get("/usage", async (req, res) => {
  const clientId = (req.headers["x-client-id"] as string) || "anonymous";
  const usage = await getOrCreateUsage(clientId);
  res.json({
    isPro: !!usage.isPro,
    chat: { used: usage.chatCount, limit: FREE_CHAT_LIMIT },
    images: { used: usage.imageCount, limit: FREE_IMAGE_LIMIT },
    date: usage.date,
  });
});

export default router;
