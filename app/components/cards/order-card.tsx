/**
 * Order detail card — shows order info, items, status, tracking.
 */

interface OrderItem {
  name: string;
  specs: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  trackingNumber?: string;
  carrier?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "待发货", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  shipped: { label: "运输中", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  delivered: { label: "已签收", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  refund_requested: { label: "退款申请中", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  refund_approved: { label: "退款已批准", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  refund_completed: { label: "退款完成", color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
  exchange_requested: { label: "换货申请中", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  exchange_shipped: { label: "换货已寄出", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

export function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">{order.orderId}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.specs} x{item.quantity}</p>
            </div>
            <span className="text-sm font-medium text-gray-700">¥{item.price}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">合计</span>
          <span className="font-semibold text-gray-900">¥{order.totalAmount}</span>
        </div>
        {order.trackingNumber && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>物流</span>
            <span>{order.carrier} {order.trackingNumber}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-400">
          <span>下单时间</span>
          <span>{new Date(order.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>
      </div>
    </div>
  );
}
