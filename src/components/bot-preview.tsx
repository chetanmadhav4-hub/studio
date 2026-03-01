
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Send, 
  Bot, 
  MousePointer2, 
  LogIn,
  Loader2,
  Check,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { processBotMessage } from "@/lib/bot-logic";
import { UserSession } from "@/lib/bot-types";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

interface BotPreviewProps {
  isAppMode?: boolean;
}

export function BotPreview({ isAppMode = false }: BotPreviewProps) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Send 'Hi' to start the bot! 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [formLink, setFormLink] = useState("");
  const [formUtr, setFormUtr] = useState("");

  const sessionRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'botSessions', user.uid);
  }, [db, user]);

  const { data: sessionData } = useDoc(sessionRef);

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
    setInput("");
    
    if (!isInternalSubmission) {
      setMessages((prev) => [...prev, { role: "user", text: messageToSend }]);
    }
    
    setLoading(true);

    try {
      let currentSession: UserSession = sessionData || {
        phoneNumber: user.uid,
        state: 'START',
        lastMessage: '',
        data: {},
        updatedAt: Date.now(),
      };

      const { reply, nextState } = await processBotMessage(currentSession, messageToSend);

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);

      const updatedSession = {
        ...currentSession,
        ...nextState,
        lastMessage: messageToSend,
        updatedAt: Date.now(),
      };

      if (sessionRef) {
        await setDoc(sessionRef, updatedSession);
      }

      if (updatedSession.state === 'ORDER_PLACED' && updatedSession.data?.orderId) {
        const orderId = updatedSession.data.orderId;
        const orderPayload = {
          id: orderId,
          phoneNumber: user.uid,
          serviceName: updatedSession.data.serviceName,
          quantity: updatedSession.data.quantity,
          price: updatedSession.data.price,
          targetLink: updatedSession.data.targetLink,
          utrId: updatedSession.data.utrId,
          status: 'PROCESSING',
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid, 'orders', orderId), orderPayload);
        await setDoc(doc(db, 'all_orders', orderId), orderPayload);
      }

      if (isInternalSubmission) {
        setFormLink("");
        setFormUtr("");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Technical issue. Try 'MENU' to reset." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const upiRegex = /upi:\/\/pay\S+/;
    const formTag = "[PAYMENT_FORM]";
    const whatsappTagRegex = /\[WHATSAPP_ADMIN:(.+?)\]/;
    
    const hasForm = text.includes(formTag);
    const whatsappMatch = text.match(whatsappTagRegex);
    
    let cleanText = text.replace(formTag, "").replace(whatsappTagRegex, "").trim();

    const upiMatch = cleanText.match(upiRegex);
    const upiLink = upiMatch ? upiMatch[0] : null;

    const lines = cleanText.split("\n");
    const optionLines = lines.filter(line => line.startsWith("OPTION: "));
    const otherLines = lines.filter(line => !line.startsWith("OPTION: ") && !line.match(upiRegex));

    const content = otherLines.map((line, idx) => {
      const matches = line.match(urlRegex);
      if (matches) {
        const imageUrl = matches[0];
        const isImageUrl = imageUrl.includes("api.qrserver.com") || imageUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);
        if (isImageUrl) {
          const textBeforeUrl = line.replace(imageUrl, "").trim();
          return (
            <div key={idx} className="my-2 flex flex-col gap-2">
              {textBeforeUrl && <div className="leading-relaxed font-bold text-slate-800 dark:text-zinc-100">{textBeforeUrl}</div>}
              <div className="bg-white p-2 rounded-xl border shadow-md max-w-[180px] mx-auto text-center">
                <img src={imageUrl} alt="QR Code" className="rounded-lg w-full h-auto" />
                {upiLink && (
                  <a href={upiLink} className="mt-3 flex items-center justify-center gap-2 bg-[#00A884] text-white py-2 rounded-lg text-[10px] font-black uppercase no-underline shadow-sm active:scale-95 transition-transform">
                    <Check className="w-3.5 h-3.5" /> Pay via UPI
                  </a>
                )}
              </div>
            </div>
          );
        }
      }
      if (line.trim() === "") return <div key={idx} className="h-1" />;
      // IMPROVED: Using white/silver text for visibility in dark mode
      return <div key={idx} className="leading-relaxed mb-1 text-slate-800 dark:text-zinc-100 font-semibold">{line.replace(/\*/g, '')}</div>;
    });

    return (
      <div className="flex flex-col gap-1">
        <div className="text-[13px]">{content}</div>
        
        {whatsappMatch && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase text-center dark:text-zinc-400">Send Order Details to Admin</p>
            <a 
              href={`https://wa.me/919116399517?text=${whatsappMatch[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 font-black text-[11px] rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 no-underline uppercase"
            >
              <MessageCircle className="w-4 h-4" /> Send via WhatsApp
            </a>
          </div>
        )}

        {hasForm && (
          <div className="mt-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border-2 border-primary/20 shadow-lg space-y-3">
            <Input 
              placeholder="Instagram Link" 
              className="h-8 text-[11px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" 
              value={formLink} 
              onChange={(e) => setFormLink(e.target.value)} 
            />
            <Input 
              placeholder="12-Digit UTR ID" 
              className="h-8 text-[11px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" 
              value={formUtr} 
              onChange={(e) => setFormUtr(e.target.value)} 
              maxLength={12} 
            />
            <Button 
              size="sm" 
              className="w-full bg-[#00A884] hover:bg-[#008F6F] h-8 text-[11px] font-black uppercase" 
              onClick={() => handleSend(`SUBMIT_PAYMENT:${formLink}|${formUtr}`)} 
              disabled={!formLink || formUtr.length < 12}
            >
              🚀 SUBMIT ORDER
            </Button>
          </div>
        )}

        {optionLines.map((optLine, i) => {
          const optionText = optLine.replace("OPTION: ", "").trim();
          return (
            <button key={i} onClick={() => handleSend(optionText)} className="mt-2 w-full py-2 px-4 font-bold text-[11px] rounded-xl border-2 bg-white dark:bg-zinc-900 text-primary dark:text-accent border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
              <MousePointer2 className="w-3.5 h-3.5" /> {optionText}
            </button>
          );
        })}
      </div>
    );
  };

  if (isUserLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn(
      "relative w-full h-full flex flex-col bg-[#E5DDD5] dark:bg-zinc-950 overflow-hidden",
      !isAppMode && "max-w-[340px] h-full mx-auto rounded-[2.5rem] border-[8px] border-zinc-800 dark:border-zinc-700 p-1 shadow-2xl"
    )}>
      <div className="bg-[#075E54] dark:bg-zinc-900 text-white py-3 px-4 flex items-center gap-3 shrink-0 shadow-md">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/10">
          <Bot className="w-6 h-6" />
        </div>
        <div className="text-left flex-1">
          <h2 className="text-sm font-black text-white leading-none">InstaFlow Bot</h2>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-[10px] text-emerald-100 font-bold">Online</p>
          </div>
        </div>
        {!isAppMode && (
          <Link href="/login">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <LogIn className="w-5 h-5" />
            </Button>
          </Link>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:bg-blend-multiply dark:bg-zinc-950 scroll-smooth custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-md",
              msg.role === "user" 
                ? "bg-[#DCF8C6] dark:bg-emerald-900 text-slate-900 dark:text-emerald-50 rounded-tr-none" 
                : "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-tl-none border dark:border-zinc-700"
            )}>
              {renderMessageContent(msg.text)}
              <div className="text-[9px] mt-1 text-right opacity-40 font-bold uppercase">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[10px] font-bold italic opacity-60 dark:text-zinc-400 animate-pulse">
            <Bot className="w-3 h-3" /> Processing...
          </div>
        )}
      </div>

      <div className="p-3 bg-[#F0F2F5] dark:bg-zinc-900 flex gap-2 border-t dark:border-zinc-800 shrink-0 shadow-lg">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleSend()} 
          placeholder={user ? "Type a message..." : "Please Login to Chat"} 
          disabled={!user} 
          className="bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 rounded-2xl h-11 px-4 text-xs font-bold" 
        />
        <Button onClick={() => handleSend()} disabled={loading || !user} size="icon" className="rounded-full bg-[#00A884] hover:bg-[#008F6F] h-11 w-11 shrink-0 shadow-lg active:scale-90 transition-transform">
          <Send className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
