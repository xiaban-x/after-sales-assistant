/**
 * FAQ sources card — shows which policy documents were referenced.
 */

interface FaqSource {
  id: string;
  title: string;
  category: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  refund: "💰",
  exchange: "🔄",
  shipping: "🚚",
  warranty: "🛡️",
  general: "📋",
};

export function FaqCard({ sources }: { sources: FaqSource[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden max-w-sm">
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
        <span className="text-xs font-medium text-blue-700">📚 参考文档</span>
      </div>
      <div className="px-4 py-2 space-y-1">
        {sources.map(source => (
          <div key={source.id} className="flex items-center gap-2 text-xs">
            <span>{CATEGORY_ICONS[source.category] || "📄"}</span>
            <span className="text-gray-700">{source.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
