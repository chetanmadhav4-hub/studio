
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { NotificationBell } from "@/components/notification-bell";
import { Zap, History, Moon, Sun, LayoutGrid, Users, Loader2, Megaphone, X, ArrowRight } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isDark, setIsDark] = useState(false);
  const [isBroadcastDismissed, setIsBroadcastDismissed] = useState(false);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const broadcastRef = useMemoFirebase(() => doc(db, 'settings', 'broadcast'), [db]);
  const { data: broadcast } = useDoc(broadcastRef);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  useEffect(() => {
    if (broadcast?.broadcastMessage && broadcast?.isBroadcastActive) {
      setIsBroadcastDismissed(false);
    }
  }, [broadcast?.broadcastMessage, broadcast?.updatedAt, broadcast?.isBroadcastActive]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background dark:bg-zinc-950 transition-colors duration-300 overflow-hidden font-body relative">
      
      {/* REAL-TIME BROADCAST POPUP */}
      {broadcast?.isBroadcastActive && !isBroadcastDismissed && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[999] animate-in fade-in slide-in-from-top-10 duration-500">
          <div className="bg-primary dark:bg-zinc-900 p-5 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.5)] border-2 border-white/20 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Megaphone className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div className="flex-1 space-y-1.5 pr-7">
              <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em]">Official Announcement</p>
              <p className="text-sm font-black text-white dark:text-zinc-50 leading-snug whitespace-pre-wrap">
                {broadcast.broadcastMessage}
              </p>
            </div>
            <button 
              onClick={() => setIsBroadcastDismissed(true)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-90"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* APP HEADER - FIXED SAFE AREA */}
      <header className="h-32 pt-[calc(env(safe-area-inset-top,24px)+8px)] pb-4 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0 shadow-md z-[100] relative">
        <div className="flex items-center gap-3 mt-auto pb-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tighter text-primary dark:text-accent uppercase italic">InstaFlow</span>
        </div>
        
        <div className="flex items-center gap-2 mt-auto pb-1">
          {!isUserLoading ? (
            <>
              {!user ? (
                <div className="flex items-center gap-2.5">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs h-10 font-black uppercase dark:text-zinc-300">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-[10px] sm:text-xs h-10 font-black px-5 rounded-xl shadow-lg uppercase">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-11 w-11 p-0 rounded-full hover:bg-accent/10 dark:hover:bg-zinc-800 transition-colors"
                    onClick={toggleTheme}
                  >
                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-primary" />}
                  </Button>

                  <NotificationBell />
                  
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="p-0.5 rounded-full border-2 border-primary/20 ml-1 shadow-lg">
                      <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                        <AvatarFallback className="text-[11px] sm:text-[12px] bg-primary text-white font-black">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          )}
        </div>
      </header>

      {/* MOBILE APP INTERFACE */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-start p-0 relative">
        <div className="w-full max-w-[440px] h-full bg-white dark:bg-zinc-900 relative flex flex-col shadow-2xl sm:border dark:border-zinc-800 overflow-hidden">
          
          {isAdmin ? (
            <div className="flex-1 flex flex-col bg-[#F8F9FC] dark:bg-zinc-950 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y h-full custom-scrollbar p-6 sm:p-8 pb-24 space-y-6 sm:space-y-8">
                <div className="space-y-2 mb-3 pt-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-50 uppercase tracking-tighter">Admin Panel</h1>
                  <p className="text-[12px] sm:text-[13px] text-primary dark:text-accent font-black uppercase tracking-widest italic opacity-85">Management Hub</p>
                </div>

                <div className="grid gap-5 sm:gap-6">
                  <Link href="/orders-feed" className="block w-full">
                    <Card className="hover:scale-[1.03] active:scale-95 transition-all border-none shadow-2xl bg-emerald-600 dark:bg-emerald-800 text-white overflow-hidden h-36 sm:h-40 flex items-center cursor-pointer relative group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-7 sm:p-8 flex flex-row items-center gap-6 sm:gap-8 w-full space-y-0">
                        <div className="w-16 h-16 bg-white/20 rounded-[1.8rem] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                          <LayoutGrid className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Live Tracker</CardTitle>
                          <CardDescription className="text-emerald-50 text-[11px] font-black opacity-85 uppercase tracking-widest mt-2">Approve & Reject Orders</CardDescription>
                        </div>
                        <ArrowRight className="w-7 h-7 ml-auto opacity-50 group-hover:translate-x-2 transition-transform" />
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link href="/dashboard/broadcast" className="block w-full">
                    <Card className="hover:scale-[1.03] active:scale-95 transition-all border-none shadow-2xl bg-primary dark:bg-primary/80 text-white overflow-hidden h-36 sm:h-40 flex items-center cursor-pointer relative group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-7 sm:p-8 flex flex-row items-center gap-6 sm:gap-8 w-full space-y-0">
                        <div className="w-16 h-16 bg-white/20 rounded-[1.8rem] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                          <Megaphone className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Broadcast Msg</CardTitle>
                          <CardDescription className="text-blue-50 text-[11px] font-black opacity-85 uppercase tracking-widest mt-2">Real-time Announcements</CardDescription>
                        </div>
                        <ArrowRight className="w-7 h-7 ml-auto opacity-50 group-hover:translate-x-2 transition-transform" />
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link href="/dashboard/users" className="block w-full">
                    <Card className="hover:scale-[1.03] active:scale-95 transition-all border-none shadow-2xl bg-zinc-800 dark:bg-zinc-900 text-white overflow-hidden h-36 sm:h-40 flex items-center border dark:border-zinc-700 cursor-pointer relative group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-7 sm:p-8 flex flex-row items-center gap-6 sm:gap-8 w-full space-y-0">
                        <div className="w-16 h-16 bg-white/20 rounded-[1.8rem] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">All Users</CardTitle>
                          <CardDescription className="text-zinc-300 text-[11px] font-black opacity-85 uppercase tracking-widest mt-2">Database & Contact List</CardDescription>
                        </div>
                        <ArrowRight className="w-7 h-7 ml-auto opacity-50 group-hover:translate-x-2 transition-transform" />
                      </CardHeader>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F0F2F5] dark:bg-zinc-950">
              {/* USER ACTION BAR */}
              {user && (
                <div className="h-12 sm:h-14 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 flex items-center px-6 justify-between shrink-0 shadow-md z-10">
                  <span className="text-[11px] sm:text-[12px] font-black text-primary dark:text-accent uppercase tracking-[0.3em] italic">Automated Assistant</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-10 gap-2.5 text-[11px] sm:text-[12px] font-black hover:bg-primary/5 text-primary dark:text-accent uppercase tracking-wider">
                        <History className="w-5 h-5" /> Recent Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-[3rem] dark:bg-zinc-950 border-none shadow-2xl p-8">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 dark:text-zinc-50 text-xl font-black uppercase tracking-tighter">
                          <History className="w-7 h-7 text-primary" />
                          Order History
                        </DialogTitle>
                      </DialogHeader>
                      <OrderHistory />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* CHAT INTERFACE AREA */}
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <BotPreview isAppMode={true} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* COMPACT APP FOOTER */}
      <footer className="h-16 bg-white dark:bg-zinc-950 border-t dark:border-zinc-900 flex items-center justify-center shrink-0 z-[100] pb-[calc(env(safe-area-inset-bottom,12px)+10px)]">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground dark:text-zinc-500 font-black uppercase tracking-[0.4em] opacity-50">
          instaflow create by chetan nagani
        </p>
      </footer>
    </div>
  );
}
