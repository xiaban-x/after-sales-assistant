/**
 * Document Store — Multi-category Blob-based storage for after-sales knowledge base.
 *
 * Storage layout (EdgeOne Pages Blob):
 *   aftersales-kb/summary/{category}/{docId}.json → DocSummary
 *   aftersales-kb/docs/{category}/{docId}.txt     → full document content
 *
 * Categories: faq, policy, product, order_doc
 */
import { getStore } from "@edgeone/pages-blob";
import { createLogger } from "../agents/_shared";

const logger = createLogger("doc-store");

// ─── Types ───

export type DocCategory = "faq" | "policy" | "product" | "order_doc";

export interface DocSummary {
  docId: string;
  category: DocCategory;
  filename: string;
  summary: string;
  keywords: string[];
  charCount: number;
  uploadedAt: string;
}

// ─── Blob Access ───

const BLOB_STORE_NAME = "aftersales-kb";

function getBlobStore() {
  const projectId = process.env.PROJECT_ID;
  const token = process.env.EDGEONE_PAGES_API_TOKEN;
  if (projectId && token) {
    return getStore({ name: BLOB_STORE_NAME, projectId, token });
  }
  try {
    return getStore(BLOB_STORE_NAME);
  } catch {
    return null;
  }
}

// ─── List / Query ───

/**
 * Get all summaries, optionally filtered by category.
 * Key format: summary/{category}_{docId}.json (flat, no nested dirs)
 */
export async function getAllSummaries(category?: string): Promise<DocSummary[]> {
  const store = getBlobStore();
  if (!store) return [];

  try {
    const prefix = category ? `summary/${category}_` : "summary/";
    const result = await store.list({ prefix });
    if (result.blobs.length === 0) return [];

    const summaries = await Promise.all(
      result.blobs.map(async (blob) => {
        try {
          const raw = await store.get(blob.key);
          if (!raw) return null;
          return JSON.parse(raw) as DocSummary;
        } catch {
          return null;
        }
      })
    );

    return summaries.filter((s): s is DocSummary => s !== null);
  } catch (e) {
    logger.error("Failed to get summaries:", (e as Error).message);
    return [];
  }
}

// ─── Document Content ───

/**
 * Get full document content by category and docId.
 */
export async function getDocContent(category: string, docId: string): Promise<string | null> {
  const store = getBlobStore();
  if (!store) return null;
  try {
    const raw = await store.get(`docs/${category}_${docId}.txt`);
    return raw || null;
  } catch {
    return null;
  }
}

// ─── Save ───

/**
 * Save a document with its content and summary metadata.
 */
export async function saveDoc(
  category: DocCategory,
  docId: string,
  filename: string,
  content: string,
  summary: string,
  keywords: string[]
): Promise<void> {
  const store = getBlobStore();
  if (!store) throw new Error("Blob store not available");

  // Save document content
  await store.set(`docs/${category}_${docId}.txt`, content);

  // Save summary metadata
  const summaryData: DocSummary = {
    docId,
    category,
    filename,
    summary,
    keywords,
    charCount: content.length,
    uploadedAt: new Date().toISOString(),
  };
  await store.set(`summary/${category}_${docId}.json`, JSON.stringify(summaryData));

  logger.log(`Saved doc: ${filename} (${category}/${docId}), ${content.length} chars`);
}

// ─── Remove ───

/**
 * Remove a document by category and docId.
 */
export async function removeDoc(category: string, docId: string): Promise<boolean> {
  const store = getBlobStore();
  if (!store) return false;

  try {
    await store.delete(`docs/${category}_${docId}.txt`);
    await store.delete(`summary/${category}_${docId}.json`);
    logger.log(`Removed doc: ${category}/${docId}`);
    return true;
  } catch (e) {
    logger.error("Failed to remove doc:", (e as Error).message);
    return false;
  }
}

// ─── Find by Filename ───

/**
 * Find an existing document by filename within a category (for deduplication).
 */
export async function findDocByFilename(category: string, filename: string): Promise<DocSummary | null> {
  const summaries = await getAllSummaries(category);
  return summaries.find((s) => s.filename === filename) || null;
}
