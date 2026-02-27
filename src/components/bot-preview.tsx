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
    // Regex to find a URL in a string
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const matches = line.match(urlRegex);
      
      // Check if any URL in the line is an image or from qrserver
      if (matches) {
        const imageUrl = matches.find(url => 
          url.includes("api.qrserver.com") || 
          url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
        );

        if (imageUrl) {
          return (
            <div key={idx} className="my-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">QR Code:</div>
              <img 
                src={imageUrl} 
                alt="QR Code" 
                className="rounded-lg max-w-full h-auto border-2 border-white shadow-md bg-white p-2 mx-auto inline-block"
              />
            </div>
          );
        }
      }

      return <div key={idx} className={line.trim() === "" ? "h-2" : "min-h-[1.25rem]"}>{line}</div>;
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
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#DCF8C6] text-foreground rounded-tr-none"
                  : "bg-white text-foreground rounded-tl-none"
              }`}
            >
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 text-sm animate-pulse">
              ...
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
          className="bg-white border-none rounded-full h-10 px-4 focus-visible:ring-0"
        />
        <Button 
          onClick={handleSend}
          disabled={loading}
          size="icon" 
          className="rounded-full bg-[#00A884] hover:bg-[#008F6F] h-10 w-10 shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}