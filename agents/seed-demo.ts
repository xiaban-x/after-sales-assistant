/**
 * Seed demo documents into the knowledge base.
 * One-click import of sample after-sales documents.
 */
import { createLogger, createModel, createSSEResponse, sseEvent } from "./_shared";
import { DEMO_DOCS } from "./_data/demo-docs";
import { saveDoc, getAllSummaries } from "../lib/doc-store";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const logger = createLogger("seed-demo");

async function generateSummary(title: string, content: string): Promise<{ summary: string; keywords: string[] }> {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(`为以下文档生成简短摘要（1-2句）和5个关键词。返回JSON：{"summary":"...","keywords":["k1","k2","k3","k4","k5"]}`),
    new HumanMessage(`标题：${title}\n\n内容：${content.slice(0, 1500)}`),
  ]);
  const text = typeof response.content === "string" ? response.content : "";
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { summary: content.slice(0, 100), keywords: [title] };
}

async function* streamSeedDemo(context: any): AsyncGenerator<string> {
  // Check if already seeded
  const existing = await getAllSummaries();
  if (existing.length >= DEMO_DOCS.length) {
    yield sseEvent({ type: "progress", message: "Demo 文档已存在，跳过导入" });
    yield sseEvent({ type: "complete", total: existing.length, skipped: true });
    yield "data: [DONE]\n\n";
    return;
  }

  yield sseEvent({ type: "progress", message: `开始导入 ${DEMO_DOCS.length} 篇示例文档...` });

  let imported = 0;
  for (const doc of DEMO_DOCS) {
    const docId = `demo-${doc.category}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    yield sseEvent({ type: "progress", message: `[${imported + 1}/${DEMO_DOCS.length}] 正在处理: ${doc.title}`, current: imported + 1, total: DEMO_DOCS.length });

    try {
      const { summary, keywords } = await generateSummary(doc.title, doc.content);
      await saveDoc(doc.category, docId, doc.title, doc.content, summary, keywords);
      imported++;
      yield sseEvent({ type: "doc_imported", docId, title: doc.title, category: doc.category, summary });
    } catch (e) {
      logger.error(`Failed to import ${doc.title}:`, (e as Error).message);
      yield sseEvent({ type: "doc_error", title: doc.title, error: (e as Error).message });
    }
  }

  yield sseEvent({ type: "progress", message: `导入完成！共 ${imported} 篇文档` });
  yield sseEvent({ type: "complete", total: imported, skipped: false });
  yield "data: [DONE]\n\n";
}

export async function onRequest(context: any) {
  if (!process.env.AI_GATEWAY_API_KEY || !process.env.AI_GATEWAY_BASE_URL) {
    return new Response(JSON.stringify({ error: "AI Gateway not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.log("Seeding demo documents...");
  const signal = context.request?.signal as AbortSignal | undefined;
  const generator = streamSeedDemo(context);
  return createSSEResponse(generator, signal);
}
