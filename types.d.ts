// Type declarations for external packages that are dynamically loaded or injected at deploy time.

declare module "@edgeone/pages-blob" {
  interface BlobStore {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ blobs: Array<{ key: string }> }>;
  }

  interface GetStoreOptions {
    name: string;
    projectId?: string;
    token?: string;
  }

  export function getStore(nameOrOptions: string | GetStoreOptions): BlobStore;
}

declare module "pdf-parse" {
  interface PdfResult { text: string; numpages: number; }
  function pdfParse(buffer: Buffer): Promise<PdfResult>;
  export default pdfParse;
}

declare module "mammoth" {
  export function extractRawText(options: { buffer: Buffer }): Promise<{ value: string }>;
}

declare module "xlsx" {
  export function read(data: Buffer, options?: any): any;
  export const utils: { sheet_to_csv(sheet: any): string };
}

declare module "jszip" {
  interface JSZipFile { async(type: "text"): Promise<string>; }
  interface JSZip {
    loadAsync(data: Buffer): Promise<JSZip>;
    file(name: string): JSZipFile | null;
  }
  const jszip: { loadAsync(data: Buffer): Promise<JSZip> };
  export default jszip;
}
