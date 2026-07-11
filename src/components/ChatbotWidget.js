import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Loader2, CalendarDays } from "lucide-react";

// ❌ REMOVED: no more GEMINI_API_KEY or GEMINI_API_URL on the frontend
const CHAT_API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/chat`;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function renderMarkdown(text) {
  if (!text) return null;
  const escape = (s) =>
    s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const blocks = [];
  let work = text.replace(/```([\s\S]*?)```/g, (_m, code) => {
    blocks.push(code);
    return `\u0000${blocks.length - 1}\u0000`;
  });
  work = escape(work)
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[12px]">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 class="text-cyan-300 font-semibold text-sm mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-sm mt-4 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc text-white/80">$1</li>')
    .replace(/\n/g, "<br/>");
  work = work.replace(/\u0000(\d+)\u0000/g, (_m, i) => {
    const code = escape(blocks[parseInt(i, 10)]);
    return `<pre class="my-2 p-3 rounded-md bg-black/60 border border-white/10 overflow-x-auto"><code class="font-mono text-[12px] text-cyan-200 whitespace-pre">${code}</code></pre>`;
  });
  return <div dangerouslySetInnerHTML={{ __html: work }} />;
}

// ✅ Study Plan Modal — unchanged
function StudyPlanModal({ onClose, onGenerate }) {
  const [days, setDays] = useState(7);
  const [interviewDate, setInterviewDate] = useState("");
  const [weakSubjects, setWeakSubjects] = useState([]);

  const subjects = ["DSA", "OOPS", "CN", "OS", "DBMS"];

  const toggleSubject = (s) => {
    setWeakSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleGenerate = () => {
    onGenerate({ days, interviewDate, weakSubjects });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-cyan-400" />
            <h2 className="text-white font-semibold text-base">Generate Study Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10 text-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-white/60 text-xs uppercase tracking-widest mb-1.5 block">
            Interview Date (optional)
          </label>
          <input
            type="date"
            value={interviewDate}
            onChange={(e) => {
              setInterviewDate(e.target.value);
              if (e.target.value) {
                const diff = Math.ceil(
                  (new Date(e.target.value) - new Date()) / (1000 * 60 * 60 * 24)
                );
                if (diff > 0) setDays(diff);
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
          />
        </div>

        <div className="mb-4">
          <label className="text-white/60 text-xs uppercase tracking-widest mb-1.5 block">
            Number of Days: {days}
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <div className="flex justify-between text-white/30 text-xs mt-1">
            <span>1 day</span>
            <span>30 days</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-white/60 text-xs uppercase tracking-widest mb-2 block">
            Weak Subjects (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  weakSubjects.includes(s)
                    ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-2.5 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold text-sm hover:brightness-110 transition-all"
        >
          Generate My Plan ✨
        </button>
      </div>
    </div>
  );
}

export default function ChatbotWidget({ context, profileStats }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [sessionId] = useState(() => `prephub-${uid()}`);

  const [history, setHistory] = useState([]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey 👋 I'm **PrepBuddy**. Ask me anything about DSA, OOPS, CN, OS or DBMS. I can explain concepts, walk through approaches or review code.\n\nOr click **📅 Study Plan** above to get a personalized day-by-day prep plan!",
    },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ✅ Shared helper — calls YOUR backend, not Gemini directly
  const callChatApi = async (updatedHistory, maxOutputTokens) => {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // sends the jwt_token cookie, since this route is authMiddleware-protected
      body: JSON.stringify({
        history: updatedHistory,
        context,
        maxOutputTokens,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.error || "Chat request failed");
    }

    return data.reply;
  };

  const handleStudyPlanGenerate = async ({ days, interviewDate, weakSubjects }) => {
    const subjectProgress =
      profileStats?.stats
        ?.map((s) => `${s.subject}: ${s.watchedVideos}/${s.totalVideos} videos (${s.percent}% done)`)
        .join("\n") || "No progress data available";

    const promptText = `Generate a complete and detailed ${days}-day placement preparation study plan for me.

My current progress:
${subjectProgress}
- Current streak: ${profileStats?.streak ?? 0} days
- Total videos watched: ${profileStats?.totalWatched ?? 0} out of ${profileStats?.totalVideos ?? 0}
${interviewDate ? `- Interview date: ${interviewDate}` : ""}
${weakSubjects.length > 0 ? `- My weak subjects that need more time: ${weakSubjects.join(", ")}` : ""}

Instructions:
- Create a day-by-day plan for all ${days} days. Do not stop early.
- Give more days and time to weak subjects.
- Cover DSA, OOPS, CN, OS, and DBMS across the plan.
- Include specific topics for each day.
- Format EXACTLY like this for every single day:

**Day 1 - [Main Topic]**
- Morning (2hrs): [specific topic to study]
- Afternoon (2hrs): [specific topic to study]
- Evening (2hrs): [practice problems or revision]

**Day 2 - [Main Topic]**
- Morning (2hrs): ...
- Afternoon (2hrs): ...
- Evening (2hrs): ...

Continue this format for all ${days} days without skipping any day.`;

    setMessages((m) => [
      ...m,
      { role: "user", text: `📅 Generate a ${days}-day personalized study plan for me` },
    ]);
    setSending(true);

    const updatedHistory = [...history, { role: "user", parts: [{ text: promptText }] }];

    try {
      const reply = await callChatApi(updatedHistory, 4096);

      setHistory([...updatedHistory, { role: "model", parts: [{ text: reply }] }]);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `⚠️ ${err.message || "I hit a snag reaching the AI. Please try again."}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);

    const updatedHistory = [...history, { role: "user", parts: [{ text }] }];

    try {
      const reply = await callChatApi(updatedHistory, 1024);

      setHistory([...updatedHistory, { role: "model", parts: [{ text: reply }] }]);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `⚠️ ${err.message || "I hit a snag reaching the AI. Please try again in a moment."}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showStudyPlanModal && (
        <StudyPlanModal
          onClose={() => setShowStudyPlanModal(false)}
          onGenerate={handleStudyPlanGenerate}
        />
      )}

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

      <div
        data-testid="chatbot-panel"
        className={`fixed bottom-24 right-6 z-[60] w-[min(92vw,400px)] h-[min(75vh,580px)] flex flex-col rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-300 origin-bottom-right
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStudyPlanModal(true)}
              title="Generate Study Plan"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-medium hover:bg-cyan-400/20 transition-all"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Study Plan
            </button>
            <button
              onClick={() => setOpen(false)}
              data-testid="chatbot-close-button"
              aria-label="Close chatbot"
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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