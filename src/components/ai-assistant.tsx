import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { askAssistant } from "@/lib/ai-assistant.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Rạch Giá có gì đẹp?",
  "Đi 1 ngày nên đi đâu?",
  "Có món ăn đặc sản nào?",
  "Có khách sạn gần đây không?",
  "Có tour phù hợp gia đình không?",
  "Tôi nên đi theo lịch trình nào?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Xin chào! Mình là Trợ lý AI MIỀN TOUR. Mình sẽ trả lời dựa trên dữ liệu địa điểm, tour, nhà xe và hướng dẫn viên có trên website. Bạn muốn hỏi gì nào?",
};

export function AiAssistant() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({
        data: { messages: next.filter((m) => m !== GREETING).slice(-12) },
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Xin lỗi, trợ lý chưa phản hồi được. Bạn thử lại giúp mình nhé.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Trợ lý AI MIỀN TOUR"
        className="animate-fade-in fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-3 text-sm font-bold text-primary-foreground shadow-elevated transition-transform hover:-translate-y-0.5"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="hidden sm:inline">Trợ lý AI MIỀN TOUR</span>
      </button>

      {open && (
        <div className="animate-slide-up fixed inset-x-3 bottom-20 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevated sm:inset-x-auto sm:right-4 sm:w-[380px]">
          <header className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-primary">
                💬 Trợ lý AI MIỀN TOUR
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Trả lời dựa trên dữ liệu của website
              </p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <p className="text-xs text-muted-foreground">Trợ lý đang soạn câu trả lời…</p>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border px-3 py-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn…"
              className="h-11 rounded-2xl"
            />
            <Button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Gửi"
              className="size-11 shrink-0 rounded-2xl p-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
