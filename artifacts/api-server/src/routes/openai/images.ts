import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, generatedImages } from "@workspace/db";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { GenerateOpenaiImageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const rows = await db
    .select()
    .from(generatedImages)
    .orderBy(generatedImages.createdAt);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const body = GenerateOpenaiImageBody.parse(req.body);
  const size = (body.size ?? "1024x1024") as "1024x1024" | "512x512" | "256x256";

  const buffer = await generateImageBuffer(body.prompt, size);
  const b64Data = buffer.toString("base64");

  const [row] = await db
    .insert(generatedImages)
    .values({ prompt: body.prompt, size, b64Data })
    .returning();

  res.status(201).json(row);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(generatedImages).where(eq(generatedImages.id, id));
  res.status(204).end();
});

export default router;
