
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
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
            <div key={idx} className="my-2 flex flex-col gap-2">
              {textBeforeUrl && <div className="leading-relaxed font-semibold text-foreground dark:text-zinc-100">{textBeforeUrl}</div>}
              <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg border shadow-sm max-w-[180px] mx-auto text-center">
                <img src={imageUrl} alt="QR Code" className="rounded-md w-full h-auto bg-white" />
                {upiLink && (
                  <a href={upiLink} className="mt-2 flex items-center justify-center gap-1 bg-[#00A884] text-white py-1.5 rounded-md text-[10px] font-bold uppercase no-underline">
                    <ExternalLink className="w-3 h-3" /> Pay Now
                  </a>
                )}
              </div>
            </div>
          );
        }
      }
      if (line.trim() === "") return <div key={idx} className="h-0.5" />;
      return <div key={idx} className="leading-relaxed mb-1 text-foreground dark:text-zinc-100 font-medium">{line.replace(/\*/g, '')}</div>;
    });

    return (
      <div className="flex flex-col gap-0.5">
        <div className="text-[12px] md:text-[13px]">{content}</div>
        {hasForm && (
          <div className="mt-2 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-primary/20 shadow-sm space-y-2">
            <Input placeholder="Instagram Link" className="h-7 text-[10px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" value={formLink} onChange={(e) => setFormLink(e.target.value)} />
            <Input placeholder="UTR ID (12 Digits)" className="h-7 text-[10px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" value={formUtr} onChange={(e) => setFormUtr(e.target.value)} maxLength={12} />
            <Button size="sm" className="w-full bg-[#00A884] hover:bg-[#008F6F] h-7 text-[10px] font-bold" onClick={() => handleSend(`SUBMIT_PAYMENT:${formLink}|${formUtr}`)} disabled={!formLink || formUtr.length < 12}>
              🚀 SUBMIT ORDER
            </Button>
          </div>
        )}
        {optionLines.map((optLine, i) => {
          const optionText = optLine.replace("OPTION: ", "").trim();
          return (
            <button key={i} onClick={() => handleSend(optionText)} className="mt-1 w-full py-1.5 px-3 font-bold text-[11px] rounded-md border bg-white dark:bg-zinc-900 text-[#00A884] border-[#00A884]/20 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs">
              <MousePointer2 className="w-3 h-3" /> {optionText}
            </button>
          );
        })}
      </div>
    );
  };

  if (isUserLoading) {
    return (
      <div className="h-[520px] w-full max-w-[340px] mx-auto flex items-center justify-center bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border-8 border-zinc-200 dark:border-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[340px] h-[520px] bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] p-3 shadow-2xl border-[6px] border-zinc-300 dark:border-zinc-700">
      <Card className="w-full h-full flex flex-col bg-[#E5DDD5] dark:bg-zinc-950 rounded-[1.8rem] overflow-hidden border-none shadow-none">
        <CardHeader className="bg-[#075E54] dark:bg-zinc-900 text-white py-2.5 px-3 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-left">
              <CardTitle className="text-xs font-bold text-white">InstaFlow Bot</CardTitle>
              <p className="text-[9px] text-emerald-100 font-medium">Online</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:bg-blend-overlay dark:bg-zinc-950 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-xl px-2.5 py-1.5 text-xs shadow-xs ${
                msg.role === "user" 
                  ? "bg-[#DCF8C6] dark:bg-emerald-900 text-foreground dark:text-emerald-50 rounded-tr-none" 
                  : "bg-white dark:bg-zinc-800 text-foreground dark:text-zinc-100 rounded-tl-none"
              }`}>
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {!user && (
            <div className="flex justify-center pt-4">
              <Link href="/login">
                <Button size="sm" className="h-8 text-[10px] gap-1.5 rounded-full font-bold shadow-md">
                  <LogIn className="w-3 h-3" /> Login to Order
                </Button>
              </Link>
            </div>
          )}
          {loading && <div className="text-[10px] italic opacity-50 dark:text-zinc-400">Typing...</div>}
        </CardContent>
        <div className="p-2 bg-[#F0F2F5] dark:bg-zinc-900 flex gap-1.5 border-t dark:border-zinc-800 shrink-0">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
            placeholder={user ? "Message..." : "Login First"} 
            disabled={!user} 
            className="bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 rounded-full h-8 px-3 text-[11px]" 
          />
          <Button onClick={() => handleSend()} disabled={loading || !user} size="icon" className="rounded-full bg-[#00A884] h-8 w-8 shrink-0">
            <Send className="w-3.5 h-3.5 text-white" />
          </Button>
        </div>
      </Card>
      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-400 dark:bg-zinc-600 rounded-full opacity-50"></div>
    </div>
  );
}
