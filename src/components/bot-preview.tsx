"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { Send, Bot, MousePointer2, ExternalLink, LogIn } from "lucide-react";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export function BotPreview() {
  const { user } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Send 'Hi' to start the bot! 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || loading) return;

    // Check if user is logged in
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: messageToSend },
        { 
          role: "bot", 
          text: "⚠️ *Access Denied!*\n\nOrder place karne ke liye kripya pehle Login karein ya Naya account banayein.\n\nOPTION: Login Now\nOPTION: Create Account" 
        }
      ]);
      setInput("");
      return;
    }

    // Handle Auth Redirections from simulated buttons
    if (messageToSend === "Login Now") {
      router.push("/login");
      return;
    }
    if (messageToSend === "Create Account") {
      router.push("/signup");
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: messageToSend }]);
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [
                      {
                        from: "demo_user",
                        text: { body: messageToSend },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error processing your request. Server may be starting up." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const upiRegex = /upi:\/\/pay\S+/;
    
    const upiMatch = text.match(upiRegex);
    const upiLink = upiMatch ? upiMatch[0] : null;

    const lines = text.split("\n");
    const optionLines = lines.filter(line => line.startsWith("OPTION: "));
    const otherLines = lines.filter(line => !line.startsWith("OPTION: ") && !line.match(upiRegex));

    const content = otherLines.map((line, idx) => {
      const matches = line.match(urlRegex);
      
      if (matches) {
        const imageUrl = matches[0];
        const isImageUrl = 
          imageUrl.includes("qrserver.com") || 
          imageUrl.includes("api.qrserver.com") ||
          imageUrl.includes("placehold.co") || 
          imageUrl.includes("picsum.photos") ||
          imageUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);

        if (isImageUrl) {
          const textBeforeUrl = line.replace(imageUrl, "").trim();
          return (
            <div key={idx} className="my-3 flex flex-col gap-2">
              {textBeforeUrl && <div className="leading-relaxed font-medium">{textBeforeUrl}</div>}
              <div className="bg-white p-3 rounded-xl border-2 border-[#075E54]/10 shadow-lg max-w-[240px] mx-auto overflow-hidden text-center">
                <img 
                  src={imageUrl} 
                  alt="QR Code" 
                  className="rounded-lg w-full h-auto block bg-white"
                />
                {upiLink ? (
                  <a 
                    href={upiLink}
                    className="mt-3 flex items-center justify-center gap-2 bg-[#00A884] hover:bg-[#008F6F] text-white py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm transition-all active:scale-95 no-underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Pay via UPI App
                  </a>
                ) : (
                  <div className="text-[10px] text-center mt-3 text-[#075E54] font-bold tracking-widest uppercase bg-[#E7F3F1] py-1.5 rounded">
                    Scan to Pay Now
                  </div>
                )}
              </div>
            </div>
          );
        }
      }

      if (line.trim() === "") return <div key={idx} className="h-1" />;
      
      const formattedLine = line.split(/(\*.*?\*)/g).map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={i} className="font-bold">{part.slice(1, -1)}</strong>;
        }
        return part;
      });

      return <div key={idx} className="leading-relaxed mb-1.5">{formattedLine}</div>;
    });

    return (
      <div className="flex flex-col gap-1">
        <div>{content}</div>
        {optionLines.length > 0 && (
          <div className="mt-3 grid gap-2">
            {optionLines.map((optLine, i) => {
              const optionText = optLine.replace("OPTION: ", "").trim();
              return (
                <button
                  key={i}
                  onClick={() => handleSend(optionText)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#F0F2F5] text-[#00A884] font-semibold text-sm rounded-lg border border-[#00A884]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                >
                  <MousePointer2 className="w-4 h-4" />
                  {optionText}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {!user && mounted && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center p-6 text-center">
          <Card className="bg-white/95 border-none shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Kripya login karein taaki aap bot ke saare features use kar sakein aur orders laga sakein.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/login")} className="w-full">
                  Login Now
                </Button>
                <Button onClick={() => router.push("/signup")} variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card className={`max-w-md mx-auto h-[680px] flex flex-col bg-[#E5DDD5] shadow-2xl rounded-2xl overflow-hidden border-none ring-1 ring-black/5 transition-all ${!user ? 'opacity-50 pointer-events-none grayscale-[30%]' : ''}`}>
        <CardHeader className="bg-[#075E54] text-white py-4 px-5 flex flex-row items-center gap-3 shrink-0 shadow-md relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10 overflow-hidden">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">InstaFlow Bot</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-[11px] font-medium text-emerald-100">Online & active</p>
            </div>
          </div>
        </CardHeader>
        <CardContent 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm relative transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-[#DCF8C6] text-foreground rounded-tr-none"
                    : "bg-white text-foreground rounded-tl-none"
                }`}
              >
                {renderMessageContent(msg.text)}
                {mounted && (
                  <div className="text-[9px] text-muted-foreground/60 text-right mt-1.5 font-medium">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-5 py-2.5 text-sm animate-pulse shadow-sm text-muted-foreground font-medium">
                Bot is thinking...
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-[#F0F2F5] flex gap-3 shrink-0 border-t border-black/5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={user ? "Type a message..." : "Please login to chat"}
            disabled={!user}
            className="bg-white border-none rounded-full h-11 px-5 focus-visible:ring-2 focus-visible:ring-[#075E54]/20 shadow-sm"
          />
          <Button 
            onClick={() => handleSend()}
            disabled={loading || !user}
            size="icon" 
            className="rounded-full bg-[#00A884] hover:bg-[#008F6F] h-11 w-11 shrink-0 shadow-md transition-transform active:scale-95"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
