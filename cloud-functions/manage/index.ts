/**
 * Document Management — list, get, delete, edit documents in the knowledge base.
 *
 * Accepts POST with `action` field:
 * - action: "list" + optional category → return all docs (or filtered)
 * - action: "get" + docId + category → return doc content + summary
 * - action: "delete" + docId + category → remove doc
 * - action: "edit" + docId + category + content + title → update content, regenerate summary
 */
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createLogger, createModel } from "../../agents/_shared";
import {
  getAllSummaries,
  getDocContent,
  removeDoc,
  saveDoc,
  type DocCategory,
} from "../../lib/doc-store";

const logger = createLogger("manage");

const VALID_CATEGORIES: DocCategory[] = ["faq", "policy", "product", "order_doc"];

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Regenerate summary for updated content.
 */
async function regenerateSummary(
  content: string,
  filename: string,
  category: string
): Promise<{ summary: string; keywords: string[] }> {
  const model = createModel();
  const truncated = content.length > 8000 ? content.slice(0, 8000) + "\n...[truncated]" : content;

  const response = await model.invoke([
    new SystemMessage(`你是一个文档摘要助手。给定一个文档，生成：
1. 简明摘要（200字以内），概述核心内容和用途。
2. 5-10个关键词，涵盖文档的主要主题。

文档分类：${category}

输出严格 JSON 格式（不含其他文本）：
{"summary": "...", "keywords": ["关键词1", "关键词2", ...]}`),
    new HumanMessage(`文件名: ${filename}\n\n文档内容:\n${truncated}`),
  ]);

  const text = typeof response.content === "string" ? response.content : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || text.slice(0, 400),
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    }
  } catch {}

  return { summary: text.slice(0, 400), keywords: [] };
}

export async function onRequest(context: any) {
  const { request } = context;
  const body = request?.body ?? {};
  const { action, category, docId, content, title } = body;

  if (!action) {
    return jsonResponse({ error: "Missing action field" }, 400);
  }

  try {
    switch (action) {
      // ─── List Documents ───
      case "list": {
        if (category && !VALID_CATEGORIES.includes(category)) {
          return jsonResponse({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, 400);
        }
        const summaries = await getAllSummaries(category);
        return jsonResponse({
          success: true,
          documents: summaries,
          total: summaries.length,
        });
      }

      // ─── Get Document ───
      case "get": {
        if (!docId || !category) {
          return jsonResponse({ error: "Missing docId or category" }, 400);
        }
        const docContent = await getDocContent(category, docId);
        if (!docContent) {
          return jsonResponse({ error: `Document not found: ${category}/${docId}` }, 404);
        }
        // Also get the summary for metadata
        const allSummaries = await getAllSummaries(category);
        const summary = allSummaries.find(s => s.docId === docId) || null;

        return jsonResponse({
          success: true,
          docId,
          category,
          content: docContent,
          summary: summary?.summary || "",
          keywords: summary?.keywords || [],
          filename: summary?.filename || "",
          charCount: docContent.length,
        });
      }

      // ─── Delete Document ───
      case "delete": {
        if (!docId || !category) {
          return jsonResponse({ error: "Missing docId or category" }, 400);
        }
        const deleted = await removeDoc(category, docId);
        if (!deleted) {
          return jsonResponse({ error: `Failed to delete document: ${category}/${docId}` }, 404);
        }
        logger.log(`Deleted document: ${category}/${docId}`);
        return jsonResponse({ success: true, docId, category });
      }

      // ─── Edit Document ───
      case "edit": {
        if (!docId || !category || !content) {
          return jsonResponse({ error: "Missing docId, category, or content" }, 400);
        }
        if (!VALID_CATEGORIES.includes(category)) {
          return jsonResponse({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, 400);
        }

        const docFilename = title || `${docId}.txt`;

        // Remove old doc and re-save
        await removeDoc(category, docId);

        // Regenerate summary
        logger.log(`Regenerating summary for ${category}/${docId}...`);
        const { summary, keywords } = await regenerateSummary(content, docFilename, category);

        // Save updated document
        await saveDoc(category as DocCategory, docId, docFilename, content, summary, keywords);

        logger.log(`Updated document: ${category}/${docId}`);
        return jsonResponse({
          success: true,
          docId,
          category,
          filename: docFilename,
          summary,
          keywords,
          charCount: content.length,
        });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}. Supported: list, get, delete, edit` }, 400);
    }
  } catch (e) {
    logger.error(`Manage error (${action}):`, (e as Error).message);
    return jsonResponse({ error: (e as Error).message }, 500);
  }
}
