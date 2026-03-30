import { History } from "lucide-react";
import { MOCK_CONTENT_HISTORY } from "./constants";

export default function HistoryView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <History className="text-red-400" /> История генераций
        </h2>
      </div>
      {MOCK_CONTENT_HISTORY.map((historyItem) => (
        <div
          key={historyItem.id}
          className="bg-dark-800 border border-neutral-800 rounded-3xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-lg">{historyItem.title}</div>
              <div className="text-sm text-neutral-500 mt-1">
                {historyItem.createdAt}
              </div>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-2xl border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
              {historyItem.status}
            </div>
          </div>
          <div className="space-y-3">
            {historyItem.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm ${
                    message.role === "user"
                      ? "bg-red-600 text-white"
                      : "bg-neutral-800 text-neutral-200"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
