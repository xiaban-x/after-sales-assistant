"use client";

import { useState } from "react";
import { ChatPanel } from "./components/chat-panel";
import { ManagePanel } from "./components/manage-panel";

export default function Home() {
  const [showManage, setShowManage] = useState(false);

  return (
    <main className="h-screen flex flex-col bg-[#f7f8fa]">
      {/* Header */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200/80 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AI
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">售后客服助手</h1>
            <p className="text-[11px] text-gray-400 leading-tight">订单查询 · 退货退款 · 换货 · 政策咨询</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManage(!showManage)}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              showManage
                ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-1">📚</span> 知识库
          </button>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            在线
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="flex-1 min-w-0">
          <ChatPanel />
        </div>

        {/* Manage Panel — 贴右边缘，full height */}
        {showManage && (
          <aside className="w-[380px] flex-shrink-0 border-l border-gray-200/80 bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
            <ManagePanel onClose={() => setShowManage(false)} />
          </aside>
        )}
      </div>
    </main>
  );
}
