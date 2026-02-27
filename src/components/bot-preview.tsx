
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export function BotPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Send 'Hi' to start the bot! 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
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
                        text: { body: userMsg },
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
        { role: "bot", text: "⚠️ Error processing your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const matches = line.match(urlRegex);
      
      if (matches) {
        // Find any URL that looks like an image
        const imageUrl = matches.find(url => 
          url.includes("placehold.co") || 
          url.includes("picsum.photos") ||
          url.includes("qrserver.com") ||
          url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)
        );

        if (imageUrl) {
          return (
            <div key={idx} className="my-3 flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl border-2 border-primary/10 shadow-sm max-w-[220px]">
                <img 
                  src={imageUrl} 
                  alt="QR Code" 
                  className="rounded-lg w-full h-auto object-contain block"
                  onLoad={() => console.log("Image loaded:", imageUrl)}
                  onError={(e) => {
                    console.error("Image load failed:", imageUrl);
                    // Fallback visual
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>
            </div>
          );
        }
      }

      // Handle standard text lines
      if (line.trim() === "") return <div key={idx} className="h-2" />;
      
      // Basic formatting for WhatsApp bold text
      const formattedLine = line.split(/(\*.*?\*)/g).map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={i}>{part.slice(1, -1)}</strong>;
        }
        return part;
      });

      return <div key={idx} className="min-h-[1.25rem]">{formattedLine}</div>;
    });
  };

  return (
    <Card className="max-w-md mx-auto h-[600px] flex flex-col bg-[#E5DDD5] shadow-2xl rounded-xl overflow-hidden border-none">
      <CardHeader className="bg-[#075E54] text-white py-3 px-4 flex flex-row items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold">InstaFlow Bot</CardTitle>
          <p className="text-xs opacity-70">Online</p>
        </div>
      </CardHeader>
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm whitespace-pre-wrap transition-all duration-300 ${
                msg.role === "user"
                  ? "bg-[#DCF8C6] text-foreground rounded-tr-none"
                  : "bg-white text-foreground rounded-tl-none"
              }`}
            >
              {renderMessageContent(msg.text)}
              <div className="text-[10px] text-muted-foreground text-right mt-1 opacity-70">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 text-sm animate-pulse">
              typing...
            </div>
          </div>
        )}
      </CardContent>
      <div className="p-3 bg-[#F0F2F5] flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="bg-white border-none rounded-full h-10 px-4 focus-visible:ring-0 shadow-sm"
        />
        <Button 
          onClick={handleSend}
          disabled={loading}
          size="icon" 
          className="rounded-full bg-[#00A884] hover:bg-[#008F6F] h-10 w-10 shrink-0"
        >
          <Send className="w-5 h-5 text-white" />
        </Button>
      </div>
    </Card>
  );
}
