# 售后客服助手 - EdgeOne Pages AI Agent Template

基于 [LangGraph](https://langchain-ai.github.io/langgraphjs/) StateGraph 工作流引擎构建的智能售后客服助手，部署在 [EdgeOne Pages](https://edgeone.ai) Agent 平台。支持订单查询、退款/换货申请、知识库问答，并内置可视化知识库管理面板。

## 功能特性

- **LangGraph StateGraph 工作流** — 意图识别 → 路由分发 → 专项节点处理，条件边实现灵活跳转
- **知识库问答（RAG）** — Blob 存储多类别文档（FAQ、政策、产品手册、订单文档），AI 自动检索并生成回答
- **订单全流程处理** — 查询订单状态、申请退款、申请换货，卡片式可视化展示结果
- **多轮上下文连贯** — `pending_action` 机制跨请求传递意图，AI 列出订单列表后用户直接回复订单号即可继续原流程
- **知识库管理面板** — 文档上传/编辑/删除，AI 自动生成摘要与关键词，Tab 补全快速填充
- **一键导入演示数据** — 内置退货政策、FAQ、产品手册示例文档，新用户快速上手
- **卡片式 UI 交互** — 订单详情卡、退款进度卡、换货确认卡、知识库来源卡
- **智能推荐按钮** — 每次回答后根据上下文动态生成快捷操作建议
- **SSE 流式响应** — 实时推送工作流步骤进度和 AI 回复

## 工作流架构

```
START → intent_recognition → [routeByIntent]
  ├── faq_search       → (检索知识库 → 生成回答) → END
  ├── lookup_order     → (查询订单 / 展示列表) → END
  ├── request_refund   → (资格校验 → 提交申请) → END
  ├── request_exchange → (资格校验 → 提交申请) → END
  └── general_chat     → END
```

**跨轮次上下文传递：**
- 当 AI 展示订单列表、等待用户选择时，发送 `pending_action` SSE 事件
- 前端保存 `pendingAction` 状态并附带到下次请求
- `intentRecognition` 节点检测到 `waitingForUser` + 订单号格式 → 跳过 LLM，直接沿用原意图继续流程

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js + React 19 (App Router) |
| 样式 | Tailwind CSS + @tailwindcss/typography |
| Agent 框架 | LangGraph (`@langchain/langgraph`) StateGraph |
| LLM | ChatOpenAI via EdgeOne AI Gateway |
| 知识库存储 | `@edgeone/pages-blob` |
| 状态持久化 | `context.store.langgraphStore` (KV) |
| 流式传输 | Server-Sent Events (SSE) |
| Markdown 渲染 | marked |

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 AI_GATEWAY_API_KEY 和 AI_GATEWAY_BASE_URL

# 启动开发服务器
npx edgeone dev
```

访问 `http://localhost:8088`，点击聊天窗口中的「一键导入演示数据」按钮即可体验完整功能。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `AI_GATEWAY_API_KEY` | 是 | AI Gateway API Key |
| `AI_GATEWAY_BASE_URL` | 是 | AI Gateway 基础 URL |
| `AI_MODEL` | 否 | 模型名称（默认 `@makers/deepseek-v4-flash`） |

> `PROJECT_ID` 和 `EDGEONE_PAGES_API_TOKEN` 在部署环境中自动注入。本地开发如需知识库文档持久化，需在 `.env` 中手动配置。

## 项目结构

```
after-sales-assistant-edgeone/
├── agents/
│   ├── _shared.ts          # 模型初始化、SSE 工具、Order 类型、Blob 存取
│   ├── _data/
│   │   ├── orders.ts       # 演示订单数据 + seedOrders()
│   │   ├── faq.ts          # 演示 FAQ 文档
│   │   └── demo-docs.ts    # 退货政策、产品手册等演示文档
│   ├── _graph/
│   │   ├── state.ts        # AfterSalesState Annotation 定义
│   │   ├── nodes.ts        # 5 个图节点（意图识别、FAQ、订单、退款、换货）
│   │   ├── edges.ts        # 条件路由函数
│   │   └── builder.ts      # StateGraph 编译
│   ├── chat.ts             # 主入口：状态恢复 → 运行图 → SSE 流 → 状态保存
│   ├── manage.ts           # 知识库文档管理（CRUD + AI 摘要再生）
│   ├── upload.ts           # 文档上传 + AI 自动生成摘要关键词
│   ├── seed-demo.ts        # 一键导入演示数据
│   └── stop.ts             # 中断活跃运行
├── app/
│   ├── page.tsx            # 主页面（双面板布局：聊天 + 管理）
│   ├── globals.css         # Tailwind + prose-chat 样式
│   └── components/
│       ├── chat-panel.tsx       # 对话面板（SSE 解析 + 卡片渲染 + 推荐按钮）
│       ├── manage-panel.tsx     # 知识库管理面板（上传/编辑/删除）
│       └── cards/
│           ├── order-card.tsx       # 订单详情卡片
│           ├── refund-card.tsx      # 退款进度卡片
│           ├── exchange-card.tsx    # 换货确认卡片
│           └── faq-card.tsx         # 知识库来源卡片
└── lib/
    └── doc-store.ts        # Blob 文档存储工具（多类别 CRUD + 摘要索引）
```

## 知识库

文档分为四个类别，统一存储在 EdgeOne Pages Blob（`aftersales-kb` bucket）：

| 类别 | 说明 | 示例 |
|------|------|------|
| `faq` | 常见问题解答 | 退货流程、运费政策 |
| `policy` | 售后政策文档 | 退货政策、质保说明 |
| `product` | 产品手册/说明 | 使用说明、规格参数 |
| `order_doc` | 订单文档 | 用户导入的历史订单，filename 为订单号 |

`order_doc` 类别支持直接通过聊天查询 Blob 订单：输入订单号时，若 MOCK 数据中不存在，自动回退查询 Blob，确保知识库导入的订单也能正常触发退款/换货流程。

## SSE 事件协议

```typescript
// 工作流步骤（显示加载进度）
{ type: "workflow_step", step: string, label: string }

// AI 文本回复
{ type: "ai_response", content: string }

// UI 卡片（前端渲染对应组件）
{ type: "card", cardType: "order_detail" | "refund_progress" | "exchange_confirm" | "faq_sources", data: {...} }

// 跨轮次上下文传递（等待用户选择订单号时）
{ type: "pending_action", intent: string }

// 推荐操作按钮
{ type: "suggest_actions", actions: Array<{ id: string, emoji: string, title: string, action?: string }> }

// 心跳 + 完成信号
{ type: "ping", ts: number }
{ type: "status", status: "complete" }
data: [DONE]
```

## EdgeOne Pages 平台能力

| 能力 | API | 用途 |
|------|-----|------|
| Blob 存储 | `@edgeone/pages-blob` | 知识库文档存储（内容 + 摘要索引） |
| KV 存储 | `context.store.langgraphStore.put/get` | 工作流状态 + 订单数据持久化 |
| 消息历史 | `context.store.appendMessage` | 对话记录保存 |
| 运行取消 | `context.utils.abortActiveRun()` | `/stop` 端点 |
| 会话隔离 | `context.conversation_id` | 多用户并发 |
| AI Gateway | `@makers/deepseek-v4-flash` | LLM 调用 |

## 部署

```bash
npx edgeone deploy
```

部署后 Blob 存储、AI Gateway、KV 存储等平台能力自动可用，无需额外配置。

## License

MIT
