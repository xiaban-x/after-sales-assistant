/**
 * Exchange confirmation card.
 */

interface Order {
  orderId: string;
  status: string;
  items: Array<{ name: string; specs: string }>;
  exchangeReason?: string;
  updatedAt: string;
}

export function ExchangeCard({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden max-w-sm">
      <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <span className="text-purple-500 text-lg">🔄</span>
          <span className="text-sm font-medium text-purple-800">换货申请</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">订单号</span>
          <span className="font-mono text-gray-700">{order.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">商品</span>
          <span className="text-gray-700">{order.items.map(i => `${i.name}(${i.specs})`).join("、")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">状态</span>
          <span className="text-purple-600 font-medium">
            {order.status === "exchange_shipped" ? "新件已寄出" : "等待审核"}
          </span>
        </div>

        <div className="mt-3 p-2 rounded-lg bg-purple-50 text-xs text-purple-700">
          <p className="font-medium mb-1">换货须知：</p>
          <ul className="list-disc list-inside space-y-0.5 text-purple-600">
            <li>请保持商品全新状态</li>
            <li>附带完整包装和配件</li>
            <li>收到旧件后 3 个工作日内寄出新件</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
