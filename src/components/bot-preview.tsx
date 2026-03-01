
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
  MessageCircle,
  Download,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { processBotMessage } from "@/lib/bot-logic";
import { UserSession } from "@/lib/bot-types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

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

  const qrImage = PlaceHolderImages.find(img => img.id === 'slice-payment-qr');

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
    const formTag = "[PAYMENT_FORM]";
    const qrTag = "[PAYMENT_QR]";
    const whatsappTagRegex = /\[WHATSAPP_ADMIN:(.+?)\]/;
    
    const hasForm = text.includes(formTag);
    const hasQR = text.includes(qrTag);
    const whatsappMatch = text.match(whatsappTagRegex);
    
    let cleanText = text.replace(formTag, "").replace(qrTag, "").replace(whatsappTagRegex, "").trim();

    const lines = cleanText.split("\n");
    const optionLines = lines.filter(line => line.startsWith("OPTION: "));
    const otherLines = lines.filter(line => !line.startsWith("OPTION: "));

    const content = otherLines.map((line, idx) => {
      if (line.trim() === "" && idx !== otherLines.length - 1) return <div key={idx} className="h-2" />;
      return (
        <div key={idx} className="leading-relaxed text-slate-900 dark:text-zinc-50 font-black whitespace-pre-wrap">
          {line.replace(/\*/g, '')}
        </div>
      );
    });

    return (
      <div className="flex flex-col gap-1.5">
        <div className="text-[13px] flex flex-col">{content}</div>
        
        {hasQR && qrImage && (
          <div className="mt-4 flex flex-col items-center gap-3 w-full">
            <div className="relative w-64 aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-white">
              <Image 
                src={qrImage.imageUrl} 
                alt="Payment QR" 
                fill 
                className="object-contain p-2"
                data-ai-hint={qrImage.imageHint}
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button asChild variant="default" className="w-full h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest gap-2 bg-primary text-white hover:bg-primary/90 shadow-xl active:scale-95 transition-all">
                <a href={qrImage.imageUrl} download="InstaFlow_QR.png">
                  <Download className="w-4 h-4" /> Download QR Code
                </a>
              </Button>
            </div>
          </div>
        )}

        {whatsappMatch && (
          <div className="mt-5 space-y-3">
            <p className="text-[10px] font-black text-primary dark:text-accent uppercase text-center tracking-[0.15em] px-2 opacity-90 leading-snug">
              Send Order Details to Admin and conform your order
            </p>
            <a 
              href={`https://wa.me/918239914751?text=${whatsappMatch[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-5 font-black text-[13px] rounded-2xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-2xl active:scale-95 no-underline uppercase tracking-tight"
            >
              <MessageCircle className="w-5 h-5" /> Send via WhatsApp
            </a>
          </div>
        )}

        {hasForm && (
          <div className="mt-5 p-5 bg-slate-100 dark:bg-zinc-800/80 rounded-[2rem] border-2 border-primary/10 shadow-xl space-y-4">
            <Input 
              placeholder="Instagram Profile/Post Link" 
              className="h-12 text-[11px] font-black dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-50 rounded-xl focus:ring-primary placeholder:text-zinc-400" 
              value={formLink} 
              onChange={(e) => setFormLink(e.target.value)} 
            />
            <Input 
              placeholder="12-Digit Payment UTR ID" 
              className="h-12 text-[11px] font-black dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-50 rounded-xl focus:ring-primary placeholder:text-zinc-400" 
              value={formUtr} 
              onChange={(e) => setFormUtr(e.target.value)} 
              maxLength={12} 
            />
            <Button 
              size="sm" 
              className="w-full bg-[#00A884] hover:bg-[#008F6F] h-12 text-[12px] font-black uppercase tracking-wider rounded-xl shadow-xl" 
              onClick={() => handleSend(`SUBMIT_PAYMENT:${formLink}|${formUtr}`)} 
              disabled={!formLink || formUtr.length < 12}
            >
              🚀 SUBMIT ORDER NOW
            </Button>
          </div>
        )}

        {optionLines.map((optLine, i) => {
          const optionText = optLine.replace("OPTION: ", "").trim();
          return (
            <button key={i} onClick={() => handleSend(optionText)} className="mt-2.5 w-full py-4 px-5 font-black text-[12px] rounded-2xl border-2 bg-white dark:bg-zinc-800 text-primary dark:text-accent border-primary/5 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 uppercase tracking-tight">
              <MousePointer2 className="w-4 h-4" /> {optionText}
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
      "relative w-full flex flex-col bg-[#E5DDD5] dark:bg-zinc-950 overflow-hidden",
      isAppMode ? "h-full" : "max-w-[440px] h-[100dvh] mx-auto rounded-[2.5rem] border-[8px] border-zinc-800 dark:border-zinc-700 p-1 shadow-2xl"
    )}>
      <div className="bg-[#075E54] dark:bg-zinc-900 text-white pt-[calc(env(safe-area-inset-top,24px)+12px)] pb-4 px-5 flex items-center gap-3 shrink-0 shadow-md z-20">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/10 shadow-inner">
          <Bot className="w-6 h-6" />
        </div>
        <div className="text-left flex-1">
          <h2 className="text-sm font-black text-white leading-none uppercase tracking-tight">InstaFlow Bot</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <p className="text-[10px] text-emerald-100 font-black uppercase tracking-widest">Active Server</p>
          </div>
        </div>
        {!isAppMode && (
          <Link href="/login">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <LogIn className="w-5 h-5" />
            </Button>
          </Link>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-12 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:bg-blend-multiply dark:bg-zinc-950 scroll-smooth custom-scrollbar z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={cn(
              "max-w-[85%] rounded-[1.5rem] px-5 py-4 text-xs shadow-xl border dark:border-zinc-700",
              msg.role === "user" 
                ? "bg-[#DCF8C6] dark:bg-emerald-900 text-slate-900 dark:text-zinc-50 rounded-tr-none" 
                : "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 rounded-tl-none font-bold"
            )}>
              {renderMessageContent(msg.text)}
              <div className="text-[9px] mt-2.5 text-right opacity-60 font-black uppercase dark:text-zinc-400 tracking-wider">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[10px] font-black italic opacity-70 dark:text-zinc-200 animate-pulse bg-white/60 dark:bg-zinc-800/60 w-fit px-5 py-3 rounded-full shadow-lg border dark:border-zinc-700">
            <Bot className="w-4 h-4" /> Bot is thinking...
          </div>
        )}
      </div>

      <div className="p-3 bg-[#F0F2F5] dark:bg-zinc-900 flex gap-2 border-t dark:border-zinc-800 shrink-0 shadow-2xl z-20 pb-[calc(env(safe-area-inset-bottom,12px)+16px)]">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleSend()} 
          placeholder={user ? "Type a message..." : "Login to use Bot"} 
          disabled={!user} 
          className="bg-white dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700 rounded-2xl h-12 px-5 text-sm font-black placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-inner" 
        />
        <Button onClick={() => handleSend()} disabled={loading || !user} size="icon" className="rounded-full bg-[#00A884] hover:bg-[#008F6F] h-12 w-12 shrink-0 shadow-2xl active:scale-90 transition-all">
          <Send className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
