/**
 * Mock order data — seeded on first access via langgraphStore.
 */
import type { Order } from "../_shared";

export const MOCK_ORDERS: Order[] = [
  {
    orderId: "ORD-20250520-001",
    userId: "default",
    items: [
      { productId: "P001", name: "无线降噪耳机 Pro", specs: "星空黑 / 主动降噪", quantity: 1, price: 899 },
    ],
    totalAmount: 899,
    status: "delivered",
    createdAt: "2025-05-20T10:30:00Z",
    updatedAt: "2025-05-22T14:00:00Z",
    trackingNumber: "SF1234567890",
    carrier: "顺丰速运",
  },
  {
    orderId: "ORD-20250518-002",
    userId: "default",
    items: [
      { productId: "P002", name: "智能手表 Ultra", specs: "钛金属 / 49mm", quantity: 1, price: 3999 },
      { productId: "P003", name: "表带（尼龙）", specs: "午夜蓝", quantity: 2, price: 129 },
    ],
    totalAmount: 4257,
    status: "shipped",
    createdAt: "2025-05-18T08:00:00Z",
    updatedAt: "2025-05-19T16:30:00Z",
    trackingNumber: "YT9876543210",
    carrier: "圆通快递",
  },
  {
    orderId: "ORD-20250515-003",
    userId: "default",
    items: [
      { productId: "P004", name: "机械键盘 K8", specs: "红轴 / 87键 / 白色", quantity: 1, price: 599 },
    ],
    totalAmount: 599,
    status: "delivered",
    createdAt: "2025-05-15T12:00:00Z",
    updatedAt: "2025-05-17T09:00:00Z",
    trackingNumber: "ZT1122334455",
    carrier: "中通快递",
  },
  {
    orderId: "ORD-20250510-004",
    userId: "default",
    items: [
      { productId: "P005", name: "便携充电宝 20000mAh", specs: "白色 / 65W快充", quantity: 1, price: 299 },
      { productId: "P006", name: "Type-C 数据线", specs: "1.5m / 编织", quantity: 3, price: 39 },
    ],
    totalAmount: 416,
    status: "pending",
    createdAt: "2025-05-10T18:00:00Z",
    updatedAt: "2025-05-10T18:00:00Z",
  },
];

/** Seed mock orders into store if not already present */
export async function seedOrders(context: any): Promise<void> {
  const existing = await context.store.langgraphStore.get(["aftersales", "orders"], MOCK_ORDERS[0].orderId).catch(() => null);
  if (existing?.value) return; // Already seeded

  for (const order of MOCK_ORDERS) {
    await context.store.langgraphStore.put(["aftersales", "orders"], order.orderId, { ...order }).catch(() => {});
  }
}
