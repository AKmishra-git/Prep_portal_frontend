import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ChatbotWidget from "@/components/ChatbotWidget";
import { api } from "@/lib/api";

export default function ProtectedLayout() {
  const loc = useLocation();
  const [profileStats, setProfileStats] = useState(null);

  // Pass route as context to chatbot so it can be topic-aware.
  const parts = loc.pathname.split("/").filter(Boolean);
  let context = null;
  if (parts[0] === "subject" && parts[1]) {
    context = `Subject: ${parts[1].toUpperCase()}${parts[2] ? ` / topic: ${decodeURIComponent(parts[2])}` : ""}`;
  }

  // ✅ Fetch profile stats once so ChatbotWidget can use them for Study Plan
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/prep/progress/dashboard");
        if (res.data?.success) setProfileStats(res.data);
      } catch (err) {
        console.error("Failed to fetch profile stats for chatbot:", err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {/* ✅ profileStats passed so AI can generate personalized study plan */}
      <ChatbotWidget context={context} profileStats={profileStats} />
    </div>
  );
}