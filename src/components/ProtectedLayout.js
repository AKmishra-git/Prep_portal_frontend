import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function ProtectedLayout() {
  const loc = useLocation();
  // Pass route as context to chatbot so it can be topic-aware.
  const parts = loc.pathname.split("/").filter(Boolean);
  let context = null;
  if (parts[0] === "subject" && parts[1]) {
    context = `Subject: ${parts[1].toUpperCase()}${parts[2] ? ` / topic: ${decodeURIComponent(parts[2])}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ChatbotWidget context={context} />
    </div>
  );
}
