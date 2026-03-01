"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore } from "@/firebase";
import { 
  Send, 
  Bot, 
  MousePointer2, 
  ExternalLink, 
  LogIn,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export function BotPreview() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Send 'Hi' to start the bot! 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [formLink, setFormLink] = useState("");
  const [formUtr, setFormUtr] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || loading) return;

    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: messageToSend },
        { 
          role: "bot", 
          text: "⚠️ *Access Denied!*\n\nOrder place karne ke liye kripya pehle Login karein.\n\nOPTION: Login Now" 
        }
      ]);
      setInput("");
      return;
    }

    if (messageToSend === "Login Now") {
      router.push("/login");
      return;
    }

    const isInternalSubmission = messageToSend.startsWith("SUBMIT_PAYMENT:");
    if (isInternalSubmission) {
      setFormLink("");
      setFormUtr("");
    }

    setInput("");
    if (!isInternalSubmission) {
      setMessages((prev) => [...prev, { role: "user", text: messageToSend }]);
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry: [{ changes: [{ value: { messages: [{ from: user.uid, text: { body: messageToSend } }] } }] }],
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Error processing. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const upiRegex = /upi:\/\/pay\S+/;
    const formTag = "[PAYMENT_FORM]";
    const hasForm = text.includes(formTag);
    const cleanText = text.replace(formTag, "").trim();

    const upiMatch = cleanText.match(upiRegex);
    const upiLink = upiMatch ? upiMatch[0] : null;

    const lines = cleanText.split("\n");
    const optionLines = lines.filter(line => line.startsWith("OPTION: "));
    const otherLines = lines.filter(line => !line.startsWith("OPTION: ") && !line.startsWith("ADMIN_UPDATE: ") && !line.match(upiRegex));

    const content = otherLines.map((line, idx) => {
      const matches = line.match(urlRegex);
      if (matches) {
        const imageUrl = matches[0];
        const isImageUrl = imageUrl.includes("api.qrserver.com") || imageUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);
        if (isImageUrl) {
          const textBeforeUrl = line.replace(imageUrl, "").trim();
          return (
            <div key={idx} className="my-3 flex flex-col gap-2">
              {textBeforeUrl && <div className="leading-relaxed font-medium text-slate-800 dark:text-zinc-100">{textBeforeUrl}</div>}
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border shadow-lg max-w-[220px] mx-auto text-center">
                <img src={imageUrl} alt="QR Code" className="rounded-lg w-full h-auto bg-white" />
                {upiLink && (
                  <a href={upiLink} className="mt-3 flex items-center justify-center gap-2 bg-[#00A884] text-white py-2 rounded-lg text-xs font-bold uppercase no-underline">
                    <ExternalLink className="w-3 h-3" /> Pay via UPI
                  </a>
                )}
              </div>
            </div>
          );
        }
      }
      if (line.trim() === "") return <div key={idx} className="h-1" />;
      return <div key={idx} className="leading-relaxed mb-1.5 text-slate-800 dark:text-zinc-100">{line.replace(/\*/g, '')}</div>;
    });

    return (
      <div className="flex flex-col gap-1">
        <div className="text-[13px] md:text-sm">{content}</div>
        {hasForm && (
          <div className="mt-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border-2 border-primary/20 shadow-md space-y-3">
            <Input placeholder="Instagram Link" className="h-8 text-xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" value={formLink} onChange={(e) => setFormLink(e.target.value)} />
            <Input placeholder="UTR ID (12 Digits)" className="h-8 text-xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" value={formUtr} onChange={(e) => setFormUtr(e.target.value)} maxLength={12} />
            <Button size="sm" className="w-full bg-[#00A884] hover:bg-[#008F6F] h-8 text-xs font-bold" onClick={() => handleSend(`SUBMIT_PAYMENT:${formLink}|${formUtr}`)} disabled={!formLink || formUtr.length < 12}>
              🚀 SUBMIT ORDER
            </Button>
          </div>
        )}
        {optionLines.map((optLine, i) => {
          const optionText = optLine.replace("OPTION: ", "").trim();
          return (
            <button key={i} onClick={() => handleSend(optionText)} className="mt-2 w-full py-2 px-4 font-semibold text-xs rounded-lg border bg-white dark:bg-zinc-900 text-[#00A884] border-[#00A884]/20 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm">
              <MousePointer2 className="w-4 h-4" /> {optionText}
            </button>
          );
        })}
      </div>
    );
  };

  if (isUserLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col bg-[#E5DDD5] dark:bg-zinc-950 shadow-xl rounded-2xl overflow-hidden border-none transition-all">
      <CardHeader className="bg-[#075E54] dark:bg-zinc-900 text-white py-3 px-4 flex flex-row items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div className="text-left">
            <CardTitle className="text-sm md:text-base font-bold text-white">InstaFlow Bot</CardTitle>
            <p className="text-[10px] text-emerald-100 font-medium">Online</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:bg-blend-overlay dark:bg-zinc-950">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
              msg.role === "user" 
                ? "bg-[#DCF8C6] dark:bg-emerald-900 text-slate-800 dark:text-emerald-50 rounded-tr-none" 
                : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-none"
            }`}>
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}
        {!user && (
          <div className="flex justify-center pt-8">
            <Link href="/login">
              <Button size="sm" className="gap-2 rounded-full font-bold shadow-lg">
                <LogIn className="w-4 h-4" /> Start Ordering Now
              </Button>
            </Link>
          </div>
        )}
        {loading && <div className="text-xs italic opacity-50 dark:text-zinc-400">Bot is thinking...</div>}
      </CardContent>
      <div className="p-3 bg-[#F0F2F5] dark:bg-zinc-900 flex gap-2 border-t dark:border-zinc-800">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleSend()} 
          placeholder={user ? "Type message..." : "Please Login to Chat"} 
          disabled={!user} 
          className="bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 rounded-full h-10 px-4" 
        />
        <Button onClick={() => handleSend()} disabled={loading || !user} size="icon" className="rounded-full bg-[#00A884] h-10 w-10">
          <Send className="w-4 h-4 text-white" />
        </Button>
      </div>
    </Card>
  );
}