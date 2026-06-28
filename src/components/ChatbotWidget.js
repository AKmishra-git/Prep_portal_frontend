import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";

// 🔑 API key loaded from environment variable
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are PrepBuddy, an expert interview preparation assistant for software engineering roles.
You specialize in DSA (Data Structures & Algorithms), OOPs, Computer Networks (CN), Operating Systems (OS), and DBMS.
You explain concepts clearly, walk through problem-solving approaches, and review code when asked.
Keep responses concise, structured, and beginner-friendly unless the user asks for advanced depth.`;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function renderMarkdown(text) {
  if (!text) return null;
  const escape = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const blocks = [];
  let work = text.replace(/```([\s\S]*?)```/g, (_m, code) => {
    blocks.push(code);
    return `\u0000${blocks.length - 1}\u0000`;
  });
  work = escape(work)
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[12px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
  work = work.replace(/\u0000(\d+)\u0000/g, (_m, i) => {
    const code = escape(blocks[parseInt(i, 10)]);
    return `<pre class="my-2 p-3 rounded-md bg-black/60 border border-white/10 overflow-x-auto"><code class="font-mono text-[12px] text-cyan-200 whitespace-pre">${code}</code></pre>`;
  });
  return <div dangerouslySetInnerHTML={{ __html: work }} />;
}

export default function ChatbotWidget({ context }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => `prephub-${uid()}`);

  // Full conversation history for multi-turn context
  const [history, setHistory] = useState([]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey 👋 I'm **PrepBuddy**. Ask me anything about DSA, OOPS, CN, OS or DBMS. I can explain concepts, walk through approaches or review code.",
    },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);

    // Add user message to Gemini history
    const updatedHistory = [
      ...history,
      { role: "user", parts: [{ text }] },
    ];

    try {
      // v1 endpoint doesn't support system_instruction,
      // so we inject the system prompt as the first user/model exchange
      const systemTurn = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + (context ? `\n\nPage context: ${context}` : "") }] },
        { role: "model", parts: [{ text: "Got it! I'm PrepBuddy, ready to help with DSA, OOPs, CN, OS and DBMS." }] },
      ];

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [...systemTurn, ...updatedHistory],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || "Gemini API error");
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I couldn't generate a response.";

      // Save assistant reply into history too (for multi-turn memory)
      setHistory([
        ...updatedHistory,
        { role: "model", parts: [{ text: reply }] },
      ]);

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `⚠️ ${err.message || "I hit a snag reaching the AI. Please try again in a moment."}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        data-testid="chatbot-toggle-button"
        aria-label="Open AI chatbot"
        className={`fixed bottom-24 right-6 z-[60] h-14 w-14 rounded-full grid place-items-center transition-all duration-300
          ${open ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
          bg-gradient-to-br from-cyan-400 to-purple-500 text-black shadow-[0_0_30px_-6px_rgba(0,229,255,0.7)] hover:shadow-[0_0_45px_-4px_rgba(157,78,221,0.7)]`}
      >
        <Bot className="h-6 w-6" strokeWidth={2} />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse ring-2 ring-[#0A0A0A]" />
      </button>

      {/* Panel */}
      <div
        data-testid="chatbot-panel"
        className={`fixed bottom-24 right-6 z-[60] w-[min(92vw,400px)] h-[min(75vh,560px)] flex flex-col rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-300 origin-bottom-right
          ${open ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center">
              <Sparkles className="h-4 w-4 text-black" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <div className="text-white text-sm font-semibold">PrepBuddy</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                gemini · online
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            data-testid="chatbot-close-button"
            aria-label="Close chatbot"
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          data-testid="chatbot-messages"
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              data-testid={`chatbot-message-${m.role}`}
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-white text-black"
                  : "bg-white/5 text-white/90 border border-white/10"
              }`}
            >
              {m.role === "assistant" ? renderMarkdown(m.text) : m.text}
            </div>
          ))}
          {sending && (
            <div className="bg-white/5 border border-white/10 max-w-[60%] rounded-2xl px-3.5 py-2.5 text-white/70 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
            </div>
          )}
        </div>

        <form onSubmit={send} className="border-t border-white/10 p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about arrays, OS scheduling, SQL joins…"
            data-testid="chatbot-input"
            disabled={sending}
            className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-all"
          />
          <button
            type="submit"
            data-testid="chatbot-send-button"
            disabled={sending || !input.trim()}
            className="h-9 w-9 grid place-items-center rounded-md bg-gradient-to-br from-cyan-400 to-purple-500 text-black disabled:opacity-50 hover:brightness-110 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}